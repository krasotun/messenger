# Messenger

Учебное frontend-приложение на Angular.

Проект используется для отработки архитектурного мышления, TDD-дисциплины и
постепенного развития бизнес-логики.

## API

Swagger API: https://ya-praktikum.tech/api/v2/swagger/#/

## Архитектура

Используем подход:

```text
Domain-first Angular + lightweight DDD boundaries
```

Основная структура:

```text
src/app
  core
  shared
  domains/identity-access
```

Слои домена:

```text
domain -> application -> infrastructure
presentation -> application
```

Правила:

- `domain` содержит чистую бизнес-модель без Angular, UI, Router, HttpClient и
  browser storage;
- `application` содержит сценарии приложения, orchestration и state;
- `infrastructure` содержит HTTP API, DTO, mappers и технические adapters;
- `presentation` содержит Angular UI, pages, forms и component-level behavior;
- `shared` содержит переиспользуемый технический и UI-код без бизнес-логики;
- компоненты не вызывают `HttpClient`, API services и browser storage напрямую.

Предпочтительный поток:

```text
Component -> ApplicationService -> Gateway/Api -> HttpClient
```

## State

Для локального application state используем Angular Signals.

RxJS используем для HTTP, WebSocket и stream-сценариев.

NgRx на старте не используем.

## Роутинг

Доменные страницы должны подключаться через Angular Router. Для новых страниц
предпочитаем lazy loading через `loadComponent`.

Routing logic не должна обращаться к HTTP/API/localStorage напрямую.

## Нейминг

Соглашения:

```text
*.api.ts       HTTP requests only
*.dto.ts       backend contracts
*.input.ts     application scenario input
*.result.ts    application scenario result
*.mapper.ts    mapping
*.service.ts   state, session, infrastructure или application services
```

Не используем `store` naming для текущих state services.

## TDD

Работаем по TDD:

```text
spec -> minimal implementation -> refactor
```

Для новой бизнес-логики сначала фиксируем expected behavior на уровне нужного
слоя:

- application specs для сценариев и state;
- infrastructure specs для API/gateway/mapper;
- component specs для UI behavior;
- routing/guard specs для navigation policy.

## Разработка

Установить зависимости:

```bash
npm install
```

Запустить dev server:

```bash
npm start
```

Сборка:

```bash
npm run build
```

Тесты:

```bash
npm test
```

Одноразовый прогон тестов:

```bash
npm test -- --watch=false
```

Запустить один spec-файл:

```bash
npx ng test --include path/to/file.spec.ts --watch=false
```

Линтинг:

```bash
npm run lint
```

## E2E

E2E-тесты запускаются через Playwright.

Обычный прогон:

```bash
npm run e2e
```

Прогон auth e2e против production frontend в Docker container:

```bash
npm run e2e:container -- e2e/auth/*.spec.ts
```

Этот запуск собирает Docker image, поднимает nginx container на
`http://localhost:8080`, запускает Playwright с route mocks и удаляет container
после тестов. `ng serve` в этом контуре не используется.

Интерактивный режим для обучения и разбора падений:

```bash
npx playwright test --ui
```

В UI-режиме удобнее смотреть шаги теста, состояние страницы, trace и место, где
ломается redirect или сетевой mock.

Обновить эталонный скриншот для одного screenshot spec:

```bash
npx playwright test e2e/auth/sign-in.screenshot.spec.ts --project=chromium --update-snapshots
```

## Docker

Docker используется для проверки production-сценария frontend-only приложения:
Angular собирается внутри image, а готовые static files из
`dist/messenger/browser` раздаются через nginx.

Собрать image:

```bash
docker build -t messenger-frontend:local .
```

Запустить container вручную:

```bash
npm run docker:run
```

Frontend будет доступен на `http://localhost:8080`. Container работает в текущем
терминале; остановить его можно через `Ctrl+C`. Благодаря `--rm` container будет
удален после остановки.

Проверить SPA fallback:

```bash
curl -I http://localhost:8080/
curl -I http://localhost:8080/sign-in
curl -I http://localhost:8080/sign-up
```

Для всех трех URL ожидается `HTTP/1.1 200 OK`: nginx должен возвращать
`index.html`, а дальнейшую навигацию обрабатывает Angular Router.
