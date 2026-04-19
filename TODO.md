# [Architecture] Align project folders with domain-first structure

## Goal

Привести папки проекта к архитектуре:

```text
Domain-first Angular + lightweight DDD boundaries
```

## Context

Отказываемся от FSD-слоев как основной структуры:

```text
features
entities
widgets
pages
```

Целевая структура:

```text
src/app
  core
  shared
  domains
    identity-access
```

## Scope

Создать структуру:

```text
src/app/domains/identity-access
  domain
  application
  infrastructure
  presentation
```

Перенести auth-related UI в:

```text
domains/identity-access/presentation
```

Shared UI оставить в:

```text
shared/ui
```

## Rules

- Не добавлять чаты и сообщения.
- Не создавать `features`, `entities`, `widgets`.
- `shared` не зависит от доменов.
- `domain` не зависит от Angular, HttpClient, Router или storage.
- Компоненты не вызывают HttpClient напрямую.

## Acceptance Criteria

- Есть `src/app/domains/identity-access`.
- В домене есть `domain`, `application`, `infrastructure`, `presentation`.
- Auth UI перенесен в `presentation`.
- Shared UI остался в `shared/ui`.
- Роуты и импорты обновлены.
- Проект собирается без ошибок.
