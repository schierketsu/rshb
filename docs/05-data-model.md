# 5. Схема данных (JSON)

Формальная схема: [`schemas/treasury-event.schema.json`](../schemas/treasury-event.schema.json) (JSON Schema 2020-12).
Все примеры в [`examples/`](../examples) проверяются скриптом `tools/validate.py`.

## 5.1. Пример события

```json
{
  "specVersion": "1.0",
  "eventId": "0192f1a4-7c3e-7b21-9a4d-3c5e8f1b2a10",
  "eventType": "OPERATION_DELAYED",
  "category": "OPERATION",
  "state": "FIRING",
  "severity": "MAJOR",
  "occurredAt": "2026-10-26T11:30:00+03:00",
  "detectedAt": "2026-10-26T11:47:21+03:00",
  "sequence": 1,
  "correlationKey": "TREASURY_FX_MM_SETTLEMENT:OPERATION_DELAYED",
  "source": {
    "system": "DIASOFT_FA_TREASURY_BACK",
    "instance": "tb-app-prod-02",
    "module": "SETTLEMENT",
    "environment": "PROD",
    "adapterVersion": "1.4.0"
  },
  "service": {
    "code": "TREASURY_FX_MM_SETTLEMENT",
    "ciId": "CI-TB-SETTL-01",
    "name": "Расчёты по сделкам FX и МБК"
  },
  "operation": {
    "id": "FX-2026-834724",
    "type": "FX_SWAP",
    "status": "PROCESSING",
    "stage": "SETTLEMENT",
    "valueDate": "2026-10-26",
    "currency": "USD",
    "amountClass": "LARGE"
  },
  "metrics": {
    "expectedDurationSec": 300,
    "actualDurationSec": 1320,
    "deviationPct": 340.0,
    "threshold": 300
  },
  "sla": {
    "slaCode": "SLA-TRS-SETTL",
    "deadline": "2026-10-26T15:30:00+03:00",
    "breached": false,
    "timeToBreachSec": 13359
  },
  "message": "Превышено нормативное время расчёта по сделке FX-2026-834724 (22 мин при нормативе 5 мин), валютирование сегодня",
  "details": {
    "errorCode": "TB-SETTL-WAIT-ACK",
    "errorText": "Нет подтверждения исполнения платёжного поручения от расчётной системы",
    "runbookUrl": "https://wiki.rshb.local/runbooks/treasury/settlement-delay"
  },
  "tags": ["value-date-today", "usd"]
}
```

## 5.2. Структура: событие отвечает на 6 вопросов

| Блок | Вопрос | Кто в «Диво» использует |
|---|---|---|
| `eventId`, `specVersion`, `sequence` | *Это то же самое событие или новое?* | приём (идемпотентность, порядок) |
| `eventType`, `category`, `state`, `severity`, `message` | *Что случилось и насколько плохо?* | правила корреляции, дежурная смена |
| `occurredAt`, `detectedAt` | *Когда?* | SLA, MTTD, хронология |
| `source`, `service` | *Где и какую ИТ-услугу задело?* | CMDB, назначение группы, отчётность по услугам |
| `operation`, `metrics`, `sla` | *Насколько сильно и что под угрозой?* | приоритет, дашборды, SLA |
| `details`, `tags` | *Что делать?* | 2-я линия (диагностика), фильтры |

## 5.3. Поля и их польза для «Диво»

