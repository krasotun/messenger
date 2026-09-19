## 1. Модалка не закрывает popover под собой

- [ ] 1.1 Написать падающие спеки в `src/app/shared/ui/modal/modal-service.spec.ts` на тестовом host с `Popover` и кнопкой, открывающей модалку: щелчок внутри модального окна оставляет popover открытым; `Escape` закрывает модалку, а popover остается; щелчок по фону закрывает и модалку, и popover
- [ ] 1.2 Подписать `ModalService` на `overlayRef.outsidePointerEvents()` в `src/app/shared/ui/modal/modal-service.ts` без действия, с комментарием о диспетчере CDK, и проверить, что спеки 1.1 зеленые
- [ ] 1.3 Прогнать `npm run lint` и `npm run test:ci` и убедиться, что спеки `Popover`, `ConfirmationService` и существующих модалок не сломались

## 2. Use case исключения участника

- [ ] 2.1 Сверить `DELETE /chats/users` с `docs/api/swagger.json`, а передачу тела у `HttpClient.delete` - через Context7; записать расхождения с `design.md`, если есть
- [ ] 2.2 Написать падающие спеки в `src/app/domains/chats/infrastructure/chat.api.spec.ts` и `http-chat-gateway.spec.ts`: `removeChatUser` шлет `DELETE /chats/users` с телом `{ users: [userId], chatId }` и принимает ответ без JSON; отказ превращается в **Ошибку приложения**
- [ ] 2.3 Написать падающие спеки `src/app/domains/chats/application/remove-chat-user/remove-chat-user.service.spec.ts`: на успехе состав перезапрашивается, приходит `succeeded$` и **Уведомление** `Remove member` / `Member removed`; на отказе состав не трогается и показывается **Уведомление** `Failed to remove member` с текстом **Ошибки приложения**
- [ ] 2.4 Реализовать `remove-chat-user-input.type.ts`, `removeChatUser` в `chat.gateway.ts`, `chat.api.ts`, `http-chat-gateway.ts`, ключ `removeChatUser` в `error-messages.constants.ts` и `remove-chat-user.service.ts`, проверив, что спеки 2.2 и 2.3 зеленые
- [ ] 2.5 Добавить `DELETE /chats/users` в `mock-backend/src/routes/chats.ts`: неизвестный **Чат** - `400` с `reason`, иначе убрать пользователей из состава и ответить `200`
- [ ] 2.6 Проверить живым запросом к учебному API, что `DELETE /chats/users` от **Создателя чата** отвечает `200` и **Участник чата** пропадает из `GET /chats/{id}/users`; ответ отличается от ожидаемого - остановиться и вернуться к `design.md`
- [ ] 2.7 Прогнать `npm run lint` и `npm run test:ci`

## 3. Состав чата по стеку аватаров

- [ ] 3.1 Написать падающие спеки `src/app/domains/chats/presentation/chat-users-panel/chat-users-panel.spec.ts`: показаны **Аватар** и имя каждого **Участника чата** и заголовок с их числом; строка **Текущего пользователя** помечена `(you)`; без права исключать кнопок нет
- [ ] 3.2 Реализовать `chat-users-panel.ts`, `chat-users-panel.html`, `chat-users-panel.scss` по артборду `ChatMembers`, проверив, что спеки 3.1 зеленые
- [ ] 3.3 Написать падающие спеки в `src/app/domains/chats/presentation/selected-chat-header/selected-chat-header.spec.ts`: нажатие на стек открывает состав, повторное закрывает; у кнопки стека доступное имя `Members: N`; `Add member` по-прежнему открывает и закрывает свою панель
- [ ] 3.4 Обернуть `<app-chat-user-stack>` в кнопку с `appPopover` в `selected-chat-header.html`, развести два `Popover` по ссылкам шаблона в `selected-chat-header.ts`, стили кнопки стека - в `selected-chat-header.scss`, проверив, что спеки 3.3 зеленые
- [ ] 3.5 Убрать `cursor: default` у `+K` в `src/app/domains/chats/presentation/chat-user-stack/chat-user-stack.scss` и прогнать `npm run lint` и `npm run test:ci`

## 4. Исключение участника в составе

- [ ] 4.1 Дописать падающие спеки `chat-users-panel.spec.ts`: при праве исключать кнопка есть у всех строк, кроме своей; у кнопки доступное имя `Remove <name>`; нажатие отдает `removeRequested` с этим **Участником чата**
- [ ] 4.2 Реализовать кнопки исключения в `chat-users-panel`, проверив, что спеки 4.1 зеленые
- [ ] 4.3 Дописать падающие спеки `selected-chat-header.spec.ts`: право исключать есть только у **Создателя чата** и отсутствует, пока список **Чатов** не загружен; подтверждение запрашивается с `Remove member`, именем **Участника чата**, названием **Чата** в тексте и без признака опасности; отказ не вызывает use case; согласие вызывает `RemoveChatUserService` с `chatId` и `userId`; состав остается открытым после успеха
- [ ] 4.4 Переименовать `canDeleteChat` в `isChatCreator`, предоставить `RemoveChatUserService` в `selected-chat-header.ts` и связать `removeRequested` с подтверждением и use case, проверив, что спеки 4.3 и прежние спеки **Удаления чата** зеленые
- [ ] 4.5 Прогнать `npm run lint` и `npm run test:ci`

## 5. Сквозной сценарий и макет

- [ ] 5.1 Написать e2e `e2e/chats/remove-chat-user.spec.ts`: **Создатель чата** открывает состав, исключает **Участника чата**, подтверждает, видит **Уведомление** `Member removed`, а строки исключенного нет в открытом составе
- [ ] 5.2 Добавить скриншотный e2e `chat users panel @visual` в `e2e/chats/chats.screenshot.spec.ts` на открытый состав у **Создателя чата** и снять linux-эталон в контейнере `mcr.microsoft.com/playwright` с `--platform linux/arm64`
- [ ] 5.3 Сверить снимок с артбордом `ChatMembers`: порядок строк, пометка `(you)`, кнопки исключения и заголовок с числом совпадают с макетом
- [ ] 5.4 Прогнать `npm run lint`, `npm run test:ci`, `npm run e2e` и `npm run e2e:visual`
