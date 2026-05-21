# TODO

## Активная задача

```text
[Auth] User can restore current session
```

## Текущий шаг

- Закрыть `[Auth] User can restore current session`.
- Следующий продуктовый шаг: `[Auth] User is redirected based on current session`.

## Scope

- Восстанавливать auth state при входе в приложение через backend session cookie.
- Не хранить auth tokens в `localStorage` или `sessionStorage`.
- Добавить current session application state: loading/unknown, authenticated, anonymous.
- После successful sign-in обновлять или перепроверять current session state.

## Out of Scope

- Profile page.
- Chats/messages.
- Route guards и protected redirects.
- Post-sign-in navigation на приватную страницу.

## Acceptance Criteria

- После sign-in приложение знает, что пользователь authenticated.
- После reload приложение восстанавливает authenticated state через current session endpoint.
- Если session cookie отсутствует или backend возвращает unauthorized, state становится anonymous.
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

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Auth] User can restore current session`
2. `[Auth] User is redirected based on current session`
3. `[Auth] User can sign out`

## Будущие задачи

- `[Auth] User can sign out`: пользовательский logout будет доступен на главной странице в настройках, когда появится main page/settings UI. Backend/application logout flow уже подготовлен: `POST /auth/logout` и очистка current session state.

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
