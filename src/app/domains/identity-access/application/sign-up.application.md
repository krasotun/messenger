## Purpose
Зарегистрировать нового пользователя
## Input
Валидные данные регистрации из Sign Up domain model
## Flow
- получить валидные данные
- отправить запрос
- перейти в success или error state
## State
- idle
- submitting
- success
- error
## Success Result
- Получили createdUserId
- Показать успешную нотификацию
- Перешли на страницу sign-in
## Error Result
- показать backend error message, если он есть
- иначе показать generic sign-up error
