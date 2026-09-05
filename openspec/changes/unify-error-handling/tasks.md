## 1. Оператор toApplicationError и шлюзы

- [ ] 1.1 Написать падающую спеку `src/app/shared/errors/to-application-error.spec.ts`: оператор пробрасывает **Ошибку приложения** с причиной из ответа, с запасным сообщением при отсутствии причины и с сообщением об истекшем пределе времени; успешное значение проходит насквозь. Проверка - спека падает, потому что оператора еще нет
- [ ] 1.2 Реализовать `toApplicationError(fallbackMessage)` в `src/app/shared/errors/to-application-error.ts` поверх существующего `mapHttpError` и экспортировать его из `src/app/shared/errors/index.ts`. Проверка - спека 1.1 зеленая
- [ ] 1.3 Перевести `src/app/domains/identity-access/infrastructure/http-auth-gateway.ts` на оператор, сохранив ветку `401` -> `CurrentSessionStatus.Anonymous` в `currentSession`. Проверка - `http-auth-gateway.spec.ts` зеленая без правок
- [ ] 1.4 Перевести `src/app/domains/identity-access/infrastructure/http-user-gateway.ts` на оператор. Проверка - `http-user-gateway.spec.ts` зеленая без правок
- [ ] 1.5 Перевести `src/app/domains/chats/infrastructure/http-chat-gateway.ts` на оператор. Проверка - `http-chat-gateway.spec.ts` зеленая без правок
- [ ] 1.6 Убедиться, что `catchError` + `throwError` + `mapHttpError` в шлюзах не осталось. Проверка - `grep -rn "mapHttpError" src/app/domains` ничего не находит
- [ ] 1.7 Quality gates блока: `npm run lint`, `npm run test:ci`

## 2. Флоу отправки в @shared/flow

- [ ] 2.1 Перенести `create-auth-flow-state.ts`, `create-auth-flow-state.spec.ts` и `auth-flow-status.ts` из `src/app/domains/identity-access/application/` в `src/app/shared/flow/` под именами `create-submit-flow-state.ts`, `create-submit-flow-state.spec.ts`, `submit-flow-status.ts`; завести `src/app/shared/flow/index.ts`. Утверждения перенесенной спеки не меняются, меняются только имена. Проверка - спека зеленая на новом месте
- [ ] 2.2 Перевести на `createSubmitFlowState` из `@shared/flow` пять сервисов `identity-access`: `sign-in`, `sign-up`, `change-password`, `change-avatar`, `update-profile`, вместе с их спеками. Проверка - спеки этих сервисов зеленые
- [ ] 2.3 Перевести `src/app/domains/chats/application/create-chat/create-chat.service.ts` на `createSubmitFlowState`, удалить `create-chat-status.ts`, поправить имена статусов в `create-chat.service.spec.ts`. Проверка - спека зеленая, утверждения о состояниях и сообщениях не изменились
- [ ] 2.4 То же для `src/app/domains/chats/application/add-chat-user/add-chat-user.service.ts` и `add-chat-user-status.ts`. Проверка - `add-chat-user.service.spec.ts` зеленая
- [ ] 2.5 Поправить имя перечисления в компонентах и их спеках: `sign-in-form`, `sign-up-form`, `change-password-form`, `change-avatar-form`, `update-profile-form`, `create-chat-form`, `add-chat-user-panel` и спеки модалок `change-password-modal-content`, `update-profile-modal-content`, `create-chat-modal-content`. Разметка и утверждения не меняются. Проверка - component specs зеленые
- [ ] 2.6 Убедиться, что `AuthFlowStatus`, `CreateChatStatus` и `AddChatUserStatus` в проекте не осталось. Проверка - `grep -rn "AuthFlowStatus\|CreateChatStatus\|AddChatUserStatus" src` ничего не находит
- [ ] 2.7 Quality gates блока: `npm run lint`, `npm run test:ci`

## 3. Флоу загрузки в @shared/flow

- [ ] 3.1 Написать падающую спеку `src/app/shared/flow/create-load-flow-state.spec.ts`: начальные данные и статус `Idle`, `startLoading` очищает сообщение об ошибке, `markLoaded` кладет данные и статус `Loaded`, `markError` меняет статус и сообщение и **не** трогает данные. Проверка - спека падает, потому что фабрики еще нет
- [ ] 3.2 Реализовать `LoadFlowStatus` и `createLoadFlowState<T>(initialData)` в `src/app/shared/flow/` и экспортировать из `index.ts`. Проверка - спека 3.1 зеленая
- [ ] 3.3 Перевести `src/app/domains/chats/application/chat-list/chat-list.service.ts` на `createLoadFlowState<Chat[]>([])`, оставив `isEmpty` в сервисе; удалить `chat-list-status.ts`, поправить имена статусов в `chat-list.service.spec.ts`. Проверка - спека зеленая, включая сценарий «список остается на экране после неудачной перезагрузки»
- [ ] 3.4 То же для `src/app/domains/chats/application/chat-users/chat-users.service.ts` и `chat-users-status.ts`. Проверка - `chat-users.service.spec.ts` зеленая
- [ ] 3.5 Поправить имя перечисления в `chat-list` и `selected-chat-header` и их спеках, если они сравнивают статус. Проверка - component specs зеленые
- [ ] 3.6 Убедиться, что `ChatListStatus` и `ChatUsersStatus` в проекте не осталось. Проверка - `grep -rn "ChatListStatus\|ChatUsersStatus" src` ничего не находит
- [ ] 3.7 Quality gates блока: `npm run lint`, `npm run test:ci`, `npm run e2e` - сквозные сценарии списка **Чатов** и **Добавления участника** затронуты
