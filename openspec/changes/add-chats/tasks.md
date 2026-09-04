# Задачи: чаты - список, создание и добавление участника

Секция - единица ревью: один коммит в ветку issue #83.

Порядок секций - по домену: создание чата, затем поиск пользователя, затем
добавление участника. Мок-бэкенд идет предпоследней секцией, перед сквозными
сценариями: до них он никому не нужен - unit- и component-тесты работают на
подмененном HTTP.

## 1. Переезд resolveAvatarUrl в shared

- [ ] Перенести `resolve-avatar-url.ts` и его спеку из
      `src/app/domains/identity-access/infrastructure/current-session/` в
      `src/app/shared/resources/`, добавить `src/app/shared/resources/index.ts`.
- [ ] Обновить импорт в
      `src/app/domains/identity-access/infrastructure/current-session/current-user.mapper.ts`.
- [ ] Убедиться, что тесты проходят без правок: поведение не меняется.
- [ ] `npm run lint`, `npm run test:ci`.

## 2. Список чатов на маршруте /

- [ ] Написать падающий тест
      `src/app/domains/chats/infrastructure/http-chat-gateway.spec.ts` на
      `GET /chats` и маппинг `ChatsResponse` в модель `Chat`.
- [ ] Завести домен: `application/chat.ts`, `application/chat.gateway.ts`
      (`CHAT_GATEWAY`), `infrastructure/http-chat-gateway.ts`,
      `infrastructure/chat.mapper.ts`, `chats.providers.ts`, `index.ts`.
      Подключить `provideChats()` в `src/app/app.config.ts`.
- [ ] Написать падающий тест
      `application/chat-list/chat-list.service.spec.ts` на сценарии «есть
      чаты», «чатов еще нет», «список не загрузился», «повторная загрузка
      после ошибки».
- [ ] Реализовать `ChatListService`.
- [ ] Написать падающие тесты `presentation/chat-list/chat-list.spec.ts` и
      `presentation/chat-list-item/chat-list-item.spec.ts`, включая сценарий
      «у чата нет последнего сообщения».
- [ ] Реализовать `ChatList` и `ChatListItem`.
- [ ] Создать `src/app/pages/chats-page/`, заменить в `src/app/app.routes.ts`
      маршрут `''` на него, удалить `src/app/pages/home-page/` вместе со спекой.
- [ ] `npm run lint`, `npm run test:ci`.

## 3. Создание чата

- [ ] Дописать падающий тест в `infrastructure/http-chat-gateway.spec.ts` на
      `POST /chats`.
- [ ] Расширить `chat.gateway.ts` методом `createChat`, добавить
      `application/create-chat/create-chat.input.ts` и `.result.ts`.
- [ ] Написать падающий тест `application/create-chat/create-chat.service.spec.ts`
      на сценарии «чат создан» (со перезапросом списка) и «создание отклонено».
- [ ] Реализовать `CreateChatService` и метод шлюза.
- [ ] Написать падающий тест
      `presentation/create-chat-form/create-chat-form.spec.ts`, включая
      сценарий «название не указано».
- [ ] Реализовать `CreateChatForm` и `CreateChatModalContent`, открыть модалку
      из `ChatList`.
- [ ] `npm run lint`, `npm run test:ci`.

## 4. Выбранный чат и его участники

- [ ] Дописать падающий тест в `infrastructure/http-chat-gateway.spec.ts` на
      `GET /chats/{id}/users` и маппинг в модель `ChatUser`.
- [ ] Добавить `application/chat-user.ts`, расширить `chat.gateway.ts` методом
      `chatUsers`.
- [ ] Написать падающий тест `application/chat-users/chat-users.service.spec.ts`.
- [ ] Реализовать `ChatUsersService`.
- [ ] Написать падающий тест
      `presentation/chat-user-stack/chat-user-stack.spec.ts` на сценарии
      «участники помещаются», «участников больше, чем помещается» и на то, что
      число остальных не реагирует на нажатие.
