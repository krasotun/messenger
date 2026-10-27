# Identity Access API Contract

Форма запросов и ответов описана типами в `sign-in/sign-in.dto.ts`,
`sign-up/sign-up.dto.ts`, `current-session/current-user.dto.ts` и проверяется
тестами мапперов. Здесь - только то, что нельзя выразить типом: адреса,
работа с сессией и пробелы в Swagger.

## Endpoints

| Use case        | Method | Path           |
| --------------- | ------ | -------------- |
| Sign Up         | POST   | `/auth/signup` |
| Sign In         | POST   | `/auth/signin` |
| Current Session | GET    | `/auth/user`   |
| Logout          | POST   | `/auth/logout` |

Пути относительные: базовый URL подставляет `apiRequestInterceptor`. Он же
ставит всем запросам `withCredentials: true`, поэтому отдельного столбца
`Credentials` в таблице больше нет - политика общая для всего API. Sign Up
раньше был исключением; оба бэкенда (учебный API и мок) отвечают
`Access-Control-Allow-Credentials: true` на всех маршрутах, так что
исключение ничего не защищало.

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
