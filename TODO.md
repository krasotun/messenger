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
- Следующий шаг: реализовать `onSubmit()` и подключить форму к `SignUpService`.

## Действия

- Реализовать `onSubmit()` в `sign-up-form.ts`.
- При invalid submit делать `markAllAsTouched()` и не отправлять запрос.
- При valid submit собирать `SignUpInput` через `getRawValue()` и вызывать `SignUpService.signUp(...)`.
- После этого подключить loading state и показ backend/generic submit error message из `SignUpService`.
- После success показать notification и перевести пользователя на `sign-in`.
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

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Shared UI] Create reusable button component`
2. `[Shared UI] Create reusable form field and input directive`
3. `[Identity Access] User can sign up`
4. `[Identity Access] User can sign in`
