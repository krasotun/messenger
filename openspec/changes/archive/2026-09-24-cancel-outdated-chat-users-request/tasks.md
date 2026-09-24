## 1. Отмена устаревшего запроса состава

- [x] 1.1 Написать падающие спеки в `src/app/domains/chats/application/chat-users/chat-users.service.spec.ts` с ответами шлюза через управляемые `Subject`: состав прежнего **Чата**, пришедший позже, не подменяет `chatUsers` последнего запроса и не меняет `status`; ошибка прежнего **Чата** после нового вызова не выставляет `errorMessage` и `Error`; после ошибки следующий `loadChatUsers` снова запрашивает шлюз и выставляет состав; повторный вызов по тому же `chatId` доходит до шлюза и применяет новый ответ
- [x] 1.2 Перевести `src/app/domains/chats/application/chat-users/chat-users.service.ts` на приватный `Subject` запрошенных `chatId` со `switchMap` в шлюз, `catchError` внутри и `takeUntilDestroyed()`; `loadChatUsers` синхронно выставляет `Loading` и сбрасывает `errorMessage`; проверить, что спеки 1.1 и прежние ожидания файла зеленые без правок
- [x] 1.3 Проверить, что `src/app/domains/chats/application/add-chat-user/add-chat-user.service.spec.ts` и `src/app/domains/chats/presentation/selected-chat-header/selected-chat-header.spec.ts` зеленые без правок
- [x] 1.4 Прогнать `npm run lint` и `npm run test:ci`
