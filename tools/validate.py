"""Проверка контракта: OpenAPI-спецификация и все примеры JSON.

Запуск:  python tools/validate.py
"""
import json, sys, pathlib
import yaml
from jsonschema import Draft202012Validator, FormatChecker

ROOT = pathlib.Path(__file__).resolve().parent.parent
ok = True

def load(p): return json.loads((ROOT / p).read_text(encoding="utf-8"))

event_schema = load("schemas/treasury-event.schema.json")
Draft202012Validator.check_schema(event_schema)
ev = Draft202012Validator(event_schema, format_checker=FormatChecker())

api = yaml.safe_load((ROOT / "api/openapi.yaml").read_text(encoding="utf-8"))
comp = api["components"]["schemas"]

def check(name, validator, data):
    global ok
    errs = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if errs:
        ok = False
        for e in errs:
            print(f"  FAIL {name}: {'/'.join(map(str, e.path)) or '<root>'}: {e.message}")
    else:
        print(f"  ok   {name}")

def comp_validator(name):
    # заменяем внутренние $ref на сами схемы компонентов
    schema = {"$defs": comp, **comp[name]}
    s = json.dumps(schema).replace("#/components/schemas/", "#/$defs/")
    return Draft202012Validator(json.loads(s), format_checker=FormatChecker())

print("JSON Schema события:")
for f in sorted((ROOT / "examples").glob("event-*.json")):
    check(f.name, ev, load(f"examples/{f.name}"))

print("Пакет:")
batch = load("examples/batch-request.json")
for i, e in enumerate(batch["events"]):
    check(f"batch-request.json[{i}]", ev, e)
assert len(batch["events"]) <= 500

print("Ответы и служебные сообщения по схемам OpenAPI:")
for fname, sname in [
    ("response-202-accepted.json", "SubmitResult"),
    ("response-200-duplicate.json", "SubmitResult"),
    ("response-207-batch.json", "BatchResult"),
    ("response-event-status.json", "EventStatus"),
    ("response-422-error.json", "Problem"),
    ("heartbeat.json", "Heartbeat"),
    ("metrics-snapshot.json", "MetricsSnapshot"),
]:
    check(fname, comp_validator(sname), load(f"examples/{fname}"))

print("Структура OpenAPI 3.1:")
try:
    from openapi_spec_validator import validate
    from openapi_spec_validator.readers import read_from_filename
    spec, base = read_from_filename(str(ROOT / "api/openapi.yaml"))
    validate(spec, base_uri=base)
    print("  ok   openapi.yaml")
except ImportError:
    print("  skip (pip install openapi-spec-validator)")
except Exception as e:
    ok = False
    print("  FAIL openapi.yaml:", str(e)[:500])

eps = [(p, m) for p, ms in api["paths"].items() for m in ms]
print(f"Endpoints: {len(eps)} -> " + ", ".join(f"{m.upper()} {p}" for p, m in eps))
print("RESULT:", "OK" if ok else "ERRORS")
sys.exit(0 if ok else 1)
