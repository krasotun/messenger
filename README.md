# Messenger

[![ci](https://github.com/krasotun/messenger/actions/workflows/ci.yml/badge.svg)](https://github.com/krasotun/messenger/actions/workflows/ci.yml)

Учебное Angular-приложение для отработки архитектурного мышления, TDD-дисциплины
и постепенного развития бизнес-логики.

Production: https://krasotun.github.io/messenger/

API reference: https://ya-praktikum.tech/api/v2/swagger/#/

## Команды

```bash
npm install
npm start
npm run build
npm run test:ci
npm run lint
```

Дополнительно:

```bash
npm run test:coverage
npm run e2e
npm run e2e:visual
npm run e2e:local
npm run e2e:report
```

Визуальный запуск E2E:

```bash
npx playwright test --ui
```

Docker:

```bash
npm run docker:build
npm run docker:run
npm run compose:e2e:up
npm run compose:e2e:down
```

## Deployment

Production is served by GitHub Pages at
https://krasotun.github.io/messenger/. Deployment runs from
`.github/workflows/deploy.yml`:

```text
npm ci -> lint -> test:ci -> e2e -> build --base-href /messenger/ -> upload-pages-artifact -> deploy-pages
```

The workflow runs automatically on push to `main` and can also be triggered
manually (`workflow_dispatch`). If any quality gate fails, publishing does not
happen and the previous production version stays live.

The previous VDS deployment via Ansible/SSH is no longer used: the VDS has
been decommissioned and the `VDS_*` secrets have been removed from the
repository. There is no rollback to it. `ansible/` and `docs/deployment/` are
kept only as historical reference (see `ansible/README.md`).

## Архитектура

Используем подход:

```text
Domain-first Angular + lightweight DDD boundaries
```

## Слои

```text
shared/ui
  reusable UI primitives, no domain knowledge

domains/identity/application
  identity use cases and contracts, no Angular UI details

domains/identity/ui or identity feature components
  identity screens/components, may use shared/ui and identity application contracts

app/root
  bootstrap, routes, providers, global wiring
```

`app/root` - это роль, а не обязательно отдельная папка. В Angular ее могут
выполнять `app.config.ts`, routes, root providers, root/layout components и
другие места, где приложение связывает зависимости.

## Границы слоев

- `shared/ui` не импортирует домены, страницы, app/root или core-инфраструктуру.
- `shared/ui` не знает про identity/profile/chats/messages и другие бизнес-сценарии.
- Domain/application слой описывает use cases, контракты и бизнес-сценарии без
  Angular UI-деталей.
- UI feature components могут использовать `shared/ui` и application contracts
  своего домена.
- Infrastructure реализует application contracts и не импортируется напрямую из UI.
- App/root слой связывает routes, providers, bootstrap и feature entrypoints.

Пример для modal/profile:

```text
shared/ui/modal
  knows how to open and close modal content
  does not know about profile editing

identity profile UI
  opens EditProfile modal through shared modal primitive
  knows about profile screen behavior

identity application
  updates profile through an application contract
  does not know about ModalRef, Overlay, DOM or forms
```

## Import Boundaries

Основные aliases:

```text
@core/*     -> app-level infrastructure
@domains/*  -> bounded contexts
@shared/*   -> shared primitives
```

Правила static imports закреплены в ESLint через `no-restricted-imports`.

Перед новым импортом проверяй вопрос:

> Почему этот слой имеет право знать об этом модуле?

Если ответ только "так удобнее", граница, скорее всего, выбрана неправильно.

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
