# TODO

Короткий план на первое время под упрощенный Feature-Sliced Design.

## Текущая очередь MVP: Authorization

1. `[in progress] [Shared UI] Create reusable button component`
2. `[todo] [Shared UI] Create reusable input component`
3. `[todo] [Auth] User can sign up`
4. `[todo] [Auth] User can sign in`

## Уже сделано

- Перенесен `sign-up-form` в `features/auth/sign-up/ui/sign-up-form`.
- Есть страницы `pages/sign-in` и `pages/sign-up`.
- Принято правило группировки features: `features/{domain}/{scenario}`.
- Принято правило нейминга: не используем `store`, состояние держим в Angular `*.service.ts` с signals.

## Архитектура: ближайшие задачи

1. Создать слой `entities`.
2. Создать `entities/user`.
3. Создать `features/auth/sign-in`.
4. Создать `features/auth/api/auth.api.ts` для `signIn()` и `signUp()`.
5. Создать `shared/api` для общей API-инфраструктуры.
6. Создать `shared/ui` для базовых dumb-компонентов.
7. Проверить импорты после переноса `sign-up-form` и заменить длинные относительные пути, если они станут неудобными.
8. Не добавлять `widgets`, пока страницы не стали крупными.

## Авторизация

1. Создать `features/auth/sign-in/ui/sign-in-form`.
2. Добавить `features/auth/sign-in/model/sign-in.facade.ts`, если логика входа станет сложной.
3. Добавить `features/auth/sign-up/model/sign-up.facade.ts`, если логика регистрации станет сложной.
4. Создать `entities/user/model/user.types.ts`.
5. Создать `entities/user/model/user-session.service.ts`.
6. Создать `entities/user/api/user.api.ts` для получения текущего пользователя.
7. Реализовать регистрацию через `features/auth/api/auth.api.ts`.
8. Реализовать вход через `features/auth/api/auth.api.ts`.
9. Реализовать проверку текущего пользователя через `entities/user/api/user.api.ts`.

## Роутинг

1. Перевести `sign-in` и `sign-up` на lazy loading через `loadComponent`.
2. Решить, нужен ли текущий `pages/main`, или заменить его на будущий `pages/messenger`.
3. После авторизации добавить guard для закрытых страниц.
4. После авторизации добавить guest guard для страниц входа и регистрации.

## UI

1. Решить, оставить текущий `Button` директивой или заменить на компонент.
2. Если делать компонент, перенести его в `shared/ui/button`.
3. Добавить базовые dumb-компоненты по мере необходимости:

```text
shared/ui/button
shared/ui/input
shared/ui/form-field
shared/ui/loader
```

## Позже

1. Создать страницу `pages/messenger`.
2. Создать `entities/chat`.
3. Создать `entities/message`.
4. Создать `features/auth/logout`.
5. Создать `features/profile/update-profile`.
6. Создать `features/messages/send-message`.
7. Создать `features/chats/create-chat`.
8. Добавить WebSocket-сервис.
9. Добавить unread-счетчики.
10. Добавить `widgets`, если страницы станут слишком крупными.
