# TODO

## Активная задача

```text
[Identity Access] User can sign in
```

## Текущий шаг

- Завершить gateway test coverage перед переходом к sign-in backend contract.
- Следующий шаг: дописать `HttpAuthGateway` spec.
- После gateway spec переходить к sign-in contract: `SignInInput`, DTO, mapper, API method, application service, presentation form/page.

## Действия

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
  - next: добавить `HttpAuthGateway` spec: `SignUpInput -> AuthApi.signUp(SignUpRequestDto)`;
  - next: покрыть `HttpAuthGateway` mapping `SignUpResponseDto -> SignUpResult`;
  - next: покрыть `HttpAuthGateway` mapping backend/generic errors в `ApplicationError`;
  - `AuthApi.signUp(...)` HTTP spec оставить без изменений.
- После gateway-правки начать sign-in backend contract:
  - уточнить endpoint, request DTO и response DTO в `infrastructure/auth-api.contract.md`;
  - добавить `SignInInput` в `application`;
  - добавить sign-in DTO и request mapper в `infrastructure`;
  - расширить `AuthApi` HTTP method только HTTP-запросом.
- Реализовать sign-in application flow:
  - добавить `SignInService` со state `idle/submitting/success/error`;
  - использовать `AUTH_GATEWAY`, без прямых DTO/API imports;
  - HTTP-to-application error mapping вынести в gateway, если появится дублирование с sign-up.
- Реализовать sign-in presentation flow:
  - собрать typed reactive form для login/password;
  - подключить validators, invalid submit guard, loading state, submit-level error;
  - post-success поведение определить отдельно до добавления session restore/guards.
- В конце задачи привести imports к единому alias style:
  - проверить `@app`, `@domains`, `@shared` usage;
  - убрать смешение relative imports и aliases там, где это ухудшает читаемость;
  - не делать отдельную alias-правку до завершения gateway/sign-in flow.
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
- `HttpAuthGateway` - next: add spec for sign-up delegation, result mapping and error mapping.
- `AuthApi.signIn` - add HTTP-level spec after backend contract is fixed.
- `SignInService` - add state flow specs.
- `sign-in-form component` - add presentation specs, mirroring sign-up where applicable.

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

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Shared UI] Create reusable button component`
2. `[Shared UI] Create reusable form field and input directive`
3. `[Identity Access] User can sign up` - done
4. `[Identity Access] User can sign in` - in progress
   - Сначала добавить application port/gateway для auth backend и HTTP adapter в `infrastructure`.