- [ ] Реализовать `ChatUserStack` и `SelectedChatHeader`.
- [ ] Добавить дочерний маршрут `:chatId` в `src/app/app.routes.ts`, написать
      падающий тест на сценарии «чат выбран», «возврат по адресу», «чат не
      выбран», «выбранного чата не существует».
- [ ] `npm run lint`, `npm run test:ci`.

## 5. Поиск пользователей в identity-access

- [ ] Написать падающий тест
      `src/app/domains/identity-access/infrastructure/http-user-gateway.spec.ts`
      на `POST /user/search` и маппинг ответа в модель `User`.
- [ ] Добавить `src/app/domains/identity-access/application/user.ts` (модель
      `User`), `search-users/search-users.input.ts` и `.result.ts`, расширить
      `application/user.gateway.ts` методом `searchUsers`.
- [ ] Написать падающий тест
      `application/search-users/search-users.service.spec.ts` на сценарии
      «совпадения найдены», «совпадений нет», «поиск не удался».
- [ ] Реализовать `SearchUsersService`, реализовать `searchUsers` в
      `infrastructure/http-user-gateway.ts` и `infrastructure/user.api.ts`.
- [ ] Экспортировать `SearchUsersService` и `User` из
      `src/app/domains/identity-access/index.ts`.
- [ ] `npm run lint`, `npm run test:ci`.

## 6. Добавление участника

- [ ] Дописать падающий тест в `infrastructure/http-chat-gateway.spec.ts` на
      `PUT /chats/users`.
- [ ] Расширить `chat.gateway.ts` методом `addChatUser`, добавить
      `application/add-chat-user/add-chat-user.input.ts` и `.result.ts`.
- [ ] Написать падающий тест
      `application/add-chat-user/add-chat-user.service.spec.ts` на сценарии
      «участник добавлен» (с обновлением состава) и «добавление отклонено».
- [ ] Реализовать `AddChatUserService`.
- [ ] Написать падающий тест
      `application/user-search/user-search.state.spec.ts` на сценарии «поиск не
      начат», «пользователи найдены», «никого не нашли» и «ввод продолжился до
      ответа» - последний с fake timers и проверкой отмены предыдущего запроса.
- [ ] Реализовать состояние поиска поверх `SearchUsersService`.
- [ ] Написать падающий тест
      `presentation/add-chat-user-panel/add-chat-user-panel.spec.ts` на пять
      состояний панели из `design.md`.
- [ ] Реализовать `AddChatUserPanel`, открыть его из `SelectedChatHeader` через
      примитив popover.
- [ ] `npm run lint`, `npm run test:ci`.

## 7. Мок-бэкенд под чаты

- [ ] Разделить `mock-auth-backend/src/server.ts` по ресурсам: вынести
      обработчики в `mock-auth-backend/src/routes/auth.ts` и
      `mock-auth-backend/src/routes/user.ts`, оставить в `server.ts` только
      сборку приложения. Поведение не меняется, тестов не добавляем.
- [ ] Добавить `mock-auth-backend/src/routes/chats.ts`: `GET /chats`,
      `POST /chats`, `PUT /chats/users`, `GET /chats/{id}/users`. Состав полей
      сверить по `docs/api/swagger.json`.
- [ ] Добавить `POST /user/search` в `mock-auth-backend/src/routes/user.ts`:
      поиск по началу логина, не больше 10 результатов.
- [ ] Очищать чаты и их состав в `POST /test/reset`.
- [ ] `npm run lint`, `npm run test:ci`.

## 8. Сквозные сценарии и quality gates

- [ ] Написать `e2e/chats/create-chat.spec.ts`: вход, пустой список, создание
      чата, чат виден в списке.
- [ ] Написать `e2e/chats/add-chat-user.spec.ts`: чат создается фикстурой
      прямым запросом к мок-бэкенду, затем поиск по логину, добавление и
      появление участника в шапке.
- [ ] Написать `e2e/chats/chats.screenshot.spec.ts` с тегом `@visual`: экран
      чатов по умолчанию.
- [ ] `npm run lint`, `npm run test:ci`, `npm run e2e`, `npm run e2e:visual`.
