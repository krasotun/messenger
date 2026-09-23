## 1. Use case исключения участника

- [ ] 1.1 Сверить `DELETE /chats/users` с `docs/api/swagger.json`, а передачу тела у `HttpClient.delete` - через Context7; записать расхождения с `design.md`, если есть
- [ ] 1.2 Написать падающие спеки в `src/app/domains/chats/infrastructure/chat.api.spec.ts` и `http-chat-gateway.spec.ts`: `removeChatUser` шлет `DELETE /chats/users` с телом `{ users: [userId], chatId }` и принимает ответ без JSON; отказ превращается в **Ошибку приложения**
- [ ] 1.3 Написать падающие спеки `src/app/domains/chats/application/remove-chat-user/remove-chat-user.service.spec.ts`: на успехе состав перезапрашивается, приходит `succeeded$` и **Уведомление** `Remove member` / `Member removed`; на отказе состав не трогается и показывается **Уведомление** `Failed to remove member` с текстом **Ошибки приложения**
- [ ] 1.4 Реализовать `remove-chat-user-input.type.ts`, `removeChatUser` в `chat.gateway.ts`, `chat.api.ts`, `http-chat-gateway.ts`, ключ `removeChatUser` в `error-messages.constants.ts` и `remove-chat-user.service.ts`, проверив, что спеки 1.2 и 1.3 зеленые
- [ ] 1.5 Добавить `DELETE /chats/users` в `mock-backend/src/routes/chats.ts`: неизвестный **Чат** - `400` с `reason`, иначе убрать пользователей из состава и ответить `200`
- [ ] 1.6 Проверить живым запросом к учебному API, что `DELETE /chats/users` от **Создателя чата** отвечает `200` и **Участник чата** пропадает из `GET /chats/{id}/users`; ответ отличается от ожидаемого - остановиться и вернуться к `design.md`
- [ ] 1.7 Прогнать `npm run lint` и `npm run test:ci`

## 2. Маршрутный компонент выбранного чата

- [ ] 2.1 Написать падающие спеки `src/app/domains/chats/presentation/selected-chat/selected-chat.spec.ts`: состав грузится по `chatId` и перезагружается при его смене; шапка получает **Чат** и `isChatCreator`, который истинен только у **Создателя чата** и ложен, пока список **Чатов** не загружен
- [ ] 2.2 Переписать спеки `src/app/domains/chats/presentation/selected-chat-header/selected-chat-header.spec.ts` под входы **Чата** и `isChatCreator`: прежние сценарии **Удаления чата** и ошибки загрузки сохраняются
- [ ] 2.3 Реализовать `selected-chat.ts`, `selected-chat.html`, `selected-chat.scss`: шапка сверху, под ней строка с местом под переписку; перенести из `selected-chat-header.ts` `effect` загрузки состава, поиск **Чата** и признак права под именем `isChatCreator`, шапке оставить **Удаление чата** с `DeleteChatService`
- [ ] 2.4 Перевести маршрут `:chatId` в `src/app/app.routes.ts` на `SelectedChat` и поправить `src/app/pages/chats-page/chats-page.spec.ts`, проверив, что спеки 2.1, 2.2 и сценарии **Выбранного чата** зеленые
- [ ] 2.5 Прогнать `npm run lint` и `npm run test:ci`

## 3. Состав чата в боковой панели

- [ ] 3.1 Написать падающие спеки `src/app/domains/chats/presentation/chat-users-panel/chat-users-panel.spec.ts`: показаны **Аватар** и имя каждого **Участника чата** и заголовок `Members · N`; строка **Текущего пользователя** помечена `(you)`; без права исключать кнопок исключения нет; кнопка `Close members` отдает `closed`; метод фокуса ставит фокус на заголовок
- [ ] 3.2 Реализовать `chat-users-panel.ts`, `chat-users-panel.html`, `chat-users-panel.scss` по артборду панели состава: заголовок с кнопкой закрытия вне прокрутки, список строк с `overflow-y: auto` на всю высоту панели; проверить, что спеки 3.1 зеленые
- [ ] 3.3 Дописать падающие спеки `selected-chat-header.spec.ts`: у кнопки стека доступное имя `Members: N` и `aria-expanded` по входу; нажатие отдает `membersToggled`; метод фокуса ставит фокус на кнопку стека; `Add member` по-прежнему открывает и закрывает свою панель
- [ ] 3.4 Обернуть `<app-chat-user-stack>` в кнопку в `selected-chat-header.html`, добавить вход признака открытого состава, `membersToggled` и метод фокуса в `selected-chat-header.ts`, стили кнопки - в `selected-chat-header.scss`; убрать `cursor: default` у `+K` в `src/app/domains/chats/presentation/chat-user-stack/chat-user-stack.scss`; проверить, что спеки 3.3 зеленые
- [ ] 3.5 Дописать падающие спеки `selected-chat.spec.ts`: нажатие на стек открывает панель и ставит фокус на ее заголовок, повторное закрывает; `✕` закрывает и возвращает фокус на стек; щелчок мимо панели и `Escape` ее не закрывают; при смене `chatId` панель остается открытой и показывает новый состав; при ошибке состава панели нет
- [ ] 3.6 Добавить в `selected-chat.ts` и `selected-chat.html` сигнал `membersOpen`, панель справа в строке под шапкой и связь с `membersToggled`, `closed` и методами фокуса, проверив, что спеки 3.5 зеленые
- [ ] 3.7 Прогнать `npm run lint` и `npm run test:ci`

## 4. Исключение участника в панели

- [ ] 4.1 Дописать падающие спеки `chat-users-panel.spec.ts`: при праве исключать кнопка `✕` видна у всех строк, кроме своей; у нее доступное имя `Remove <name>`; нажатие отдает `removeRequested` с этим **Участником чата**
- [ ] 4.2 Реализовать кнопки исключения в `chat-users-panel`, проверив, что спеки 4.1 зеленые
- [ ] 4.3 Дописать падающие спеки `selected-chat.spec.ts`: панель получает право исключать только у **Создателя чата**; подтверждение запрашивается с `Remove member`, именем **Участника чата**, названием **Чата** в тексте и без признака опасности; отказ не вызывает use case и оставляет панель открытой; согласие вызывает `RemoveChatUserService` с `chatId` и `userId`; после успеха панель открыта и фокус на ее заголовке
- [ ] 4.4 Предоставить `RemoveChatUserService` в `selected-chat.ts` и связать `removeRequested` с подтверждением, use case и фокусом по `succeeded$`, проверив, что спеки 4.3 зеленые
- [ ] 4.5 Прогнать `npm run lint` и `npm run test:ci`

## 5. Сквозной сценарий и макет

- [ ] 5.1 Написать e2e `e2e/chats/remove-chat-user.spec.ts`: **Создатель чата** открывает состав, исключает **Участника чата**, подтверждает, видит **Уведомление** `Member removed`, а строки исключенного нет в открытой панели
- [ ] 5.2 Добавить скриншотный e2e `chat users panel @visual` в `e2e/chats/chats.screenshot.spec.ts` на открытую панель у **Создателя чата**, где **Участников чата** больше, чем помещается без прокрутки, и снять linux-эталон в контейнере `mcr.microsoft.com/playwright` с `--platform linux/arm64`
- [ ] 5.3 Сверить снимок с артбордом панели состава: порядок строк, пометка `(you)`, кнопки исключения и закрытия, заголовок с числом и прокрутка списка под ним совпадают с макетом
- [ ] 5.4 Прогнать `npm run lint`, `npm run test:ci`, `npm run e2e` и `npm run e2e:visual`
