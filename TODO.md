# TODO

## Активная задача

```text
[Infra] Add Docker production image and run e2e against container
```

## Текущий шаг

- `[Infra] Add Playwright e2e setup` закрыта.
- `[Auth] User can sign out` закрыта.
- Authorization-only MVP закрыт на уровне unit/component specs.
- Playwright route-mocked e2e покрытие authorization flow закрыто.
- Sign-up e2e покрывает successful registration и backend error.
- Sign-in e2e покрывает successful authorization и backend error.
- Session restore e2e покрывает authenticated user opening `/`.
- Logout e2e покрывает authenticated user logout и redirect на `/sign-in`.
- Последняя проверка auth e2e: `npx playwright test e2e/auth --project=chromium` -> `7 passed`.
- Allure reporting для Playwright e2e подключен без Java-зависимости через Allure 3 CLI.
- Desktop screenshot e2e для auth UI добавлены.
- Последняя проверка screenshot e2e: `npx playwright test e2e/auth/*.screenshot.spec.ts --project=chromium` -> passed.
- Docker production image для Angular frontend добавлен.
- Angular production build раздается через nginx container из `dist/messenger/browser`.
- SPA fallback на `index.html` добавлен для прямого открытия `/`, `/sign-in` и `/sign-up`.
- Добавлен Playwright container e2e запуск против `http://localhost:8080` без `ng serve`.
- Последняя проверка Docker-based e2e: `npm run e2e:container` -> `9 passed`.
- Ручной Docker workflow: `docker build -t messenger-frontend:local .` -> `npm run docker:run`.

## Scope

- Добавить Dockerfile для frontend production image.
- Собрать Angular production build внутри Docker image.
- Раздавать `dist/messenger/browser` через nginx.
- Добавить nginx SPA fallback на `index.html`.
- Добавить `.dockerignore`.
- Добавить отдельный Playwright запуск против уже поднятого container URL без `ng serve`.
- Использовать route mocks; не ходить в real backend.
- Docker окружение запускать вручную через `docker build` и `docker run`, без Docker Compose.

## Out of Scope

- Profile page.
- Chats/messages.
- Полноценная main page/settings UI.
- Новые auth API/application flows.
- CI/CD и deployment.
- Mobile screenshot e2e.
- Allure reporting changes.
- Docker Compose.
- Mock auth backend.
- CI/CD и deployment automation.

## Acceptance Criteria

- Docker image builds locally.
- Container starts locally and serves Angular production build.
- SPA fallback works: direct opening `/sign-in`, `/sign-up` and `/` returns the frontend app.
- Playwright auth e2e can run against container URL with route mocks.
- Existing route-mocked auth e2e suite remains green.

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
- Добавлены Playwright e2e для sign-up:
  successful registration redirects to `/sign-in`; backend error stays on `/sign-up` and shows registration error.
- Добавлены Playwright e2e для sign-in:
  successful sign-in uses mocked `text/plain OK`, restores current session and redirects to `/`; backend error stays on `/sign-in` and shows authorization error.
- Добавлены Playwright e2e для session restore:
  anonymous user from `/` redirects to `/sign-in`; authenticated user opens `/` and sees home page.
- Добавлен Playwright e2e для logout:
  authenticated user clicks `Logout`, mocked logout succeeds and user lands on `/sign-in`.
- Устранен race в sign-in e2e: тест ждет отрисовку anonymous sign-in form перед переключением mocked current session на authenticated response.
- Route-mocked auth e2e suite закрыт на Chromium:
  `npx playwright test e2e/auth --project=chromium` -> `7 passed`.
- Зафиксирован диагностический запуск `npx playwright test --ui` в README.
- Подключен Allure reporting для Playwright e2e:
  `allure-playwright` пишет raw results в `allure-results`.
- Подключен Allure 3 CLI без Java-зависимости через npm package `allure`.
- Добавлены npm scripts для Allure:
  `e2e:allure`, `allure:generate`, `allure:open`, `allure:run`.
- Добавлены `.gitignore` правила для `allure-results` и `allure-report`.
- Проверено локально: Allure raw results и HTML report генерируются и открываются.
- Issue `[Infra] Add Allure reporting for Playwright e2e` закрыта.
- Добавлены desktop screenshot e2e для auth UI.
- Зафиксированы baseline screenshots для sign-in и sign-up empty forms после ручного просмотра.
- Проверено: `npx playwright test e2e/auth/*.screenshot.spec.ts --project=chromium` проходит.
- Issue `[Infra] Add desktop screenshot e2e for auth UI` закрыта.

## Текущий MVP

Продуктовый фокус: authorization only.

Milestone: `MVP: Authorization only`.

