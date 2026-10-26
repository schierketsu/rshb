# 3. Архитектура и схема интеграции

## 3.1. Компоненты

```mermaid
%%{init: {"flowchart": {"defaultRenderer": "elk"}}}%%
flowchart TB
    subgraph DS["① Diasoft FA#35; Treasury.Back — не дорабатывается"]
        direction LR
        APP["Серверы приложений<br/>сделки · расчёты · учёт"]
        DB[("БД: журнал операций,<br/>статусы, планировщик")]
        REP[("Read-only<br/>реплика БД")]
        APP --- DB -. репликация .-> REP
    end

    subgraph AD["② Integration Adapter · Treasury Event Gateway"]
        direction LR
        SC["Source Connectors<br/>опрос реплики 30 с ·<br/>health-probe 20 с ·<br/>задания закрытия дня"]
        RE["Rules Engine<br/>нормативы · SLA-календари ·<br/>матрица severity ·<br/>каталог услуг"]
        OB[("Transactional<br/>Outbox")]
        DW["Delivery Worker<br/>retry + backoff ·<br/>circuit breaker"]
        HB["Heartbeat 60 с ·<br/>метрики 5 мин"]
        DLQ[("Dead Letter<br/>Queue")]
        SC --> RE --> OB --> DW
        HB --> DW
        DW -. "4xx / попытки исчерпаны" .-> DLQ
    end

    GW["③ Корпоративный API Gateway · mTLS · OAuth2 · лимиты · аудит"]

    subgraph DV["④ ESM-платформа «Диво»"]
        direction LR
        API["Integration API<br/>/events · /metrics ·<br/>/heartbeat"]
        CR["Корреляция<br/>дедупликация · группировка ·<br/>плановые работы"]
        INC["«Диво Сервис»<br/>инциденты ·<br/>SLA-таймеры"]
        MERA["«Диво Мера»<br/>дашборды ·<br/>SLA-отчёты"]
        PORT["«Диво Портал»<br/>виджет статуса"]
        CMDB[("Каталог услуг<br/>и CMDB")]
        API --> CR --> INC --> MERA
        INC --> PORT
        CMDB --- CR
    end

    MON["Корпоративный мониторинг: алерты по DLQ и самой интеграции"]

    REP -- "SQL read-only" --> SC
    APP -- "HTTP health-check" --> SC
    DW == "HTTPS · REST/JSON · push" ==> GW == HTTPS ==> API
    CMDB -. "справочники услуг и КЕ, 1 раз/сутки" .-> RE
    DLQ -. алерт .-> MON

    classDef ds fill:#F4F4F2,stroke:#5C5B57,color:#0B0B0B
    classDef ad fill:#FFFFFF,stroke:#0B0B0B,stroke-width:2px,color:#0B0B0B
    classDef dv fill:#E7EEFF,stroke:#2B73FE,color:#0B0B0B
    classDef ext fill:#FFFFFF,stroke:#D5D8DE,color:#0B0B0B
    class APP,DB,REP ds
    class SC,RE,OB,DW,DLQ,HB ad
    class API,CR,INC,CMDB,MERA,PORT dv
    class GW,MON ext
```

| № | Компонент | Ответственность | Технологии (предложение) |
|---|---|---|---|
| 1 | **Diasoft FA# Treasury.Back** | источник фактов: статусы операций, журналы, задания | без доработок; read-only реплика БД |
| 2 | **Source Connectors** | опрос реплики (30 с), health-probe серверов (20 с), статусы заданий закрытия дня | Java 21 / Spring Boot или .NET 8 |
| 2 | **Rules Engine** | нормативы, SLA-календари (рабочие дни, cut-off), матрица severity, привязка к услуге и КЕ, решение «сообщать / уже сообщали» | конфигурация в YAML + справочники из CMDB |
| 2 | **Transactional Outbox** | надёжное хранение событий до подтверждения доставки | PostgreSQL |
| 2 | **Delivery Worker** | отправка, повторы с backoff, circuit breaker, лимит скорости, досылка пакетами | Resilience4j / Polly |
| 2 | **Dead Letter Queue** | события, которые нельзя доставить (ошибки данных, истёк срок 24 ч) | таблица PostgreSQL + алерт |
| 2 | **Heartbeat / Metrics** | сигнал живости 60 с, агрегаты 5 мин | планировщик адаптера |
| 3 | **API Gateway** | mTLS, OAuth2 (client credentials), лимиты, аудит вызовов | корпоративный шлюз банка |
| 4 | **«Диво» Integration API** | приём, валидация, хранение событий | веб-сервисы «Диво Сервис» |
| 4 | **Корреляция и правила** | дедупликация, группировка, подавление, пороги инцидента | правила «Диво Сервис» |
| 4 | **«Диво Сервис» — инциденты** | создание/обновление/закрытие инцидентов, SLA-таймеры, назначение групп | штатный процесс |
| 4 | **«Диво Мера»** | дашборды, отчёты по доступности и SLA | штатные дашборды |
| 4 | **«Диво Портал»** | виджет статуса казначейских услуг для бэк-офиса | конструктор портала |