| Поле | Тип | Обяз. | Зачем «Диво» |
|---|---|---|---|
| `specVersion` | string `"1.0"` | да | обрабатывать разные версии контракта параллельно при обновлениях |
| `eventId` | UUID v7 | да | **идемпотентность**: повторная доставка не создаёт второй инцидент; UUID v7 упорядочен по времени — удобно для индексов |
| `eventType` | enum (11) | да | выбор правила корреляции и шаблона инцидента |
| `category` | `OPERATION`/`PROCESS`/`SYSTEM`/`GATEWAY` | да | масштаб проблемы: одна операция или система целиком; подавление производных событий |
| `state` | `FIRING`/`RESOLVED` | да | **автоматическое закрытие инцидента** и остановка SLA-таймера |
| `severity` | `INFO`…`CRITICAL` | да | приоритет инцидента, порог «создавать ли инцидент» |
| `occurredAt` | date-time | да | начало сбоя для SLA (а не момент, когда заметили) |
| `detectedAt` | date-time | да | `detectedAt − occurredAt` = задержка обнаружения, KPI самой интеграции |
| `sequence` | int | нет | защита от устаревших событий при повторной доставке не по порядку |
| `correlationKey` | string | да | группировка однотипных событий в одно оповещение/инцидент — без «шторма» инцидентов |
| `source.system` | const | да | система-источник в CMDB |
| `source.instance` | string | да | конкретный узел — 2-я линия сразу знает, куда смотреть |
| `source.module` | enum | нет | модуль Treasury.Back — категоризация инцидента |
| `source.environment` | enum | да | не-PROD события не превращаются в инциденты |
| `source.adapterVersion` | string | нет | разбор проблем самой интеграции |
| `service.code` | enum | да | **связка с ИТ-услугой каталога** — ради этого всё и делается: SLA считается по услуге |
| `service.ciId` | string | да | КЕ, на которую регистрируется инцидент; из неё — группа назначения |
| `service.name` | string | нет | отображение без обращения к каталогу |
| `operation.id` | string | для `OPERATION` | сопровождение находит операцию в Diasoft без переписки с бэк-офисом |
| `operation.type`, `stage`, `status` | enum | для `OPERATION` | где именно застряло: аналитика «топ узких мест» |
| `operation.valueDate` | date | нет | валютирование сегодня ⇒ выше приоритет (риск неисполнения обязательств) |
| `operation.currency` | ISO 4217 | нет | у разных валют разные cut-off |
| `operation.amountClass` | enum | нет | значимость **без раскрытия суммы** (банковская тайна) |
| `metrics.expectedDurationSec` / `actualDurationSec` / `deviationPct` | number | для задержек | насколько нарушен норматив; графики на дашборде |
| `metrics.affectedOperations`, `queueDepth` | int | нет | масштаб и признак деградации |
| `metrics.threshold` | number | нет | прозрачность: по какому порогу сработало |
| `sla.slaCode` | string | с `sla` | какое соглашение затронуто |
| `sla.deadline`, `timeToBreachSec` | date-time, int | нет | **сколько осталось до нарушения** — главный параметр для приоритета |
| `sla.breached` | bool | с `sla` | отметка нарушения в отчёте |
| `message` | string ≤ 500 | да | тема оповещения/инцидента на русском языке |
| `details.errorCode`, `errorText` | string | нет | диагностика 2-й линии |
| `details.jobName`, `gateway` | string/enum | нет | какое задание / внешняя система |
| `details.runbookUrl` | URI | нет | дежурный сразу открывает инструкцию |
| `tags` | string[] ≤ 10 | нет | фильтры на экране мониторинга |

## 5.4. Что сознательно НЕ передаётся

| Не передаём | Почему |
|---|---|
| Суммы сделок | банковская тайна; заменено `amountClass` |
| Счета, реквизиты | банковская тайна, для мониторинга не нужны |
| Наименования контрагентов, ПДн | 152-ФЗ, банковская тайна |
| Полные тексты SWIFT-сообщений | избыточны; передаётся код и обезличенный текст ошибки |

## 5.5. Правила валидации в схеме

* `additionalProperties: false` на всех уровнях — опечатка в имени поля не пройдёт незамеченной.
* Если `category = OPERATION` — блок `operation` обязателен.
* Для событий о задержках (`OPERATION_DELAYED`, `PROCESSING_BACKLOG`, `EOD_CLOSE_DELAYED`, `MARKET_DATA_STALE`) обязателен блок `metrics`.
* `correlationKey` — по шаблону `<SERVICE>:<EVENT_TYPE>[:<scope>]`.

## 5.6. Служебные сообщения

| Сообщение | Схема | Пример |
|---|---|---|
| Пакет событий | `openapi.yaml` → `/events/batch` | [`batch-request.json`](../examples/batch-request.json) |
| Метрики за период | `MetricsSnapshot` | [`metrics-snapshot.json`](../examples/metrics-snapshot.json) |
| Heartbeat | `Heartbeat` | [`heartbeat.json`](../examples/heartbeat.json) |
| Статус обработки | `EventStatus` | [`response-event-status.json`](../examples/response-event-status.json) |
| Ошибка | `Problem` (RFC 9457) | [`response-422-error.json`](../examples/response-422-error.json) |
