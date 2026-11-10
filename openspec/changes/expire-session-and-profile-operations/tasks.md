## 0. Истечение сессии

- [x] 0.1 Дописать падающие спеки `src/app/domains/identity-access/current-session/current-session.service.spec.ts`: `expireCurrentSession()` очищает **Текущего пользователя** и переводит **Статус сессии** в `Anonymous`, запроса к бэкенду нет
- [x] 0.2 Реализовать `expireCurrentSession()` в `current-session.service.ts`, проверив, что спеки 0.1 зеленые
- [x] 0.3 Написать падающие спеки `src/app/core/session/session-expiry.service.spec.ts` (настоящие `CurrentSessionService` и `Router`, двойники `AUTH_GATEWAY` и `NOTIFIER`): после `handle()` **Статус сессии** - `Anonymous`, показано **Уведомление** `Session expired` с текстом `Please sign in again.`, адрес - `/sign-in`
- [x] 0.4 Реализовать `src/app/core/session/session-expiry.service.ts`, проверив, что спеки 0.3 зеленые
- [x] 0.5 Написать падающие спеки `src/app/core/http/session-expiry.interceptor.spec.ts` (`HttpTestingController`, настоящие `CurrentSessionService` и `SessionExpiryService`, двойники `AUTH_GATEWAY` и `NOTIFIER`): `401` при `Authenticated` - **Статус сессии** стал `Anonymous`, ошибка дошла до вызывающего; ошибка с другим статусом - сессия осталась `Authenticated`; `401` при `Anonymous` и `Loading` - **Уведомления** нет
- [x] 0.6 Реализовать `src/app/core/http/session-expiry.interceptor.ts` и подключить его в конце `withInterceptors` в `src/app/app.config.ts`, проверив, что спеки 0.5 зеленые
- [x] 0.7 Прогнать `npm run lint` и `npm run test:ci`

## 1. Свежий профиль в application

- [x] 1.1 Написать падающие спеки `src/app/domains/identity-access/refresh-current-user/refresh-current-user.service.spec.ts`: ответ `Authenticated` обновляет и отдает **Текущего пользователя**; ответ `Anonymous` завершает поток без значения и без **Уведомления**; ошибка шлюза показывает **Уведомление** об ошибке (текст из **Ошибки приложения**; запасной текст кладет шлюз и проверяет его спек) и завершает поток без значения, а **Текущий пользователь** и **Статус сессии** при этом не меняются
- [x] 1.2 Реализовать `refresh-current-user.service.ts` (`providedIn: 'root'`, `AUTH_GATEWAY.currentSession()`, `CurrentSessionService.updateCurrentUser`, `NOTIFIER`) и экспортировать его из `src/app/domains/identity-access/index.ts`, проверив, что спеки 1.1 зеленые
- [x] 1.3 Прогнать `npm run lint` и `npm run test:ci`

## 2. Операции Текущего пользователя в Сторе

- [x] 2.1 Перенести `it` из `src/app/domains/users/data/refresh-current-user-service.spec.ts` в спек `current-session-store.spec.ts` (`describe('refresh current user')`) и реализовать `CurrentSessionStore.refreshCurrentUser()`: ответ `Authenticated` пишется прямо в состояние Стора; удалить `RefreshCurrentUserService` со спеком и экспорт из `src/app/domains/users/index.ts`
- [x] 2.2 Перенести `it` из `change-password-service.spec.ts` в спек Стора (`describe('change password')`) и реализовать `CurrentSessionStore.changePassword(input, flow)`; `ChangePasswordForm` создает свой флоу и зовет Стор, у `change-password-modal-content` пропадают `providers`, спеки формы и модалки - на настоящий Стор с двойником `USER_GATEWAY`; удалить `ChangePasswordService` со спеком и двойник из `UserMocks`
- [x] 2.3 То же для **Смены аватара**: `CurrentSessionStore.changeAvatar(input, flow)` (`describe('change avatar')`), свой флоу в `ChangeAvatarForm`, удалить `ChangeAvatarService` со спеком и двойник из `UserMocks`
- [x] 2.4 Прогнать `npm run lint` и `npm run test:ci`

## 3. Свежий профиль перед модалкой и профиль в Сторе

- [x] 3.1 Переписать падающие спеки `src/app/domains/users/feature-profile/update-profile-form/update-profile-form.spec.ts`: форма заполняется из входа `profile`, сохранение идет через настоящий `CurrentSessionStore` с двойником `USER_GATEWAY`; `it` из `update-profile-service.spec.ts`, кроме проверок `initialValues`, переезжают в спек Стора (`describe('update profile')`)
- [x] 3.2 Добавить в `update-profile-form.ts` вход `profile` и свой флоу; реализовать `CurrentSessionStore.updateProfile(input, flow)`; удалить `UpdateProfileService` со спеком и двойник из `UserMocks`; дать `update-profile-modal-content` вход `currentUser` и маппинг в `profile`; проверить, что спеки 3.1 зеленые
- [x] 3.3 Переписать падающие спеки `current-user-avatar-menu.spec.ts`: `Edit profile` закрывает меню и открывает модалку только после ответа `refreshCurrentUser()`, передавая в нее **Текущего пользователя** из ответа; пустое завершение модалку не открывает; `Change password` открывает модалку без вызова `refreshCurrentUser()`
- [x] 3.4 Реализовать в `current-user-avatar-menu.ts`, проверив, что спеки 3.3 зеленые
- [ ] 3.5 Прогнать `npm run lint` и `npm run test:ci`

## 4. Модалка закрывается при смене маршрута

- [ ] 4.1 Дописать падающие спеки `src/app/shared/ui/modal/modal-service.spec.ts` (настоящий `Router`, `RouterTestingHarness` или `provideRouter` с двумя маршрутами): завершенный переход закрывает модалку, событие закрытия приходит без результата, overlay уничтожен; отмененный переход (страж `canActivate` отдает `false`) модалку не закрывает
- [ ] 4.2 Реализовать в `modal-service.ts` закрытие на `NavigationEnd`, проверив, что спеки 4.1 и прежние спеки примитива зеленые
- [ ] 4.3 Написать e2e `e2e/auth/session-expiry.spec.ts`: открыта форма профиля, `page.route` отвечает `401` на сохранение - **Уведомление** `Session expired`, адрес `/sign-in`, модалки на экране нет
- [ ] 4.4 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e`
