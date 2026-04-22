# TODO

## Активная задача

```text
[Identity Access] User can sign up
```

## Действия

- Уточнить backend contract для sign up: request, success response, error response.
- Описать domain-модель sign up: email, password, validation rules, domain errors.
- Добавить application-сценарий sign up: loading, success, error state.
- Добавить infrastructure-слой: DTO, mapper, `sign-up.api.ts`.
- Собрать presentation-слой: поля формы, validation messages, submit handling.
- Добавить доменный `auth-form-shell` в `identity-access/presentation` для общего каркаса auth-форм: title/subtitle, form container, slots для content/actions/footer.
- Использовать `auth-form-shell` как layout-компонент без бизнес-сценариев, API, state и routing-логики.
- Оставить `sign-in-form` и `sign-up-form` отдельными компонентами, без универсальной config-driven auth form.
- Оставить `sign-in-page` и `sign-up-page` отдельными страницами; не объединять их в универсальную auth page с mode/config.
- Gap между полями и блок actions держать внутри конкретной формы; общие значения spacing задавать через CSS variables/tokens.
- Решить поведение после успешной регистрации: показать success state или перейти дальше, в зависимости от backend response.
- Не добавлять session restore, guards, chats/messages и другие messenger-сценарии в рамках этой задачи.

## Готово

- `[Architecture] Align project folders with domain-first structure`
- `[Shared UI] Create reusable button component`
- `[Shared UI] Create reusable form field and input directive`

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Shared UI] Create reusable button component`
2. `[Shared UI] Create reusable form field and input directive`
3. `[Identity Access] User can sign up`
4. `[Identity Access] User can sign in`
