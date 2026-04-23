# TODO

## Активная задача

```text
[Identity Access] User can sign up
```

## Текущий шаг

- Реализовать `sign-up.mapper.ts` для преобразования `SignUpResponseDto` во внутренний результат сценария.

## Действия

- Добавить infrastructure-слой: mapper для `sign up`.
- Собрать presentation-слой: поля формы, validation messages, submit handling.
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
- `[Identity Access] Decide post-sign-up behavior: success notification and redirect to sign-in`
- `[Core] Add API base URL token and app-level provider`
- `[Identity Access] Add sign up DTOs and auth API setup`

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Shared UI] Create reusable button component`
2. `[Shared UI] Create reusable form field and input directive`
3. `[Identity Access] User can sign up`
4. `[Identity Access] User can sign in`
