# TODO

## Активная задача

```text
[Identity Access] User can sign up
```

## Текущий шаг

- `SignUpInput` создан в `application/sign-up.input.ts`.
- Реализован request mapper `SignUpInput -> SignUpRequestDto` в `infrastructure/sign-up-request.mapper.ts`.
- Добавлен базовый `SignUpService` в `application/sign-up.service.ts` со state для `idle/submitting/success/error`.
- Следующий шаг: подключить `presentation` к `SignUpService`.

## Действия

- Подключить `sign-up-form` к `SignUpService`.
- Собрать `SignUpInput` из данных формы без отдельного form-to-input mapper.
- Добавить submit handling, loading state и показ backend/generic error message.
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

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Shared UI] Create reusable button component`
2. `[Shared UI] Create reusable form field and input directive`
3. `[Identity Access] User can sign up`
4. `[Identity Access] User can sign in`
