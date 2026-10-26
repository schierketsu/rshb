"""Собирает api/openapi.bundled.yaml — один файл без внешних ссылок (для Swagger Editor / Postman)."""
import json, pathlib, copy, yaml
ROOT = pathlib.Path(__file__).resolve().parent.parent
api = yaml.safe_load((ROOT / "api/openapi.yaml").read_text(encoding="utf-8"))
ev = json.loads((ROOT / "schemas/treasury-event.schema.json").read_text(encoding="utf-8"))
for k in ("$schema", "$id"): ev.pop(k, None)
api["components"]["schemas"] = {"TreasuryEvent": ev, **api["components"]["schemas"]}

def walk(o):
    if isinstance(o, dict):
        if o.get("$ref") == "../schemas/treasury-event.schema.json":
            return {"$ref": "#/components/schemas/TreasuryEvent"}
        if "externalValue" in o:
            o = dict(o); p = o.pop("externalValue").replace("../", "")
            o["value"] = json.loads((ROOT / p).read_text(encoding="utf-8"))
        return {k: walk(v) for k, v in o.items()}
    if isinstance(o, list): return [walk(v) for v in o]
    return o
out = walk(api)
(ROOT / "api/openapi.bundled.yaml").write_text(
    "# Автоматически собрано tools/bundle_openapi.py из openapi.yaml — не редактировать вручную\n" +
    yaml.safe_dump(out, allow_unicode=True, sort_keys=False, width=110), encoding="utf-8")
print("api/openapi.bundled.yaml written")
