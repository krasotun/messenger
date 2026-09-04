# Задачи: чаты - список, создание и добавление участника

Секция - единица ревью: один коммит в ветку issue #83.

Порядок секций - по домену: создание чата, затем поиск пользователя, затем
добавление участника. Мок-бэкенд идет предпоследней секцией, перед сквозными
сценариями: до них он никому не нужен - unit- и component-тесты работают на
подмененном HTTP.

## 1. Переезд resolveAvatarUrl в shared

- [x] Перенести `resolve-avatar-url.ts` и его спеку из
      `src/app/domains/identity-access/infrastructure/current-session/` в
      `src/app/shared/resources/`, добавить `src/app/shared/resources/index.ts`.
- [x] Обновить импорт в
      `src/app/domains/identity-access/infrastructure/current-session/current-user.mapper.ts`.
- [x] Убедиться, что тесты проходят без правок: поведение не меняется.
- [x] `npm run lint`, `npm run test:ci`.

## 2. Список чатов на маршруте /

- [x] Написать падающий тест
      `src/app/domains/chats/infrastructure/http-chat-gateway.spec.ts` на
      `GET /chats` и маппинг `ChatsResponse` в модель `Chat`.
- [x] Завести домен: `application/chat.ts`, `application/chat.gateway.ts`
      (`CHAT_GATEWAY`), `infrastructure/http-chat-gateway.ts`,
      `infrastructure/chat.mapper.ts`, `chats.providers.ts`, `index.ts`.
      Подключить `provideChats()` в `src/app/app.config.ts`.
- [x] Написать падающий тест
      `application/chat-list/chat-list.service.spec.ts` на сценарии «есть
      чаты», «чатов еще нет», «список не загрузился», «повторная загрузка
      после ошибки».
- [x] Реализовать `ChatListService`.
- [x] Написать падающие тесты `presentation/chat-list/chat-list.spec.ts` и
      `presentation/chat-list-item/chat-list-item.spec.ts`, включая сценарий
      «у чата нет последнего сообщения».
- [x] Реализовать `ChatList` и `ChatListItem`.
- [x] Создать `src/app/pages/chats-page/`, заменить в `src/app/app.routes.ts`
      маршрут `''` на него, удалить `src/app/pages/home-page/` вместе со спекой.
- [x] `npm run lint`, `npm run test:ci`.

## 3. Создание чата

- [x] Дописать падающий тест в `infrastructure/http-chat-gateway.spec.ts` на
      `POST /chats`.
- [x] Расширить `chat.gateway.ts` методом `createChat`, добавить
      `application/create-chat/create-chat.input.ts` и `.result.ts`.
- [x] Написать падающий тест `application/create-chat/create-chat.service.spec.ts`
      на сценарии «чат создан» (со перезапросом списка) и «создание отклонено».
- [x] Реализовать `CreateChatService` и метод шлюза.
- [x] Написать падающий тест
      `presentation/create-chat-form/create-chat-form.spec.ts`, включая
      сценарий «название не указано».
- [x] Реализовать `CreateChatForm` и `CreateChatModalContent`, открыть модалку
      из `ChatList`.
- [x] `npm run lint`, `npm run test:ci`.

## 4. Выбранный чат и его участники

- [x] Дописать падающий тест в `infrastructure/http-chat-gateway.spec.ts` на
      `GET /chats/{id}/users` и маппинг в модель `ChatUser`.
- [x] Добавить `application/chat-user.ts`, расширить `chat.gateway.ts` методом
      `chatUsers`.
- [x] Написать падающий тест `application/chat-users/chat-users.service.spec.ts`.
- [x] Реализовать `ChatUsersService`.
- [x] Написать падающий тест
      `presentation/chat-user-stack/chat-user-stack.spec.ts` на сценарии
      «участники помещаются», «участников больше, чем помещается» и на то, что
      число остальных не реагирует на нажатие.
