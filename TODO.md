# TODO

## Активная задача

```text
[Auth] User can restore current session
```

## Текущий шаг

- Написать `HttpAuthGateway` specs для current session и logout.
- Зафиксировать mapping `CurrentUserDto -> CurrentUser`.
- Зафиксировать, что `401 Unauthorized` current session возвращает anonymous result.

## Scope

- Восстанавливать auth state при входе в приложение через backend session cookie.
- Не хранить auth tokens в `localStorage` или `sessionStorage`.
- Добавить current session application state: loading/unknown, authenticated, anonymous.
- После successful sign-in обновлять или перепроверять current session state.
- Добавить logout flow: backend logout call и очистка application session state.

## Out of Scope

- Profile page.
- Chats/messages.
- Route guards и protected redirects.
- Post-sign-in navigation на приватную страницу.

## Acceptance Criteria

- После sign-in приложение знает, что пользователь authenticated.
- После reload приложение восстанавливает authenticated state через current session endpoint.
- Если session cookie отсутствует или backend возвращает unauthorized, state становится anonymous.
- После logout state становится anonymous.
- Новые application/infrastructure flows покрыты specs до реализации.

## Завершено

- Уточнен backend contract для `GET /auth/user` и `POST /auth/logout`.
- Добавлены application contracts/types для current session.
- Добавлены infrastructure DTO для current user.
- Добавлены `AuthApi` specs для current session и logout.
- Реализованы `AuthApi.currentSession()` и `AuthApi.logout()`.
- Вынесен повторяющийся auth error mapping из `HttpAuthGateway` в локальный infrastructure mapper.

## Текущий MVP

Продуктовый фокус: authorization only.

1. `[Auth] User can restore current session`
