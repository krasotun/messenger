[![ci](https://github.com/krasotun/messenger/actions/workflows/ci.yml/badge.svg)](https://github.com/krasotun/messenger/actions/workflows/ci.yml)

# Messenger

Учебное Angular-приложение для отработки архитектурного мышления, TDD-дисциплины
и постепенного развития бизнес-логики.

Production: https://73053.koara.live

API reference: https://ya-praktikum.tech/api/v2/swagger/#/

## Architecture

Используем подход:

```text
Domain-first Angular + lightweight DDD boundaries
```

Текущая структура:

```text
src/app
  app config/routes/root component
  core       app-level infrastructure
  pages      route-level pages outside a domain
  domains    business bounded contexts
  shared     reusable technical and UI primitives
```

Основной bounded context сейчас:

```text
src/app/domains/identity-access
  domain
  application
  infrastructure
  presentation
```

Смысл слоев:

- `domain` - бизнес-модель без Angular, UI, Router, HttpClient и browser storage.
- `application` - use cases, orchestration, application state, input/result contracts.
- `infrastructure` - HTTP API, DTO, mappers, backend adapters.
- `presentation` - Angular UI, pages, forms, component-level behavior.
- `shared` - переиспользуемый технический и UI-код без бизнес-логики.
- `core` - bootstrap, routing guards, app initializers, layouts, tokens.

Предпочтительный поток:

```text
Component -> ApplicationService -> Gateway/Api -> HttpClient
```

Компоненты не вызывают `HttpClient`, API services и browser storage напрямую.

## Import Boundaries

Проект движется к public API для доменов. Внешний код не должен зависеть от
внутренней структуры bounded context.

Целевые aliases:

```text
@core/*     -> app-level infrastructure
@domains/*  -> bounded contexts
@shared/*   -> shared primitives
```

Правила:

- `shared` не импортирует `app`, `core`, `pages` или `domains`.
- `core` может импортировать только публичный API домена, но не его
  `infrastructure`.
- `pages` и `core/layouts` не должны импортировать глубокие файлы домена.
- Внешние импорты вида `@domains/identity-access/.../some-internal-file` должны
  быть заменены на imports из public API домена после его определения.
- Public API домена находится в `src/app/domains/<domain>/index.ts`; внешний
  static import должен идти через `@domains/<domain>`.
- `infrastructure` реализует application contracts и не импортируется напрямую
  из UI.
- Dynamic route imports через `loadComponent` могут указывать на конкретный
  route component внутри домена. Это lazy boundary, а не static dependency.
- Широкий alias `@app/*` не используется: он конкурирует с layer-specific aliases
  и ухудшает auto imports.
- Правила static imports закреплены в ESLint через `no-restricted-imports`.

## TDD

Работаем по циклу:

```text
spec -> minimal implementation -> refactor
```

Для новой бизнес-логики сначала фиксируем expected behavior на уровне нужного
слоя:

- application specs для сценариев и state;
- infrastructure specs для API/gateway/mapper;
- component specs для UI behavior;
- routing/guard specs для navigation policy.

Production-реализация новой бизнес-логики не добавляется без тестового сценария,
если это не документация, конфигурация или явно оговоренный технический долг.

## State

Для локального application state используем Angular Signals.

RxJS используем для HTTP, WebSocket и stream-сценариев.

NgRx на текущем этапе не используем.

## Naming

```text
*.api.ts       HTTP requests only
*.dto.ts       backend contracts
*.input.ts     application scenario input
*.result.ts    application scenario result
*.mapper.ts    mapping
*.service.ts   state, session, infrastructure или application services
```

Не используем `store` naming для текущих state services.

## Development

```bash
npm install
npm start
npm run build
npm test -- --watch=false
npm run lint
```

Визуальный запуск E2E:

```bash
npx playwright test --ui
```
