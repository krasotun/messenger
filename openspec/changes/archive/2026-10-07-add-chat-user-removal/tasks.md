## 1. Use case исключения участника

- [x] 1.1 Сверить `DELETE /chats/users` с `docs/api/swagger.json`, а передачу тела у `HttpClient.delete` - через Context7; записать расхождения с `design.md`, если есть
- [x] 1.2 Написать падающие спеки в `src/app/domains/chats/infrastructure/chat.api.spec.ts` и `http-chat-gateway.spec.ts`: `removeChatUser` шлет `DELETE /chats/users` с телом `{ users: [userId], chatId }` и принимает ответ без JSON; отказ превращается в **Ошибку приложения**
- [x] 1.3 Написать падающие спеки `src/app/domains/chats/application/remove-chat-user/remove-chat-user.service.spec.ts`: на успехе состав перезапрашивается, приходит `succeeded$` и **Уведомление** `Remove member` / `Member removed`; на отказе состав не трогается и показывается **Уведомление** `Failed to remove member` с текстом **Ошибки приложения**; спеки `src/app/shared/submit-flow/create-action-flow-state.spec.ts`: `succeeded$` приходит на `markSuccess`; из спеков `RemoveChatUserService` и `DeleteChatService` уходят проверки `isSubmitting`
- [x] 1.4 Реализовать `remove-chat-user-input.type.ts`, `removeChatUser` в `chat.gateway.ts`, `chat.api.ts`, `http-chat-gateway.ts`, ключ `removeChatUser` в `error-messages.constants.ts`, `create-action-flow-state.ts` с экспортом из `src/app/shared/submit-flow/index.ts` и `createFormSubmitFlowState` на нем, `remove-chat-user.service.ts` и перевод `DeleteChatService` на `createActionFlowState`, проверив, что спеки 1.2 и 1.3 зеленые
- [x] 1.5 Добавить `DELETE /chats/users` в `mock-backend/src/routes/chats.ts`: неизвестный **Чат** - `400` с `reason`, иначе убрать пользователей из состава и ответить `200`
- [x] 1.6 Проверить живым запросом к учебному API, что `DELETE /chats/users` от **Создателя чата** отвечает `200` и **Участник чата** пропадает из `GET /chats/{id}/users`; ответ отличается от ожидаемого - остановиться и вернуться к `design.md`
- [x] 1.7 Прогнать `npm run lint` и `npm run test:ci`

## 2. Маршрутный компонент выбранного чата

- [x] 2.1 Написать падающие спеки `src/app/domains/chats/presentation/selected-chat/selected-chat.spec.ts`: состав грузится по `chatId` и перезагружается при его смене; при ошибке загрузки состава вместо шапки и места под переписку показывается **Ошибка приложения**; шапка получает **Чат**, `isChatCreator` и состав; `isChatCreator` истинен только у **Создателя чата**; пока **Чата** нет в списке, шапка не показывается; `deleteRequested` шапки запрашивает подтверждение **Удаления чата**, согласие вызывает `DeleteChatService`, отказ - нет, после успеха переход на `/`
- [x] 2.2 Переписать спеки `src/app/domains/chats/presentation/selected-chat-header/selected-chat-header.spec.ts` под входы **Чата**, `isChatCreator` и состава: кнопка **Удаления чата** видна по `isChatCreator` и отдает `deleteRequested`; сценарии подтверждения, удаления и ошибки загрузки переезжают в 2.1
- [x] 2.3 Реализовать `selected-chat.ts`, `selected-chat.html`, `selected-chat.scss`: шапка сверху (только при найденном **Чате**), под ней строка с местом под переписку, при ошибке состава вместо них **Ошибка приложения**; перенести из `selected-chat-header.ts` `effect` загрузки состава, чтение `ChatUsersService`, поиск **Чата** и признак права под именем `isChatCreator`, подтверждение **Удаления чата**, `DeleteChatService` и переход на `/`; шапке оставить кнопку и `deleteRequested`
- [x] 2.4 Перевести маршрут `:chatId` в `src/app/app.routes.ts` на `SelectedChat` и поправить `src/app/pages/chats-page/chats-page.spec.ts`, проверив, что спеки 2.1, 2.2 и сценарии **Выбранного чата** зеленые
- [x] 2.5 Прогнать `npm run lint` и `npm run test:ci`

## 3. Состав чата в боковой панели

