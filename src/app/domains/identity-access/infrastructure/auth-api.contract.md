# Identity Access API Contract

Форма запросов и ответов описана типами в `sign-in/sign-in.dto.ts`,
`sign-up/sign-up.dto.ts`, `current-session/current-user.dto.ts` и проверяется
тестами мапперов. Здесь - только то, что нельзя выразить типом: адреса,
работа с сессией и пробелы в Swagger.

## Endpoints

| Use case        | Method | Path           | Credentials |
| --------------- | ------ | -------------- | ----------- |
| Sign Up         | POST   | `/auth/signup` | -           |
| Sign In         | POST   | `/auth/signin` | требуются   |
| Current Session | GET    | `/auth/user`   | требуются   |
| Logout          | POST   | `/auth/logout` | требуются   |

`Credentials` означает `withCredentials: true`: запрос должен нести cookie.

## Session Handling

- Сессией владеет бэкенд и хранит ее в cookie.
- Фронтенд не сохраняет токены в `localStorage` или `sessionStorage`.
- Успех sign-in определяется статусом `200 OK`, а не телом ответа. Тело ответа
  не используется как источник состояния сессии.
- Источник текущего пользователя - только `GET /auth/user`.
- `GET /auth/user` отвечает `401`, если активной сессии нет; это не ошибка, а
  штатный `Anonymous`.

## Известные пробелы Swagger

- Тело ответа `200 OK` не документировано для sign-in и logout.
- Тела ответов `401` и `500` не документированы ни для одного endpoint.
- Валидационные ошибки на уровне полей не документированы: в теле `400`
  приходит только `reason`.
- Атрибуты session cookie не документированы.
- Не документировано, могут ли `display_name` и `avatar` быть `null`.
- Не документировано, возвращает ли logout `401`, если сессия уже отсутствует.
