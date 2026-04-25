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
- Следующий шаг: покрыть feature unit-тестами.

## Действия

- Написать unit-тесты для `sign-up` feature.
- Проверить `SignUpService`: `idle/submitting/success/error`, reset state, backend/generic error mapping.
- Проверить `sign-up-form`: invalid submit, `markAllAsTouched()`, вызов `SignUpService.signUp(...)`, disabled state во время submit, submit-level error rendering.
- При появлении общего notification service вернуть success notification после successful sign up.
- Не добавлять session restore, guards, chats/messages и другие messenger-сценарии в рамках этой задачи.

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

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Shared UI] Create reusable button component`
2. `[Shared UI] Create reusable form field and input directive`
3. `[Identity Access] User can sign up`
4. `[Identity Access] User can sign in`