- [x] 3.1 Написать падающие спеки `src/app/domains/chats/presentation/chat-user-row/chat-user-row.spec.ts`: показаны **Аватар** и имя **Участника чата**; при `isCurrentUser` строка помечена `(you)`
- [x] 3.2 Реализовать `chat-user-row.ts`, `chat-user-row.html`, `chat-user-row.scss` по артборду панели состава; проверить, что спеки 3.1 зеленые
- [x] 3.3 Написать падающие спеки `src/app/domains/chats/presentation/chat-users-panel/chat-users-panel.spec.ts`: строка на каждого **Участника чата** и заголовок `Members · N`; пометку `(you)` получает только строка **Текущего пользователя**; кнопка `Close members` отдает `closed`
- [x] 3.4 Реализовать `chat-users-panel.ts`, `chat-users-panel.html`, `chat-users-panel.scss` по артборду панели состава: строки в `@for`, заголовок с кнопкой закрытия вне прокрутки, список строк с `overflow-y: auto` на всю высоту панели; проверить, что спеки 3.3 зеленые
- [x] 3.5 Дописать падающие спеки `selected-chat-header.spec.ts`: нажатие на кнопку стека отдает `membersToggled`; нажатие на `Add member` открывает панель добавления с `chatId` этого **Чата**
- [x] 3.6 Обернуть `<app-chat-user-stack>` в кнопку в `selected-chat-header.html`, добавить `membersToggled` в `selected-chat-header.ts`, стили кнопки - в `selected-chat-header.scss`; убрать `cursor: default` у `+K` в `src/app/domains/chats/presentation/chat-user-stack/chat-user-stack.scss`; проверить, что спеки 3.5 зеленые
- [x] 3.7 Дописать падающие спеки `selected-chat.spec.ts`: нажатие на стек открывает панель, повторное закрывает; `✕` закрывает; при смене `chatId` панель остается открытой и показывает новый состав; при ошибке состава панели нет
- [x] 3.8 Добавить в `selected-chat.ts` и `selected-chat.html` сигнал `membersOpen`, панель справа в строке под шапкой и связь с `membersToggled` и `closed`, проверив, что спеки 3.7 зеленые
- [x] 3.9 Прогнать `npm run lint` и `npm run test:ci`

## 4. Исключение участника в панели

- [x] 4.1 Дописать падающие спеки `chat-user-row.spec.ts`: при `canRemove` видна кнопка `✕` с доступным именем `Remove <name>`, без `canRemove` кнопки нет; нажатие отдает `removeRequested`; и спеки `chat-users-panel.spec.ts`: при праве исключать `canRemove` получают все строки, кроме своей, без права - ни одна; `removeRequested` строки уходит из панели как `removeRequested` с этим **Участником чата**
- [x] 4.2 Реализовать кнопку исключения в `chat-user-row` и пересылку `removeRequested` в `chat-users-panel`, проверив, что спеки 4.1 зеленые
- [x] 4.3 Дописать падающие спеки `selected-chat.spec.ts`: панель получает право исключать только у **Создателя чата**; подтверждение запрашивается с `Remove member`, именем **Участника чата**, названием **Чата** в тексте и без признака опасности; отказ не вызывает use case и оставляет панель открытой; согласие вызывает `RemoveChatUserService` с `chatId` и `userId`; после успеха панель открыта
- [x] 4.4 Предоставить `RemoveChatUserService` в `selected-chat.ts` и связать `removeRequested` с подтверждением и use case, проверив, что спеки 4.3 зеленые
- [x] 4.5 Прогнать `npm run lint` и `npm run test:ci`

## 5. Сквозной сценарий и макет

- [x] 5.1 Написать e2e `e2e/chats/remove-chat-user.spec.ts`: **Создатель чата** открывает состав, исключает **Участника чата**, подтверждает, видит **Уведомление** `Member removed`, а строки исключенного нет в открытой панели
- [x] 5.2 Добавить скриншотный e2e `chat users panel @visual` в `e2e/chats/chats.screenshot.spec.ts` на открытую панель у **Создателя чата**, где **Участников чата** больше, чем помещается без прокрутки, и снять linux-эталон в контейнере `mcr.microsoft.com/playwright` с `--platform linux/arm64`
- [x] 5.3 Сверить снимок с артбордом панели состава: порядок строк, пометка `(you)`, кнопки исключения и закрытия, заголовок с числом и прокрутка списка под ним совпадают с макетом
- [x] 5.4 Прогнать `npm run lint`, `npm run test:ci`, `npm run e2e` и `npm run e2e:visual`
