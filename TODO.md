# TODO

## Активная задача

```text
[Infra] Add Playwright e2e setup
```

## Текущий шаг

- Стабилизировать первый Playwright smoke e2e:
  `anonymous opens / -> redirected to /sign-in`.
- Для anonymous state использовать Playwright route mocking:
  `GET /auth/user -> 401 Unauthorized`.
- Для обучения и диагностики запускать интерактивный режим:
  `npx playwright test --ui`.

## Scope

- Подключить Playwright к Angular-приложению.
- Добавить npm script для e2e.
- Настроить запуск Angular dev server для e2e.
- Добавить первый smoke e2e:
  `anonymous opens / -> redirected to /sign-in`.
- Использовать Playwright route mocking для `GET /auth/user -> 401 Unauthorized`.

## Out of Scope

- Полноценные sign up/sign in/session restore e2e.
- Backend mocking strategy за пределами одного route mock для smoke-теста.
- CI/CD.
- Deployment.
- Profile page, chats/messages, полноценная main page/settings UI.
- Logout UI.

## Acceptance Criteria

- `npm run e2e` запускает Playwright tests.
- Playwright поднимает Angular dev server или переиспользует уже запущенный server.
- Первый smoke e2e открывает `/`.
- В smoke e2e запрос `GET /auth/user` перехватывается и получает `401 Unauthorized`.
- Anonymous пользователь с `/` редиректится на `/sign-in`.
- Для локального разбора доступен `npx playwright test --ui`.
- E2E не требует реального backend.

## Завершено

- Закрыта issue `[Auth] User can restore current session`.
- Закрыта issue `[Auth] User is redirected based on current session`.
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
- Зафиксированы `CurrentSessionService` specs: initial `status = unknown`, `currentUser = null`.
- Реализован current session state внутри `CurrentSessionService` через private writable signals и public readonly signals.
- Добавлены `CurrentSessionService.restoreCurrentSession()` specs: вызов `AUTH_GATEWAY.currentSession()`, `loading`, successful authenticated result, anonymous result, generic error.
- Реализован `CurrentSessionService.restoreCurrentSession()`: authenticated сохраняет `CurrentUser`, anonymous/error очищает user и переводит state в `anonymous`.
- Добавлены `CurrentSessionService.logout()` specs: вызов `AUTH_GATEWAY.logout()`, success/error очищают current session state.
- Реализован `CurrentSessionService.logout()`: success/error переводят state в `anonymous` и очищают `currentUser`.
- Зафиксирован композиционный контракт `CurrentSessionService.restoreCurrentSession(): Observable<CurrentSessionResult>`.
- Зафиксирован композиционный контракт `CurrentSessionService.logout(): Observable<void>`.
- Убраны внутренние `subscribe` из `CurrentSessionService`: методы возвращают Observable и обновляют signals внутри flow.
- Добавлены specs для sign-in orchestration: после successful sign-in вызывается `restoreCurrentSession()`.
- Зафиксированы bug scenarios sign-in flow: если sign-in request успешен, но `restoreCurrentSession()` возвращает `anonymous` или error, flow не переходит в `success`.
- Реализована связка sign-in flow с current session state через `switchMap`; `markSuccess()` вызывается только после restored `authenticated` session.
- Добавлен app initializer для запуска `CurrentSessionService.restoreCurrentSession()` при старте приложения.
- Зафиксирован spec для startup initializer: при Angular app initialization вызывается `restoreCurrentSession()`.
- Подключен startup session restore через `appConfig.providers`.
- Добавлен `guestOnlyGuard`: authenticated пользователь с `/sign-in` и `/sign-up` редиректится на `/`, anonymous пользователь допускается.
- Добавлен `authenticatedOnlyGuard`: authenticated пользователь допускается на `/`, остальные статусы редиректятся на `/sign-in`.
- Добавлена временная `/` home placeholder page в рамках authorization-only scope.
- Обновлен routing: `/` защищен `authenticatedOnlyGuard`, `/sign-in` и `/sign-up` защищены `guestOnlyGuard`.
- Page routes переведены на lazy loading через `loadComponent`.

## Текущий MVP

Продуктовый фокус: authorization only.

Milestone: `MVP: Authorization only`.

1. `[Auth] User can restore current session`
2. `[Auth] User is redirected based on current session`
3. `[Auth] User can sign out`

## Будущие задачи

- `[Auth] User can sign out`: пользовательский logout будет доступен на главной странице в настройках, когда появится main page/settings UI. Backend/application logout flow уже подготовлен: `POST /auth/logout` и очистка current session state.

## Учебные инфраструктурные задачи

Milestone: `Infra: E2E and deployment readiness`.

- Последовательность после текущего product scope: authorization only -> unit/component specs -> Playwright flow -> deployment.
- Завести отдельную issue `[Infra] Add Playwright e2e setup`.
- Scope issue `[Infra] Add Playwright e2e setup`: подключить Playwright, добавить npm script для e2e, настроить запуск Angular dev server для тестов, добавить первый smoke e2e `anonymous opens / -> redirected to /sign-in`.
- Out of scope issue `[Infra] Add Playwright e2e setup`: полноценные sign up/sign in/session restore e2e, backend mocking strategy, CI/CD, deployment.
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
