## 1. Истечение предела становится Ошибкой приложения

- [x] 1.1 Написать падающий тест в `src/app/shared/errors/map-http-error.spec.ts`:
      `HttpErrorResponse`, у которого в `error` лежит `DOMException` с
      `name === 'TimeoutError'`, превращается в `ApplicationError` с
      сообщением про истекшее время, а не с запасным сообщением вызывающей
      стороны
- [x] 1.2 Тест: отказ внешнего API с `reason` по-прежнему дает сообщение из
      ответа, а отказ без `reason` - запасное сообщение вызывающей стороны
      (существующее поведение не сломано)
- [x] 1.3 Реализовать распознавание в `src/app/shared/errors/map-http-error.ts`;
      тесты 1.1-1.2 зеленые
- [x] 1.4 Убедиться, что правок в `http-auth-gateway.ts` и в use case'ах для
      этого не требуется: путь `error: ({ message }) => markError(message)` у
      всех девяти use case'ов одинаков и уже покрыт их спеками, поэтому
      отдельного теста на таймаут в use case не заводим
- [x] 1.5 Прогнать `npm run lint` и `npm run test:ci`

## 2. Общий предел времени на запрос

- [x] 2.1 Написать падающий тест
      `src/app/core/http/http-timeout.interceptor.spec.ts` на
      `HttpTestingController`: запрос без собственного предела уходит с
      `timeout`, равным значению из токена, и ответ доезжает до вызывающей
      стороны
- [x] 2.2 Тест: запрос с уже проставленным `timeout` уходит со своим
      значением - интерцептор его не перебивает
- [x] 2.3 Создать `src/app/core/tokens/http-request-timeout.token.ts` с
      `HTTP_REQUEST_TIMEOUT_MS` (10 с) и экспортировать его из
      `src/app/core/tokens/index.ts`
- [x] 2.4 Создать `src/app/core/http/http-timeout.interceptor.ts`: если
      `request.timeout` не задан - `request.clone({ timeout })` со значением из
      токена; тесты 2.1-2.2 зеленые
- [x] 2.5 Подключить интерцептор в `src/app/app.config.ts` вторым в
      `withInterceptors` после `apiRequestInterceptor`; тест в
      `src/app/core/http/api-request.interceptor.spec.ts` на цепочку целиком:
      запрос уходит и с базовым адресом, и с пределом времени
- [x] 2.6 Прогнать `npm run lint` и `npm run test:ci`

## 3. Собственный предел для Смены аватара

- [ ] 3.1 Написать падающий тест
      `src/app/domains/identity-access/infrastructure/user.api.spec.ts`:
      запрос **Смены аватара** уходит с собственным пределом времени, а
      остальные запросы `UserApi` - без проставленного `timeout`
- [ ] 3.2 Проставить `timeout: 60_000` в `changeAvatar` в
      `src/app/domains/identity-access/infrastructure/user.api.ts`; тест 3.1
      зеленый
- [ ] 3.3 Прогнать `npm run lint` и `npm run test:ci`

## 4. Quality gates

- [ ] 4.1 Прогнать `npm run lint` и `npm run test:ci` целиком
- [ ] 4.2 Прогнать `npx openspec validate --changes --strict`
