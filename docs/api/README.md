# API Яндекс.Практикума

`swagger.json` - спецификация учебного API, поверх которого работает проект.
Собственного бэкенда у мессенджера нет, поэтому это единственный контракт с
внешним миром.

Файл лежит в репозитории копией: на сервере отдельного `swagger.json` нет,
спека вшита в скрипт Swagger UI. Обновить:

```sh
curl -s https://ya-praktikum.tech/api/v2/swagger/swagger-ui-init.js -o /tmp/swagger-ui-init.js
python3 -c '
import json
s = open("/tmp/swagger-ui-init.js", encoding="utf-8").read()
doc, _ = json.JSONDecoder().raw_decode(s[s.index("{", s.index("\"swaggerDoc\"")):])
json.dump(doc, open("docs/api/swagger.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
'
```

Человекочитаемая версия - https://ya-praktikum.tech/api/v2/swagger/

Снято 2026-09-03: Swagger 2.0, «Chat & OAuth API» 2.0.0, 35 путей.

Переписка в `swagger.json` не описана: HTTP отдает только токен, обмен идет по
WebSocket. Разведанный протокол - `websocket.md` рядом.
