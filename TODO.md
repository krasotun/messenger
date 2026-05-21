# TODO

## Активная задача

```text
Нет активной задачи
```

## Текущий шаг

- `[Infra] Add Playwright e2e setup` закрыта.
- `[Auth] User can sign out` закрыта.
- Authorization-only MVP закрыт на уровне unit/component specs.
- Следующий рекомендуемый шаг: добавить Playwright e2e для authorization flow отдельной задачей.

## Scope

- Нет активного product scope.
- Следующий scope формулировать отдельной задачей перед началом e2e/deployment работ.

## Out of Scope

- Profile page.
- Chats/messages.
- Полноценная main page/settings UI.
- Новые auth API/application flows.
- CI/CD и deployment.

## Acceptance Criteria

- Нет активной задачи.

## Завершено

- Закрыта issue `[Auth] User can restore current session`.
- Закрыта issue `[Auth] User is redirected based on current session`.
- Закрыта issue `[Auth] User can sign out`.
- Уточнен backend contract для `GET /auth/user` и `POST /auth/logout`.
- Уточнен backend contract для `POST /auth/signin`: успешный ответ приходит как `text/plain OK`.
- Добавлены application contracts/types для current session.
- Добавлены infrastructure DTO для current user.
- Добавлен `AuthApi.signIn()` spec для `responseType: text`.
- Добавлены `AuthApi` specs для current session и logout.
- Реализован `AuthApi.signIn()` с чтением successful response как text, чтобы Angular не парсил `OK` как JSON.
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
- Добавлен presentation flow для successful sign-in: `SignInForm` эмитит success event, `SignInPage` перенаправляет пользователя на `/`.
- Добавлены component specs для sign-in success event и redirect на `/`.
- Добавлен app initializer для запуска `CurrentSessionService.restoreCurrentSession()` при старте приложения.
- Зафиксирован spec для startup initializer: при Angular app initialization вызывается `restoreCurrentSession()`.
- Подключен startup session restore через `appConfig.providers`.
- Добавлен `guestOnlyGuard`: authenticated пользователь с `/sign-in` и `/sign-up` редиректится на `/`, anonymous пользователь допускается.
- Добавлен `authenticatedOnlyGuard`: authenticated пользователь допускается на `/`, остальные статусы редиректятся на `/sign-in`.
- Добавлена временная `/` home placeholder page в рамках authorization-only scope.
- На временную `/` home placeholder page добавлен минимальный logout action без profile/settings/chats/messages.
- Добавлены component specs для logout UI: action виден, click вызывает `CurrentSessionService.logout()`, success/error перенаправляют на `/sign-in`.
- Обновлен routing: `/` защищен `authenticatedOnlyGuard`, `/sign-in` и `/sign-up` защищены `guestOnlyGuard`.
- Page routes переведены на lazy loading через `loadComponent`.
- Закрыта issue `[Infra] Add Playwright e2e setup`.
- Подключен Playwright.
- Добавлен npm script `e2e`.
- Настроен Angular dev server для Playwright e2e.
- Добавлен первый smoke e2e `anonymous opens / -> redirected to /sign-in`.
- В первом smoke e2e используется Playwright route mocking:
  `GET /auth/user -> 401 Unauthorized`.
- Зафиксирован диагностический запуск `npx playwright test --ui` в README.

## Текущий MVP

Продуктовый фокус: authorization only.

Milestone: `MVP: Authorization only`.

Статус: закрыт на уровне unit/component specs.

1. `[Auth] User can restore current session` - закрыта.
2. `[Auth] User is redirected based on current session` - закрыта.
3. `[Auth] User can sign out` - закрыта.

## Будущие задачи

- Добавить Playwright e2e для authorization flow отдельной задачей:
  sign up / sign in / session restore / logout.
- После e2e стабилизации перейти к deployment readiness.

## Учебные инфраструктурные задачи

Milestone: `Infra: E2E and deployment readiness`.

- Последовательность после текущего product scope: authorization only -> unit/component specs -> Playwright flow -> deployment.
- Issue `[Infra] Add Playwright e2e setup` закрыта: базовый e2e-контур готов.
- Следующие e2e для sign up/sign in/session restore/logout заводить отдельной задачей.
- Цель deployment-этапа: задеплоить Angular frontend на VDS через Docker + nginx, с CI/CD через GitHub Actions.
- Перед началом deployment-этапа иметь стабильный `npm test` / unit specs.
- Перед началом deployment-этапа иметь Playwright e2e для sign up / sign in / session restore.
- Перед началом deployment-этапа иметь production build без ошибок.
- Перед началом deployment-этапа иметь понятную config story для API URL, даже если backend пока mock/fake.
- Перед началом deployment-этапа иметь GitHub repository, откуда будет запускаться pipeline.
- Изучить Docker для frontend-only сценария: собрать Angular production build и раздавать `dist` через nginx container.
- Изучить Docker для frontend dev-сценария: Angular dev server внутри container, volumes и hot reload.
- Добавить Playwright e2e-проверки для authorization flow.
- После завершения auth-flow разобрать deployment на VDS: Docker/nginx, domain или IP, HTTPS и ограничения remote backend по CORS/session cookie.
- Первый deployment делать с GitHub через ручной `git pull` на VDS, затем `docker build` и restart container.
- CI/CD через GitHub Actions рассмотреть после первого успешного ручного deployment.
- Vagrant не использовать на текущем этапе: нет потребности в локальных VM для frontend-only проекта.
- Ansible рассмотреть после первого ручного VDS deployment, если потребуется повторяемая настройка сервера.
