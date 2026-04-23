# Sign Up Domain

## Purpose
Регистрация нового пользователя в системе

## Input model
- `firstName`: string - First name
- `secondName`: string - Second name
- `login`: string - User login
- `email`: string - User e-mail
- `password`: string  - User password
- `phone`: string - User mobile phone number


## Local Rules
- Все поля обязательны
- Email-формат `^\S+@\S+$`
- Phone-формат `^((8|+7)[- ]?)?((?\d{3})?[- ]?)?[\d- ]{7,10}$`

## Backend Constraints
- Уникальность логина проверяется бекендом
