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
