## Purpose

Восстановить и хранить текущую авторизационную сессию приложения.

## Source of Truth

- Backend owns session persistence through a cookie.
- Frontend restores current session state through the current session endpoint.
- Frontend must not store auth tokens in `localStorage` or `sessionStorage`.
- Sign-in `200 OK` is not the source of current user state. After successful sign-in,
  frontend should restore current session from backend.

## State

- Unknown
- Loading
- Authenticated
- Anonymous
- Error

## Restore Current Session Flow

- получить текущую backend session через `AUTH_GATEWAY`
- если backend возвращает current user, перейти в `Authenticated`
- если backend возвращает `401 Unauthorized`, перейти в `Anonymous`
- если backend возвращает technical/application error, перейти в `Error`

## Logout Flow

- отправить logout request через `AUTH_GATEWAY`
- после successful logout очистить current user
- перейти в `Anonymous`

## Success Result

- Current user сохранен в application state
- Session state: `Authenticated`

## Anonymous Result

- Current user очищен
- Session state: `Anonymous`

## Error Result

- Current user не используется как подтверждение активной сессии
- Session state: `Error`
- `500 Unexpected Error` не трактуется как `Anonymous`
