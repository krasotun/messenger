## Purpose
Авторизовать существующего пользователя

## Input
Валидные данные входа из Sign In domain/application model

## Flow
- получить валидные данные
- отправить sign-in запрос через `AUTH_GATEWAY`
- перейти в Success или Error state

## State
- Idle
- Submitting
- Success
- Error

## Success Result
- Получили подтверждение успешной авторизации
- Backend установил session cookie
- Application result: `authenticated: true`
- Post-success поведение будет определено отдельно до добавления session restore/guards

## Error Result
- показать backend Error message, если он есть
- иначе показать generic sign-in Error
