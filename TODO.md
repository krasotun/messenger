# TODO

## Активная задача

```text
[Identity Access] User can sign up
```

## Текущий шаг

- `SignUpInput` создан в `application/sign-up.input.ts`.
- Реализован request mapper `SignUpInput -> SignUpRequestDto` в `infrastructure/sign-up-request.mapper.ts`.
- Добавлен базовый `SignUpService` в `application/sign-up.service.ts` со state для `idle/submitting/success/error`.
- В `presentation/sign-up-form` собрана typed reactive form с validators и отображением field-level ошибок.
- `onSubmit()` реализован и форма подключена к `SignUpService`.
- Подключены invalid submit guard с `markAllAsTouched()`, submit loading state и submit-level error message.
- После success выполняется redirect на `sign-in` из `presentation` через `effect`.
- Success notification отложен до появления общего notification service.
- `SignUpService` покрыт unit-тестами: initial state, submitting/success/error, reset state, backend/generic error mapping.
- `signUpRequestMapper` косвенно покрыт через `SignUpService`; прямой mapper spec добавить, если mapping разрастется.
- `AuthApi.signUp(...)` покрыт unit-тестом: POST на `/auth/signup`, request DTO, response DTO.
- `sign-up-form component` покрыт unit-тестами: invalid submit, `markAllAsTouched()`, вызов `SignUpService.signUp(...)`, disabled state во время submit, submit-level error rendering, success redirect/reset.
- Existing shared UI/auth shell specs приведены к Angular required input/injection-context API.
- Full test suite green: `11` spec files, `38` tests.
- Следующий шаг: начать `[Identity Access] User can sign in` с введения `AuthGateway`/`HttpAuthGateway`.

## Действия

- Написать unit-тесты для `sign-up` feature.
- При усложнении mapping добавить прямой `sign-up-request.mapper.spec.ts`: `SignUpInput -> SignUpRequestDto`, включая `firstName -> first_name` и `secondName -> second_name`.
- После зеленого test suite и при старте следующей фичи `[Identity Access] User can sign in` ввести application port/gateway для auth backend:
  - `application/auth.gateway.ts`: `AuthGateway` interface + `AUTH_GATEWAY` injection token;
  - `infrastructure/http-auth.gateway.ts`: Angular service adapter, implements `AuthGateway`;
  - связать `AUTH_GATEWAY -> HttpAuthGateway` в `app.config.ts`;
  - перенести `signUpRequestMapper(...)` и вызов `AuthApi.signUp(...)` из `SignUpService` в `HttpAuthGateway`;
  - в `SignUpService` оставить application state flow: `idle/submitting/success/error`;
  - HTTP-to-application error mapping выносить в gateway, когда появится дублирование на `sign in`.
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

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Shared UI] Create reusable button component`
2. `[Shared UI] Create reusable form field and input directive`
3. `[Identity Access] User can sign up`
4. `[Identity Access] User can sign in`
   - После починки текущих specs добавить application port/gateway для auth backend и HTTP adapter в `infrastructure`.
