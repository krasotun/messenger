## Purpose
Зарегистрировать нового пользователя
## Input
Валидные данные регистрации из Sign Up domain model
## Flow
- получить валидные данные
- отправить запрос
- перейти в Success или Error state
## State
- Idle
- Submitting
- Success
- Error
## Success Result
- Получили createdUserId
- Показать успешную нотификацию
- Перешли на страницу sign-in
## Error Result
- показать backend Error message, если он есть
- иначе показать generic sign-up Error
