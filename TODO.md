# TODO

## Активная задача

```text
[Identity Access] User can sign in
```

## Текущий шаг

- Перейти на TDD-порядок разработки для текущей и следующих задач.
- Следующий шаг: начать sign-in presentation flow с failing component specs для формы.

## Действия

- Методология разработки:
  - active: TDD для всех новых изменений в business/application/presentation flow;
  - сначала фиксировать ожидаемое поведение в unit/component spec;
  - затем делать минимальную production-реализацию;
  - после green state выполнять refactor без расширения scope;
  - исключения: документация, конфигурация и явно зафиксированный технический долг.
- Ввести application port/gateway для auth backend:
  - done: `application/auth.gateway.ts`: `AuthGateway` interface + `AUTH_GATEWAY` injection token;
  - done: метод gateway пока только `signUp(input: SignUpInput): Observable<SignUpResult>`;
  - done: `SignUpResult` - application-level result, не backend DTO;
  - done: `infrastructure/http-auth-gateway.ts`: Angular service adapter, implements `AuthGateway`;
  - done: перенести `signUpRequestMapper(...)` и вызов `AuthApi.signUp(...)` из `SignUpService` в `HttpAuthGateway`;
  - done: мапить `SignUpResponseDto` в `SignUpResult` внутри `HttpAuthGateway`;
  - done: мапить backend/HTTP errors в shared `ApplicationError` внутри `HttpAuthGateway`;
  - done: связать `AUTH_GATEWAY -> HttpAuthGateway` в `app.config.ts`;
  - done: в `SignUpService` оставить только application state flow: `idle/submitting/success/error`.
- Актуализировать unit-тесты под gateway boundary:
  - done: `SignUpService` мокает `AUTH_GATEWAY`, а не `AuthApi`;
  - done: добавить `HttpAuthGateway` spec: `SignUpInput -> AuthApi.signUp(SignUpRequestDto)`;
  - done: покрыть `HttpAuthGateway` mapping `SignUpResponseDto -> SignUpResult`;
  - done: покрыть `HttpAuthGateway` mapping backend/generic errors в `ApplicationError`;
  - `AuthApi.signUp(...)` HTTP spec оставить без изменений.
- После gateway-правки начать sign-in backend contract:
  - done: уточнить endpoint, request DTO и response/session behavior в `infrastructure/auth-api.contract.md`;
  - done: добавить `SignInInput` в `application`;
  - done: добавить sign-in DTO и request mapper в `infrastructure`;
  - done: расширить `AuthApi` HTTP method только HTTP-запросом;
  - done: покрыть `AuthApi.signIn(...)` HTTP-level spec, включая `withCredentials: true`.
- Расширить gateway под sign-in:
  - done: через тест зафиксировать delegation: `SignInInput -> AuthApi.signIn(SignInRequestDto)`;
  - done: через тест зафиксировать success mapping в application-level result;
  - done: через тест зафиксировать backend/generic error mapping в `ApplicationError`;
  - done: добавить `SignInResult` в `application`;
  - done: расширить `AuthGateway` методом `signIn(input: SignInInput)`;
  - done: реализовать `HttpAuthGateway.signIn(...)` через mapper и `AuthApi.signIn(...)`.
- Реализовать sign-in application flow:
  - done: создать минимальный `SignInService` scaffold без реального flow, чтобы IDE/TestBed видели публичный API;
  - done: вынести общий auth flow status в `application/auth-flow-status.ts`;
  - done: перевести sign-up service/spec/presentation spec на `AuthFlowStatus`;
  - done: добавить specs для initial `SignInService` state: `AuthFlowStatus.Idle`, `errorMessage = null`, `isSubmitting = false`;
  - done: добавить specs для `SignInService` state flow: delegation, pending, success, application error, reset;
  - done: реализовать `SignInService` со state `idle/submitting/success/error`;
  - done: использовать `AUTH_GATEWAY`, без прямых DTO/API imports.
- Refactor общего auth flow state:
  - цель обучения: понять state helper как lightweight state controller / explicit finite state model;
  - done: сравнить `SignUpService` и `SignInService` по фактическому дублированию;
  - done: подтвердить, что совпадает только техническое управление `status/error`;
  - done: зафиксировать ожидаемый контракт helper тестами;
  - done: добавить `create-auth-flow-state.ts` как application-layer helper;
  - done: helper не знает sign-up/sign-in business meaning, gateway, DTO, API, Router или UI;
  - done: перенести `SignInService` на helper без изменения публичного API;
  - done: перенести `SignUpService` на helper без изменения публичного API;
  - done: сделать `markError(...)` независимым от `ApplicationError`: helper принимает error message string, services извлекают message;
  - done: сократить service specs до orchestration-контракта: gateway delegation, pending submit, success integration, error integration, reset через публичные методы;
  - done: закрыть writable signals наружу read-only контрактом через `asReadonly()`;
  - done: оставить `.set(...)` только внутри `createAuthFlowState`.
- Реализовать sign-in presentation flow:
  - сначала добавить failing component specs для формы;
  - затем собрать typed reactive form для login/password;
  - подключить validators, invalid submit guard, loading state, submit-level error;
  - post-success поведение определить отдельно до добавления session restore/guards.
- В конце задачи привести imports к единому alias style:
  - проверить `@app`, `@domains`, `@shared` usage;
  - убрать смешение relative imports и aliases там, где это ухудшает читаемость;
  - не делать отдельную alias-правку до завершения gateway/sign-in flow.
