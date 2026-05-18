# TODO

## Активная задача

```text
[Auth] User can restore current session
```

## Текущий шаг

- Спроектировать application state contract для current session: `unknown/loading`, `authenticated`, `anonymous`, error handling.
- Добавить specs для application service, который восстанавливает current session через `AUTH_GATEWAY.currentSession()`.
- Зафиксировать, что successful current session переводит state в `authenticated` и сохраняет `CurrentUser`.
- Зафиксировать, что anonymous current session переводит state в `anonymous` и очищает current user.
- Зафиксировать, что logout вызывает `AUTH_GATEWAY.logout()` и после success переводит state в `anonymous`.

## Scope

- Восстанавливать auth state при входе в приложение через backend session cookie.
- Не хранить auth tokens в `localStorage` или `sessionStorage`.
- Добавить current session application state: loading/unknown, authenticated, anonymous.
- После successful sign-in обновлять или перепроверять current session state.
- Добавить logout flow: backend logout call и очистка application session state.

## Out of Scope

- Profile page.
- Chats/messages.
- Route guards и protected redirects.
- Post-sign-in navigation на приватную страницу.

## Acceptance Criteria

- После sign-in приложение знает, что пользователь authenticated.
- После reload приложение восстанавливает authenticated state через current session endpoint.
- Если session cookie отсутствует или backend возвращает unauthorized, state становится anonymous.
- После logout state становится anonymous.
- Новые application/infrastructure flows покрыты specs до реализации.

## Завершено

- Уточнен backend contract для `GET /auth/user` и `POST /auth/logout`.
- Добавлены application contracts/types для current session.
- Добавлены infrastructure DTO для current user.
- Добавлены `AuthApi` specs для current session и logout.
- Реализованы `AuthApi.currentSession()` и `AuthApi.logout()`.
- Вынесен повторяющийся auth error mapping из `HttpAuthGateway` в локальный infrastructure mapper.
- Добавлен mapper `CurrentUserDto -> CurrentUser`.
- Добавлен mapper spec, включая сохранение nullable `displayName` и `avatar`.
- Добавлены `HttpAuthGateway.currentSession()` specs: successful response, `401 Unauthorized` как anonymous, generic error как `ApplicationError`.
- Реализован `HttpAuthGateway.currentSession()`.
- Добавлены `HttpAuthGateway.logout()` specs: delegation to API и generic error mapping.
- Реализован `HttpAuthGateway.logout()`.

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Auth] User can restore current session`

## Учебные инфраструктурные задачи

- Последовательность после текущего product scope: authorization only -> unit/component specs -> Playwright flow -> deployment.
- Цель deployment-этапа: задеплоить Angular frontend на VDS через Docker + nginx, с CI/CD через GitHub Actions.
- Перед началом deployment-этапа иметь стабильный `npm test` / unit specs.
- Перед началом deployment-этапа иметь Playwright e2e для sign up / sign in / session restore.
- Перед началом deployment-этапа иметь production build без ошибок.
- Перед началом deployment-этапа иметь понятную config story для API URL, даже если backend пока mock/fake.
- Перед началом deployment-этапа иметь GitHub repository, откуда будет запускаться pipeline.
- Изучить Docker для frontend-only сценария: собрать Angular production build и раздавать `dist` через nginx container.
- Изучить Docker для frontend dev-сценария: Angular dev server внутри container, volumes и hot reload.
- Добавить Playwright e2e-проверки для authorization flow после стабилизации current session и logout.
- После завершения auth-flow разобрать deployment на VDS: Docker/nginx, domain или IP, HTTPS и ограничения remote backend по CORS/session cookie.
- Первый deployment делать с GitHub через ручной `git pull` на VDS, затем `docker build` и restart container.
- CI/CD через GitHub Actions рассмотреть после первого успешного ручного deployment.
- Vagrant не использовать на текущем этапе: нет потребности в локальных VM для frontend-only проекта.
- Ansible рассмотреть после первого ручного VDS deployment, если потребуется повторяемая настройка сервера.
