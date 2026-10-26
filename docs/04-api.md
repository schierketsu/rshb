# 4. API-контракт

Полная спецификация: [`api/openapi.yaml`](../api/openapi.yaml) (OpenAPI 3.1).
Однофайловая версия для [Swagger Editor](https://editor.swagger.io): [`api/openapi.bundled.yaml`](../api/openapi.bundled.yaml).

**Базовый URL:** `https://api-gw.rshb.local/divo/api/v1/integrations/treasury`
**Аутентификация:** mTLS (сертификат адаптера) + `Authorization: Bearer <OAuth2 client credentials>`
**Формат:** `application/json`, ошибки — `application/problem+json` (RFC 9457)
**Вызывающая сторона:** Integration Adapter. **Принимающая:** интеграционный слой «Диво Сервис».

## 4.1. Сводка endpoints

| # | Метод и путь | Назначение | Успешный ответ |
|---|---|---|---|
| 1 | `POST /events` | передать одно событие (основной канал, push по факту) | `202 Accepted` / `200` дубль |
| 2 | `POST /events/batch` | передать до 500 событий (досылка после сбоя, пик закрытия дня) | `207 Multi-Status` |
| 3 | `GET /events/{eventId}` | узнать статус обработки: создан ли инцидент | `200 OK` |
| 4 | `POST /metrics` | агрегированные метрики за 5 минут (для SLA и дашбордов) | `202 Accepted` |
| 5 | `POST /heartbeat` | сигнал живости адаптера раз в 60 с | `204 No Content` |

Обязательный минимум задания (2–3 endpoints) закрывают №1–3; №4–5 реализуют режим «по расписанию»
и контроль самой интеграции.

---

## 4.2. `POST /events` — передать событие

**Заголовки**

| Заголовок | Обяз. | Описание |
|---|---|---|
| `Authorization` | да | `Bearer <token>`, scope `treasury.events.write` |
| `Idempotency-Key` | да | равен `eventId` |
| `X-Request-Id` | нет | сквозная трассировка |
| `Content-Type` | да | `application/json` |

**Тело:** объект `TreasuryEvent` ([схема](../schemas/treasury-event.schema.json), описание полей — [05-data-model.md](05-data-model.md)).
Пример: [`examples/event-operation-delayed.json`](../examples/event-operation-delayed.json).

**Ответ `202 Accepted`**

```json
{
  "eventId": "0192f1a4-7c3e-7b21-9a4d-3c5e8f1b2a10",
  "status": "ACCEPTED",
  "receivedAt": "2026-10-26T11:47:22.105+03:00",
  "statusUrl": "/api/v1/integrations/treasury/events/0192f1a4-7c3e-7b21-9a4d-3c5e8f1b2a10"
}
```

Почему `202`, а не `201`: «Диво» гарантирует, что событие **сохранено**, а корреляция и создание
инцидента происходят асинхронно. Адаптеру не нужно ждать работы правил — он сразу освобождается.

**Коды ответов и реакция адаптера**

| Код | Когда | Что делает адаптер |
|---|---|---|
| `202` | событие принято | отмечает доставленным |
| `200` | `eventId` уже принимался (`status: DUPLICATE`) | отмечает доставленным (повтор безопасен) |
| `400` | битый JSON, нет обязательных полей | без повторов → DLQ |
| `401` | токен истёк / сертификат недействителен | обновляет токен, повторяет |
| `403` | нет scope, источник не зарегистрирован | без повторов → DLQ + алерт |
| `409` | тот же `eventId`, но другое содержимое | без повторов → DLQ (ошибка адаптера) |
| `413` | событие > 64 КБ | без повторов → DLQ |
| `422` | не прошла валидация: неизвестная услуга/КЕ, неверный формат | без повторов → DLQ + алерт |
| `429` | превышен лимит | ждёт `Retry-After`, повторяет |
| `503` | «Диво» недоступно | повтор с экспоненциальной задержкой, событие в outbox |

Пример `422`: [`examples/response-422-error.json`](../examples/response-422-error.json)

```json
{
  "type": "https://divo.rshb.local/problems/validation-error",
  "title": "Событие не прошло валидацию",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "traceId": "7f3c2a9e41b0d8c6",
  "errors": [
    { "field": "service.code", "message": "Значение TREASURY_FX не входит в каталог ИТ-услуг" }
  ]
}
```

---

## 4.3. `POST /events/batch` — пакет событий

Используется после восстановления связи (разбор outbox) и в пике закрытия дня.

**Тело**

| Поле | Тип | Описание |
|---|---|---|
| `batchId` | uuid | идентификатор пакета |
| `events` | `TreasuryEvent[]`, 1–500 | события, упорядоченные по `occurredAt` |

**Ответ `207 Multi-Status`** — результат по каждому событию ([пример](../examples/response-207-batch.json)):

```json
{
  "batchId": "0192f1a8-0000-7000-8000-000000000001",
  "accepted": 1, "duplicates": 0, "rejected": 1,
  "results": [
    { "eventId": "0192f1a4-…a10", "httpStatus": 202, "status": "ACCEPTED" },
    { "eventId": "0192f1a5-…a55", "httpStatus": 422, "status": "REJECTED",
      "error": { "code": "UNKNOWN_CI", "message": "КЕ CI-TB-SEC-01 не найдена в CMDB", "field": "service.ciId" } }
  ]
}
```

Почему `207`: одно плохое событие не должно блокировать доставку 499 хороших.
Адаптер повторяет только элементы со статусом `RETRY` (внутренние 429/5xx).

**Коды:** `207`, `400`, `401`, `403`, `413` (> 500 событий — адаптер дробит пакет), `429`, `503`.

---

## 4.4. `GET /events/{eventId}` — статус обработки

Нужен для сверки после сбоев (а был ли создан инцидент?) и для 2-й линии при разборе.
Scope: `treasury.events.read`.

**Ответ `200 OK`** ([пример](../examples/response-event-status.json)):

```json
{
  "eventId": "0192f1a4-7c3e-7b21-9a4d-3c5e8f1b2a10",
  "processingStatus": "INCIDENT_CREATED",
  "receivedAt": "2026-10-26T11:47:22.105+03:00",
  "processedAt": "2026-10-26T11:47:23.410+03:00",
  "correlation": {
    "correlationKey": "TREASURY_FX_MM_SETTLEMENT:OPERATION_DELAYED",
    "alertId": "ALR-552190",
    "eventsInAlert": 6
  },
  "incident": {
    "id": "INC-18493", "priority": "P2", "status": "IN_PROGRESS",
    "assignmentGroup": "Сопровождение Diasoft Treasury",
    "url": "https://divo.rshb.local/service/incident/INC-18493"
  }
}
```

`processingStatus`: `RECEIVED` · `CORRELATED` · `INCIDENT_CREATED` · `INCIDENT_UPDATED` · `SUPPRESSED` · `REJECTED`.
Для `SUPPRESSED` — `suppressionReason`: `MAINTENANCE_WINDOW`, `NON_PROD`, `BELOW_THRESHOLD`, `STALE_SEQUENCE`.

**Коды:** `200`, `400` (неверный формат id), `401`, `403`, `404` (событие не поступало — адаптер отправит повторно), `429`.

---

## 4.5. `POST /metrics` — метрики за период

Раз в 5 минут. Не создаёт инцидентов — питает дашборды «Диво Мера», отчёт о выполнении SLA и тренды.
`Idempotency-Key` = `snapshotId`. [Пример](../examples/metrics-snapshot.json).

| Поле в `services[]` | Смысл для «Диво» |
|---|---|
| `operationsProcessed` | объём работы услуги |
| `operationsInTimePct` | доля операций в нормативе — **основа SLA-отчёта** |
| `p95DurationSec` | время обработки «для большинства» без влияния единичных выбросов |
| `queueDepth` | ранний признак деградации |
| `errors` | количество ошибок за период |

**Коды:** `202`, `200` (дубль), `400`, `401`, `422`, `429`, `503`.

## 4.6. `POST /heartbeat` — живость интеграции

Раз в 60 с. Если heartbeat не приходит 3 минуты — «Диво» само регистрирует `INTEGRATION_HEARTBEAT_LOST`
и показывает статус казначейских услуг как «Нет данных». [Пример](../examples/heartbeat.json).

```json
{
  "adapterId": "treasury-adapter-prod-01",
  "adapterVersion": "1.4.0",
  "sentAt": "2026-10-26T11:48:00+03:00",
  "intervalSec": 60,
  "source": { "system": "DIASOFT_FA_TREASURY_BACK", "reachable": true, "lastSuccessfulPollAt": "2026-10-26T11:47:55+03:00" },
  "outbox": { "pending": 0, "oldestPendingAgeSec": 0, "deadLetter": 0 }
}
```

**Коды:** `204`, `400`, `401`, `503`.

## 4.7. Версионирование

* Версия в пути (`/api/v1/`) — для несовместимых изменений.
* Поле `specVersion` в событии — «Диво» может принимать две версии схемы параллельно на время миграции.
* Новые необязательные поля и новые значения перечислений — совместимые изменения в рамках `v1`.

## 4.8. Проверка контракта

```bash
pip install jsonschema pyyaml openapi-spec-validator
python tools/validate.py        # схема + все примеры + структура OpenAPI
python tools/bundle_openapi.py  # пересобрать однофайловую версию
```
