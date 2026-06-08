## Purpose

Обновить профиль текущего пользователя.

## Initial Data

Форма редактирования профиля предварительно заполняется из текущего `CurrentUser`.

Редактируемые поля:

- `firstName`: string
- `secondName`: string
- `displayName`: string
- `login`: string
- `email`: string
- `phone`: string

Не редактируются в этом flow:

- `id`
- `avatar`

## Input

Валидные editable profile fields из Profile editing domain/application model.

## Flow

- получить текущего пользователя для initial form state
- получить валидные editable profile fields
- отправить update profile request через user API boundary
- получить `CurrentUserDTO` от backend
- обновить current session пользователем из backend response
- вернуть updated current user caller'у

## State

- Idle
- Submitting
- Success
- Error

## Success Result

- Current session обновлена из backend `CurrentUserDTO`
- Application result: updated current user
- Navigation не выполняется
- UI может закрыть profile editing modal после успешного результата

## Error Result

- Current session не меняется
- показать backend Error message, если он есть
- иначе показать generic update profile Error
- введенные пользователем значения остаются в форме для исправления

## Test Contract

- When current user exists, profile editing form receives editable fields as initial data.
- When update profile succeeds, application layer sends editable profile fields to user API boundary.
- When update profile succeeds, current session is updated from backend response.
- When update profile succeeds, caller receives updated current user.
- When update profile succeeds, application layer does not trigger navigation.
- When update profile fails, current session is not changed.