## 3.2. Почему такая архитектура

1. **Адаптер между системами (anti-corruption layer).** Diasoft не знает модель «Диво», «Диво» не знает
   внутренности Diasoft. Смена версии любой из систем затрагивает только адаптер. Банк уже настраивает
   интеграции с «Диво» без изменений смежных систем — решение следует этой практике.
2. **Push по событию.** Задержка от обнаружения до инцидента — секунды, а не период опроса.
   «Диво» не тратит ресурсы на опрос сотен систем.
3. **Transactional outbox вместо «отправил и забыл».** Событие сначала надёжно сохраняется, затем отправляется.
   Недоступность «Диво» не приводит к потере событий — это главный риск простой интеграции «POST напрямую».
4. **Идемпотентность по `eventId`.** Гарантия «как минимум один раз» на транспорте + дедупликация на приёме
   = эффективно «ровно один инцидент».
5. **Пара FIRING/RESOLVED.** Инцидент закрывается автоматически, длительность сбоя для SLA — точная.
6. **Heartbeat («dead man's switch»).** Тишина ≠ норма: если адаптер упал, «Диво» об этом узнает само.
7. **REST/JSON через API Gateway.** Стандарт банка для синхронных интеграций, нативно поддерживается
   веб-сервисами «Диво Сервис», безопасность централизована в шлюзе. Брокер сообщений (Kafka) избыточен
   при ожидаемом объёме и потребовал бы от «Диво» роли потребителя — оставлен как путь развития.
8. **Read-only реплика.** Наблюдение не создаёт нагрузку на рабочую БД казначейства в часы пиковых расчётов.

## 3.3. Sequence diagram: основной сценарий

Задержка расчёта по сделке → событие → инцидент → автоматическое закрытие.

```mermaid
sequenceDiagram
    autonumber
    participant TB as Diasoft FA#35;<br/>Treasury.Back
    participant AD as Integration<br/>Adapter
    participant OB as Outbox<br/>(PostgreSQL)
    participant GW as API Gateway
    participant DV as «Диво» Integration API
    participant CR as Корреляция<br/>и правила
    participant SV as «Диво Сервис»<br/>(инциденты, SLA)

    Note over TB: 11:30 сделка FX-834724<br/>в статусе PROCESSING
    loop каждые 30 с
        AD->>TB: SELECT операции в работе (read-only реплика)
        TB-->>AD: статусы, время начала этапа
    end
    Note over AD: 22 мин > норматив 5 мин ⇒ OPERATION_DELAYED<br/>severity = MAJOR (услуга кр.1 × валютирование сегодня)
    AD->>OB: INSERT событие (eventId = UUID v7) в той же транзакции,<br/>что и фиксация «уже сообщали»
    OB-->>AD: commit
    AD->>GW: POST /events · Idempotency-Key: eventId · mTLS + OAuth2
    GW->>DV: проксирование, проверка токена и лимитов
    Note over DV: валидация по JSON Schema, проверка КЕ в CMDB
    DV-->>AD: 202 Accepted {status: ACCEPTED}
    AD->>OB: отметить событие доставленным
    DV->>CR: событие в обработку (асинхронно)
    Note over CR: correlationKey = TREASURY_FX_MM_SETTLEMENT:OPERATION_DELAYED<br/>6 событий за 10 мин ⇒ порог инцидента достигнут
    CR->>SV: создать инцидент P2 на КЕ CI-TB-SETTL-01
    Note over SV: запуск SLA-таймера, назначение группы<br/>«Сопровождение Diasoft Treasury», оповещение дежурного
    Note over TB: 11:58 расчёт завершён (SETTLED)
    AD->>TB: очередной опрос
    TB-->>AD: статус SETTLED
    AD->>DV: POST /events {state: RESOLVED, sequence: 2}
    DV-->>AD: 202 Accepted
    DV->>CR: RESOLVED по тому же correlationKey
    CR->>SV: все события оповещения закрыты ⇒ инцидент → RESOLVED
    Note over SV: остановка SLA-таймера, фиксация длительности для отчёта
```

## 3.4. Sequence diagram: обработка ошибок доставки

```mermaid
sequenceDiagram
    autonumber
    participant AD as Integration Adapter
    participant OB as Outbox
    participant DV as «Диво» Integration API
    participant DLQ as Dead Letter Queue
    participant MON as Корпоративный<br/>мониторинг

    rect rgb(255, 244, 214)
    Note over AD,DV: Сценарий А — «Диво» недоступно
    AD->>OB: событие сохранено (status = PENDING)
    AD->>DV: POST /events
    DV--xAD: 503 / таймаут
    Note over AD: повтор через 1 с, 2 с, 4 с … до 5 мин (+ джиттер)
    AD->>DV: POST /events
    DV--xAD: 503
    Note over AD: 5 ошибок подряд ⇒ circuit breaker OPEN<br/>(новые события копятся в outbox, не теряются)
    AD->>MON: алерт «доставка в Диво остановлена, в outbox N событий»
    loop каждые 30 с
        AD->>DV: пробный запрос (half-open)
    end
    DV-->>AD: 202
    Note over AD: circuit breaker CLOSED
    AD->>DV: POST /events/batch — досылка накопленного по порядку occurredAt
    DV-->>AD: 207 Multi-Status (ACCEPTED / DUPLICATE по каждому)
    Note right of DV: дубли безопасны: eventId = ключ идемпотентности
    end

    rect rgb(252, 228, 231)
    Note over AD,DV: Сценарий Б — событие отклонено (ошибка данных)
    AD->>DV: POST /events
    DV-->>AD: 422 VALIDATION_ERROR (неизвестная КЕ)
    AD->>DLQ: без повторов: перенос в DLQ с текстом ошибки
    AD->>MON: алерт команде интеграции (обновить справочник КЕ)
    end

    rect rgb(231, 238, 255)
    Note over AD,DV: Сценарий В — перегрузка
    AD->>DV: POST /events/batch
    DV-->>AD: 429 Retry-After: 20
    Note over AD: пауза 20 с, затем повтор
    end
```

## 3.5. Sequence diagram: недоступность Diasoft и контроль живости адаптера

```mermaid
sequenceDiagram
    autonumber
    participant TB as Diasoft FA#35;<br/>Treasury.Back
    participant AD as Integration Adapter
    participant DV as «Диво»

    rect rgb(252, 228, 231)
    Note over TB,DV: Сценарий Г — недоступен сам Diasoft
    AD->>TB: health-probe (каждые 20 с)
    TB--xAD: таймаут
    AD->>TB: health-probe
    TB--xAD: таймаут
    AD->>TB: health-probe
    TB--xAD: таймаут
    AD->>DV: POST /events SYSTEM_UNAVAILABLE · CRITICAL
    Note over DV: инцидент P1 на КЕ CI-TB-CORE-01,<br/>подавление производных событий (одна авария — один инцидент)
    TB-->>AD: health-probe OK
    AD->>DV: POST /events SYSTEM_UNAVAILABLE · RESOLVED
    end

    rect rgb(231, 238, 255)
    Note over AD,DV: Сценарий Д — упал сам адаптер («dead man's switch»)
    loop каждые 60 с
        AD->>DV: POST /heartbeat {source.reachable, outbox.pending}
        DV-->>AD: 204
    end
    Note over AD: адаптер остановился
    Note over DV: нет heartbeat 3 мин ⇒ событие INTEGRATION_HEARTBEAT_LOST,<br/>статус услуг казначейства = «Нет данных», а не «Норма»
    end
```

## 3.6. Правила «событие → инцидент»

```mermaid
flowchart TD
    E["Событие от адаптера"] --> V{"Валидно?<br/>КЕ есть в CMDB?"}
    V -- нет --> R["422 → DLQ адаптера"]
    V -- да --> D{"eventId уже был?"}
    D -- да --> DUP["200 DUPLICATE<br/>(ничего не создаём)"]
    D -- нет --> P{"PROD и нет<br/>плановых работ на КЕ?"}
    P -- нет --> S["SUPPRESSED<br/>(сохранено для истории)"]
    P -- да --> ST{"state"}
    ST -- RESOLVED --> RES["закрыть событие в оповещении;<br/>все закрыты → инцидент RESOLVED,<br/>SLA-таймер остановлен"]
    ST -- FIRING --> G["добавить в оповещение<br/>по correlationKey (окно 10 мин)"]
    G --> T{"Порог инцидента?"}
    T -- "CRITICAL — сразу" --> I1["Инцидент P1/P2"]
    T -- "MAJOR: ≥ 5 событий за 10 мин<br/>или SLA до нарушения ≤ 30 мин" --> I2["Инцидент P2/P3"]
    T -- "WARNING: только тренд" --> W["Оповещение без инцидента,<br/>видно на дашборде"]
    I1 --> UP["есть открытый инцидент<br/>по ключу? → обновить, а не создать новый"]
    I2 --> UP
    classDef bad fill:#FCE4E7,stroke:#E31D2F
    classDef good fill:#E4F6E9,stroke:#2FC35A
    class R bad
    class I1,I2,UP good
```

## 3.7. Протоколы и потоки

| Поток | Направление | Протокол | Частота |
|---|---|---|---|
| Чтение статусов операций | Адаптер → реплика Diasoft | SQL (read-only учётная запись) | 30 с |
| Проверка доступности | Адаптер → серверы Diasoft | HTTP(S) health-check / TCP | 20 с |
| События | Адаптер → API Gateway → «Диво» | HTTPS, REST/JSON, mTLS + OAuth2 | по факту |
| Досылка накопленного | Адаптер → «Диво» | HTTPS, `POST /events/batch` | после восстановления |
| Метрики | Адаптер → «Диво» | HTTPS, `POST /metrics` | 5 мин |
| Heartbeat | Адаптер → «Диво» | HTTPS, `POST /heartbeat` | 60 с |
| Справочники услуг и КЕ | «Диво» CMDB → адаптер | HTTPS, выгрузка справочника | 1 раз в сутки и по изменению |
| Алерты о проблемах интеграции | Адаптер → корпоративный мониторинг | метрики Prometheus / Zabbix | постоянно |

## 3.8. Нефункциональные требования

| Требование | Значение |
|---|---|
| Задержка «обнаружение → событие принято «Диво»» | p95 ≤ 60 с |
| Задержка «проблема → инцидент» (с учётом опроса 30 с) | ≤ 2 мин |
| Потеря событий | 0 (outbox + повторы + DLQ) |
| Пропускная способность | ≥ 50 событий/с (пик закрытия дня), пакет до 500 событий |
| Хранение событий в outbox | 7 дней после доставки (для разборов) |
| Доступность адаптера | 2 экземпляра active-standby; блокировка лидера в PostgreSQL |
| Размер события | ≤ 64 КБ |

## 3.9. Безопасность

* Взаимный TLS по сертификату адаптера от УЦ банка + OAuth2 client credentials с минимальными scope
  (`treasury.events.write`, `treasury.events.read`).
* Учётная запись Diasoft — только чтение и только нужных представлений.
* **Минимизация данных:** никаких сумм, счетов, наименований контрагентов и ПДн — только технические
  идентификаторы, статусы, класс суммы.
* Аудит всех вызовов в API Gateway, сквозной `X-Request-Id`.
* Секреты — в хранилище секретов банка, не в конфигурации.
