## Why

Issue: #103

`mapHttpError` свел к одной функции только разбор ответа внешнего API. Обертка
вокруг него осталась копией: в трех шлюзах лежит 12 одинаковых блоков
`catchError` -> `throwError` -> `mapHttpError(error, fallback)`. Новый вызов
шлюза заводится копипастой этого блока, а расхождение в одной из копий никто не
замечает.

## What Changes

- В `@shared/errors` появляется RxJS-оператор `toApplicationError(fallback)`:
  перехватывает ошибку потока и пробрасывает дальше **Ошибку приложения**,
  собранную существующим `mapHttpError`.
- 12 блоков в `http-auth-gateway`, `http-user-gateway` и `http-chat-gateway`
  заменяются на этот оператор в конце `pipe`.
- `mapHttpError` не меняется: он остается разбором ответа, оператор - оберткой
  над ним.
- Поведение не меняется: те же тексты, та же **Ошибка приложения** у вызывающей
  стороны, та же ветка `401` -> `Anonymous` в `currentSession`.

## Capabilities

### New Capabilities

Новых нет.

### Modified Capabilities

Требования не меняются: что видит вызывающая сторона при отказе внешнего API,
уже описано в `core-http`, `identity-access` и `chats`, и change этого не
трогает. Change объявляет `skip_specs: true`.

## Impact

- Слои: `shared` (`@shared/errors`) и `infrastructure` (три шлюза).
  `application`, `presentation` и `core` не затрагиваются.
- Спеки шлюзов остаются без правок - это и есть проверка того, что поведение
  сохранилось.