Статус: закрыт на уровне unit/component specs.

1. `[Auth] User can restore current session` - закрыта.
2. `[Auth] User is redirected based on current session` - закрыта.
3. `[Auth] User can sign out` - закрыта.

## Будущие задачи

- После e2e стабилизации перейти к deployment readiness.

## Учебные инфраструктурные задачи

Milestone: `Infra: E2E and deployment readiness`.

- Последовательность после текущего product scope: authorization only -> unit/component specs -> Playwright route-mocked auth flow -> Allure reporting -> screenshot e2e -> Docker-based e2e against frontend production build -> Docker Compose e2e with mock auth backend -> deployment.
- Скриншотные тесты вводить после обычных Playwright e2e: сначала flow-поведение, затем visual regression.
- Allure reporting вводить после стабильного набора Playwright flow e2e, чтобы отчетность описывала уже зафиксированные бизнес-сценарии.
- Первый Allure scope: локальная генерация отчета по Playwright e2e и сохранение raw results для будущего CI artifact.
- Allure не смешивать с deployment: в CI он должен быть quality artifact, а не deployment gate.
- Скриншотное тестирование использовать как учебный regression-контроль принятого UI-состояния, а не как проверку попадания в макет.
- На первом этапе screenshot e2e покрывают только desktop viewport; mobile пока out of scope.
- Первый screenshot scope после стабилизации auth e2e: sign in/sign up empty form, validation errors, loading state, API error.
- Baseline обновлять только после ручного просмотра diff и осознанного подтверждения, что визуальное изменение ожидаемое.
- Issue `[Infra] Add Playwright e2e setup` закрыта: базовый e2e-контур готов.
- Issue `[Auth E2E] Add Playwright coverage for sign up, sign in, session restore and logout` закрыта: route-mocked auth flow покрыт.
- Issue `[Infra] Add Allure reporting for Playwright e2e` закрыта: локальный отчет доступен без Java Runtime.
- Issue `[Infra] Add desktop screenshot e2e for auth UI` закрыта: sign-in/sign-up empty forms покрыты baseline screenshots.
- Цель deployment-этапа: задеплоить Angular frontend на VDS через Docker + nginx, с CI/CD через GitHub Actions.
- Перед началом deployment-этапа иметь стабильный `npm test` / unit specs.
- Перед началом deployment-этапа иметь Playwright e2e для sign up / sign in / session restore / logout.
- Перед началом deployment-этапа иметь production build без ошибок.
- Перед началом deployment-этапа иметь понятную config story для API URL, даже если backend пока mock/fake.
- Перед началом deployment-этапа иметь GitHub repository, откуда будет запускаться pipeline.
- Изучить Docker для frontend-only сценария: собрать Angular production build и раздавать `dist` через nginx container.
- Изучить Docker для frontend dev-сценария: Angular dev server внутри container, volumes и hot reload.
- Добавить отдельный Docker-based e2e контур: Playwright запускается против Angular production build, который раздается из nginx container.
- Docker-based e2e не заменяет быстрый локальный TDD-цикл; использовать его как deployment-readiness проверку после стабильных unit/component specs и обычных Playwright flow tests.
- Acceptance для Docker-based e2e: production image собирается, container стартует локально, health/open page проверка проходит, auth e2e используют route mocks и не требуют real backend.
- Добавить учебный mock auth backend для Docker Compose e2e.
- Mock backend scope: только `POST /auth/signup`, `POST /auth/signin`, `GET /auth/user`, `POST /auth/logout`; без chats/messages/profile flows.
- Mock backend contract должен повторять текущие frontend DTO/expectations и backend Яндекс Практикума только в auth-части.
- Первый storage для mock backend: in-memory; persistence не нужна.
- Предпочтительная session model для mock backend: cookie-based session, чтобы отдельно изучить CORS, credentials, SameSite, container networking и deployment constraints.
- Docker Compose e2e target: frontend production container + mock auth backend container + Playwright runner против compose окружения.
- Route mocks остаются базовым быстрым e2e-слоем; mock backend используется как отдельная deployment-readiness проверка.
- Mock backend явно не считается production backend и не расширяет product scope за пределы authorization only.
- После завершения auth-flow разобрать deployment на VDS: Docker/nginx, domain или IP, HTTPS и ограничения remote backend по CORS/session cookie.
- Первый deployment делать с GitHub через ручной `git pull` на VDS, затем `docker build` и restart container.
- CI/CD через GitHub Actions рассмотреть после первого успешного ручного deployment.
- Vagrant не использовать на текущем этапе: нет потребности в локальных VM для frontend-only проекта.
- Ansible рассмотреть после первого ручного VDS deployment, если потребуется повторяемая настройка сервера.
