## 1. Результат закрытия модального окна

- [x] 1.1 Написать падающие спеки в `src/app/shared/ui/modal/modal-service.spec.ts`: `open()` возвращает ссылку на окно, при уже открытом окне - `null`, закрытие приходит по этой ссылке ровно один раз
- [x] 1.2 Написать падающие спеки на `ModalRef` (`src/app/shared/ui/modal/modal-ref.ts`): `close(result)` доносит результат, закрытие по `Escape`, фону и кнопке приходит без результата
- [x] 1.3 Реализовать результат закрытия в `modal-ref.ts` и возврат ссылки из `modal-service.ts`, проверив, что спеки блока зеленые
- [x] 1.4 Прогнать `npm run lint` и `npm run test:ci` и убедиться, что существующие потребители модалки (`create-chat`, `update-profile`, `change-password`, `change-avatar`) не сломались

## 2. Подтверждение в shared/ui

- [x] 2.1 Написать падающие спеки `src/app/shared/ui/confirmation/confirmation-dialog/confirmation-dialog.spec.ts`: показаны заголовок, текст и подпись кнопки подтверждения из входных данных; опасное действие красит кнопку подтверждения цветом опасности
- [x] 2.2 Написать падающие спеки `src/app/shared/ui/confirmation/confirmation.service.spec.ts`: согласие дает `true`, отмена - `false`, закрытие окна без выбора - `false`, поток выдает ровно одно значение и завершается
- [x] 2.3 Реализовать `confirmation-data.type.ts`, `confirmation-dialog` и `confirmation.service.ts` поверх `ModalService`, проверив, что спеки блока зеленые
- [x] 2.4 Экспортировать подтверждение из `src/app/shared/ui` и прогнать `npm run lint` и `npm run test:ci`

## 3. Создатель чата в модели Чата

- [x] 3.1 Написать падающую спеку `src/app/domains/chats/infrastructure/chat.mapper.spec.ts` (или дополнить существующую): `created_by` из `ChatDto` попадает в модель `Chat`
- [x] 3.2 Добавить `created_by` в `chat-dto.type.ts`, автора в `chat.type.ts` и чтение в `chat.mapper.ts`, проверив, что спека зеленая
- [x] 3.3 Проверить живым запросом к `GET /chats` учебного API, что `created_by` действительно приходит; если нет - остановиться и вернуться к развилке источника права из `design.md`, не меняя спеку **Удаления чата**
- [x] 3.4 Отдать `created_by` в `mock-backend/src/routes/chats.ts` и `mock-backend/src/store.ts`, чтобы e2e видел то же, что и реальное API
- [x] 3.5 Прогнать `npm run lint` и `npm run test:ci`

## 4. Use case удаления чата

- [x] 4.1 Написать падающие спеки `src/app/domains/chats/infrastructure/http-chat-gateway.spec.ts` и `chat.api.spec.ts`: `deleteChat` шлет `DELETE /chats` с телом `{ chatId }`, отказ превращается в **Ошибку приложения**
- [x] 4.2 Написать падающие спеки `src/app/domains/chats/application/delete-chat/delete-chat.service.spec.ts`: на успехе список перезапрашивается, приходит событие успеха и показывается **Уведомление** об успехе; на отказе список не трогается и показывается **Уведомление** с текстом **Ошибки приложения**
- [x] 4.3 Реализовать `delete-chat-input.type.ts`, метод `deleteChat` в `chat.gateway.ts`, `chat.api.ts`, `http-chat-gateway.ts` и `delete-chat.service.ts`, проверив, что спеки блока зеленые
- [x] 4.4 Добавить `DELETE /chats` в `mock-backend/src/routes/chats.ts` и прогнать `npm run lint` и `npm run test:ci`

## 5. Удаление в шапке выбранного чата

- [x] 5.1 Написать падающие спеки `src/app/domains/chats/presentation/selected-chat-header/selected-chat-header.spec.ts`: действие удаления видно **Создателю чата**, отсутствует у остальных и пока список **Чатов** не загружен, у значка есть доступное имя
- [x] 5.2 Написать падающие спеки на поведение действия: подтверждение запрашивается с названием **Чата**, отказ не вызывает шлюз, согласие вызывает удаление, успех уводит навигацию на `/`
- [x] 5.3 Реализовать кнопку-значок и обработку в `selected-chat-header.ts`, `selected-chat-header.html`, `selected-chat-header.scss` с текстами из макета (`Delete chat`, `Delete "<title>"? The chat and its messages disappear for every member. This can't be undone.`, `Delete` / `Cancel`), проверив, что спеки блока зеленые
- [x] 5.4 Прогнать `npm run lint` и `npm run test:ci`

## 6. Сквозной сценарий и макет

- [ ] 6.1 Написать e2e `e2e/chats/delete-chat.spec.ts`: **Создатель чата** удаляет **Чат**, он исчезает из списка, адрес уходит на `/`, показывается **Уведомление** об успехе
- [ ] 6.2 Добавить скриншотный e2e с тегом `@visual` на окно подтверждения в `e2e/chats/chats.screenshot.spec.ts` и снять снимок
- [ ] 6.3 Сверить снятый снимок окна подтверждения с артбордом `DeleteChat` в канвасе экрана чатов: тексты, порядок кнопок и цвет кнопки подтверждения совпадают с макетом
- [ ] 6.4 Прогнать `npm run lint`, `npm run test:ci`, `npm run e2e` и `npm run e2e:visual`
