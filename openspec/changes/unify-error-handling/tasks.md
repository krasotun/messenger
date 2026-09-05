## 1. Оператор toApplicationError и шлюзы

- [x] 1.1 Написать падающую спеку `src/app/shared/errors/to-application-error.spec.ts`: оператор пробрасывает **Ошибку приложения** с причиной из ответа, с запасным сообщением при отсутствии причины и с сообщением об истекшем пределе времени; успешное значение проходит насквозь. Проверка - спека падает, потому что оператора еще нет
- [x] 1.2 Реализовать `toApplicationError(fallbackMessage)` в `src/app/shared/errors/to-application-error.ts` поверх существующего `mapHttpError` и экспортировать его из `src/app/shared/errors/index.ts`. Проверка - спека 1.1 зеленая
- [x] 1.3 Перевести `src/app/domains/identity-access/infrastructure/http-auth-gateway.ts` на оператор, сохранив ветку `401` -> `CurrentSessionStatus.Anonymous` в `currentSession`. Проверка - `http-auth-gateway.spec.ts` зеленая без правок
- [x] 1.4 Перевести `src/app/domains/identity-access/infrastructure/http-user-gateway.ts` на оператор. Проверка - `http-user-gateway.spec.ts` зеленая без правок
- [x] 1.5 Перевести `src/app/domains/chats/infrastructure/http-chat-gateway.ts` на оператор. Проверка - `http-chat-gateway.spec.ts` зеленая без правок
- [x] 1.6 Убедиться, что прямых вызовов `mapHttpError` в шлюзах не осталось. Проверка - `grep -rn "mapHttpError" src/app/domains` ничего не находит
- [x] 1.7 Quality gates: `npm run lint`, `npm run test:ci`. `npm run e2e` не нужен - сквозное поведение не меняется