- [x] Реализовать `ChatUserStack` и `SelectedChatHeader`.
- [x] Добавить дочерний маршрут `:chatId` в `src/app/app.routes.ts`, написать
      падающий тест на сценарии «чат выбран», «возврат по адресу», «чат не
      выбран», «выбранного чата не существует».
- [x] `npm run lint`, `npm run test:ci`.

## 5. Поиск пользователей в identity-access

- [x] Написать падающий тест
      `src/app/domains/identity-access/infrastructure/http-user-gateway.spec.ts`
      на `POST /user/search` и маппинг ответа в модель `User`.
- [x] Добавить `src/app/domains/identity-access/application/user.ts` (модель
      `User`), `search-users/search-users.input.ts` и `.result.ts`, расширить
      `application/user.gateway.ts` методом `searchUsers`.
- [x] Написать падающий тест
      `application/search-users/search-users.service.spec.ts` на сценарии
      «совпадения найдены», «совпадений нет», «поиск не удался».
- [x] Реализовать `SearchUsersService`, реализовать `searchUsers` в
      `infrastructure/http-user-gateway.ts` и `infrastructure/user.api.ts`.
- [x] Экспортировать `SearchUsersService` и `User` из
      `src/app/domains/identity-access/index.ts`.
- [x] `npm run lint`, `npm run test:ci`.

## 6. Добавление участника

- [x] Дописать падающий тест в `infrastructure/http-chat-gateway.spec.ts` на
      `PUT /chats/users`.
- [x] Расширить `chat.gateway.ts` методом `addChatUser`, добавить
      `application/add-chat-user/add-chat-user.input.ts` и `.result.ts`.
- [x] Написать падающий тест
      `application/add-chat-user/add-chat-user.service.spec.ts` на сценарии
      «участник добавлен» (с обновлением состава) и «добавление отклонено».
- [x] Реализовать `AddChatUserService`.
- [x] Написать падающий тест
      `application/user-search/user-search.state.spec.ts` на сценарии «поиск не
      начат», «пользователи найдены», «никого не нашли» и «ввод продолжился до
      ответа» - последний с fake timers и проверкой отмены предыдущего запроса.
- [x] Реализовать состояние поиска поверх `SearchUsersService`.
- [x] Написать падающий тест
      `presentation/add-chat-user-panel/add-chat-user-panel.spec.ts` на пять
      состояний панели из `design.md`.
- [x] Реализовать `AddChatUserPanel`, открыть его из `SelectedChatHeader` через
      примитив popover.
- [x] `npm run lint`, `npm run test:ci`.

## 7. Мок-бэкенд под чаты

- [x] Разделить `mock-backend/src/server.ts` по ресурсам: вынести
      обработчики в `mock-backend/src/routes/auth.ts` и
      `mock-backend/src/routes/user.ts`, оставить в `server.ts` только
      сборку приложения. Поведение не меняется, тестов не добавляем.
- [x] Добавить `mock-backend/src/routes/chats.ts`: `GET /chats`,
      `POST /chats`, `PUT /chats/users`, `GET /chats/{id}/users`. Состав полей
      сверить по `docs/api/swagger.json`.
- [x] Добавить `POST /user/search` в `mock-backend/src/routes/user.ts`:
      поиск по началу логина, не больше 10 результатов.
- [x] Очищать чаты и их состав в `POST /test/reset`.
- [x] `npm run lint`, `npm run test:ci`.

## 8. Сквозные сценарии и quality gates

- [ ] Написать `e2e/chats/create-chat.spec.ts`: вход, пустой список, создание
      чата, чат виден в списке.
- [ ] Написать `e2e/chats/add-chat-user.spec.ts`: чат создается фикстурой
      прямым запросом к мок-бэкенду, затем поиск по логину, добавление и
      появление участника в шапке.
- [ ] Написать `e2e/chats/chats.screenshot.spec.ts` с тегом `@visual`: экран
      чатов по умолчанию.
- [ ] `npm run lint`, `npm run test:ci`, `npm run e2e`, `npm run e2e:visual`.