- В конце sign-in задачи добавить ESLint-проверку архитектурных import boundaries:
  - запретить импорт высокоуровневых слоев из низкоуровневых;
  - зафиксировать правила `domain -> application -> infrastructure` и `presentation -> application`;
  - проверить запрет зависимостей `shared` от доменов.
- При появлении общего notification service вернуть success notification после successful sign up.
- Не добавлять session restore, guards, chats/messages и другие messenger-сценарии в рамках этой задачи.

## Unit Tests

- `SignUpService` - done.
- `signUpRequestMapper` - covered indirectly through `SignUpService`.
- `AuthApi.signUp` - done.
- `sign-up-form component` - done:
  - initial form state and validators;
  - invalid submit: no `SignUpService.signUp(...)`, `markAllAsTouched()`;
  - valid submit: call `SignUpService.signUp(...)` with `SignUpInput`;
  - submitting state: disabled controls/submit;
  - submit-level error rendering;
  - success redirect effect: reset state and navigate to `/sign-in`.

`sign-up-form` tests should mock `SignUpService` and `Router`; do not use real `AuthApi`.

- Fixed existing generated/legacy UI specs:
  - `shared/ui/button/button.spec.ts`;
  - `shared/ui/input/input.spec.ts`;
  - `shared/ui/form-field/form-field.spec.ts`;
  - `domains/identity-access/presentation/auth-form-shell/auth-form-shell.spec.ts`.

Planned for gateway/sign-in:

- `SignUpService` - done: mocks `AUTH_GATEWAY`.
- `HttpAuthGateway` - done: covers sign-up delegation, result mapping and error mapping.
- `AuthApi.signIn` - done: HTTP-level spec including `withCredentials: true`.
- `HttpAuthGateway.signIn` - done: covers delegation, success result and backend/generic error mapping.
- `SignInService` - done: covers initial state, delegation, pending, success, application error and reset.
- Auth flow state helper - done: covers initial state, submitting, success, error and reset.
- Auth flow state helper integration - done: `SignInService` and `SignUpService` use helper without public API changes.
- Service specs refactor - done: service tests focus on orchestration and do not mutate writable signals directly.
- Read-only auth flow state - done: services expose read-only signals; mutation stays inside `createAuthFlowState`.
- `sign-in-form component` - next: add failing presentation specs before implementation, mirroring sign-up where applicable.

## Готово

- `[Architecture] Align project folders with domain-first structure`
- `[Shared UI] Create reusable button component`
- `[Shared UI] Create reusable form field and input directive`
- `[Identity Access] Fix auth page/form shell layout and sign-up form composition`
- `[Identity Access] Keep auth shells layout-only and sign-in/sign-up as separate forms/pages`
- `[Identity Access] Fix sign up backend contract in docs`
- `[Identity Access] Fix sign up domain model in docs`
- `[Identity Access] Fix sign up application scenario in docs`
- `[Identity Access] Decide post-sign-up behavior: Success notification and redirect to sign-in`
- `[Core] Add API base URL token and app-level provider`
- `[Identity Access] Add sign up DTOs and auth API setup`
- `[Identity Access] Add SignUpInput contract in application`
- `[Identity Access] Create empty sign-up-request mapper file in infrastructure`
- `[Identity Access] Implement sign-up request mapper`
- `[Identity Access] Add basic SignUpService with sign-up scenario state and API call`
- `[Identity Access] Build typed sign-up reactive form with validators and field-level error display`
- `[Identity Access] Implement sign-up form submit flow and connect it to SignUpService`
- `[Identity Access] Add invalid submit guard with markAllAsTouched()`
- `[Identity Access] Add sign-up loading state and disable form controls during submit`
- `[Identity Access] Add submit-level backend/generic sign-up error rendering`
- `[Identity Access] Move post-sign-up redirect to presentation and navigate to sign-in on success`
- `[Identity Access] Cover SignUpService with unit tests`
- `[Identity Access] Cover AuthApi.signUp with unit test`
- `[Identity Access] Cover sign-up-form component with unit tests`
- `[Testing] Fix shared UI/auth shell specs for Angular required inputs and signal inputs`
- `[Identity Access] Disable sign-up reactive form through FormGroup state instead of disabled attributes`
- `[Identity Access] User can sign up`
- `[Identity Access] Add AuthGateway port and HttpAuthGateway adapter`
- `[Identity Access] Move sign-up API/DTO mapping from SignUpService to HttpAuthGateway`
- `[Identity Access] Normalize auth backend errors to shared ApplicationError`
- `[Identity Access] Update SignUpService tests to mock AUTH_GATEWAY`
- `[Identity Access] Cover HttpAuthGateway with unit tests`
- `[Identity Access] Fix sign in backend contract in docs`
- `[Identity Access] Add SignInInput contract in application`
- `[Identity Access] Add sign in DTO and request mapper`
- `[Identity Access] Add AuthApi.signIn HTTP method`
- `[Identity Access] Cover AuthApi.signIn with unit test`

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Shared UI] Create reusable button component`
2. `[Shared UI] Create reusable form field and input directive`
3. `[Identity Access] User can sign up` - done
4. `[Identity Access] User can sign in` - in progress
   - Следующий шаг: начать sign-in presentation flow с failing component specs для формы.
