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

## 3. Формы для страницы

- [ ] 3.1 Переписать падающие спеки `src/app/domains/users/feature-profile/update-profile-form/update-profile-form.spec.ts`: форма заполняется из входа `profile`; после успешной отправки поля показывают сохраненные значения, Save недоступна; `hasUnsavedChanges()` ложно на открытии и после успеха, истинно после изменения поля; `it` из `update-profile-service.spec.ts`, кроме проверок `initialValues`, переезжают в спек Стора (`describe('update profile')`)
- [ ] 3.2 Добавить в `update-profile-form.ts` вход `profile`, свой флоу, `hasUnsavedChanges()` и `reset(getRawValue())` на успехе; реализовать `CurrentSessionStore.updateProfile(input, flow)`; удалить `UpdateProfileService` со спеком и двойник из `UserMocks`; в `update-profile-modal-content` передать `profile` из **Текущего пользователя**, чтобы модалка дожила до блока 5; проверить, что спеки 3.1 зеленые
- [ ] 3.3 Дописать падающий спек `src/app/shared/forms/connect-submit-flow.spec.ts`: контрол, выключенный до отправки, остается выключенным после ее завершения, остальные снова включены
- [ ] 3.4 Реализовать в `connect-submit-flow.ts` запоминание выключенных до отправки контролов, проверив, что спек 3.3 и прежние спеки примитива зеленые
- [ ] 3.5 Дописать падающий спек `current-user-mapper.spec.ts` (пустое `display_name` - `displayName: null`) и реализовать в `current-user-mapper.ts`
- [ ] 3.6 Дописать падающие спеки `update-profile-form.spec.ts` по сценариям флажка `Show first and last name`: стоит на открытии без **Отображаемого имени** и снят с ним; поставленный очищает и выключает поле; снятый включает поле, и пустое поле не дает сохранить; сохранение с флажком отправляет `displayName: ''`; после отправки поле остается выключенным
- [ ] 3.7 Реализовать флажок `showFullName` в группе `update-profile-form.ts` и подписку на его `valueChanges`, проверив, что спеки 3.6 зеленые
- [ ] 3.8 Дописать падающие спеки `change-password-form.spec.ts`: после успешной смены поля пустые и без сообщений об ошибках; `hasUnsavedChanges()` ложно на открытии и после успеха, истинно после ввода; новый пароль и повтор выключены, пока старый пуст; стертый старый очищает и выключает их
- [ ] 3.9 Добавить `hasUnsavedChanges()`, `reset()` на успехе и подписку на `valueChanges` старого пароля в `change-password-form.ts`, проверив, что спеки 3.8 зеленые
- [ ] 3.10 Переписать падающие спеки `change-avatar-form.spec.ts` по артборду `Main` канваса: без файла - текущий **Аватар**, имя и `Change avatar`, без `Upload` и `Cancel`; после выбора допустимого файла - превью, имя файла, `Upload` и `Cancel`; `Cancel` возвращает текущий **Аватар**; ошибка формата - сообщение в форме, `Upload` нет; во время отправки выбор, `Upload` и `Cancel` недоступны; `hasUnsavedChanges()` истинно только при выбранном файле
- [ ] 3.11 Перерисовать `change-avatar-form.html` и `change-avatar-form.scss` строкой по артборду `Main`, добавить `Cancel` и `hasUnsavedChanges()` в `change-avatar-form.ts`, проверив, что спеки 3.10 зеленые
- [ ] 3.12 Прогнать `npm run lint` и `npm run test:ci`

## 4. Стражи ухода и выхода

- [ ] 4.1 Написать падающие спеки `src/app/core/routing/unsaved-changes.guard.spec.ts`: без изменений - `true` без подтверждения; с изменениями - подтверждение `Discard changes` с `Discard`, `isDangerous` и предметом раздела; согласие - `true`, отказ - `false`; **Статус сессии** не `Authenticated` - `true` без подтверждения
- [ ] 4.2 Реализовать `src/app/core/routing/unsaved-changes.guard.ts` с интерфейсом `HasUnsavedChanges` и `CanDeactivateFn`, проверив, что спеки 4.1 зеленые
- [ ] 4.3 Написать падающие спеки `src/app/core/routing/logout.guard.spec.ts`: страж выполняет **Выход** и отдает `UrlTree` на `/sign-in` и на успехе, и на ошибке запроса
- [ ] 4.4 Реализовать `src/app/core/routing/logout.guard.ts`, проверив, что спеки 4.3 зеленые
- [ ] 4.5 Прогнать `npm run lint` и `npm run test:ci`

## 5. Страница Настроек вместо модалок

- [ ] 5.1 Написать падающие спеки `src/app/domains/users/feature-profile/profile-settings/profile-settings.spec.ts`: форма профиля получает значения из входа `currentUser`; над ней строка **Смены аватара**; `hasUnsavedChanges()` истинно, если изменения есть в любой из двух форм; `beforeunload` отменяется только при изменениях
- [ ] 5.2 Реализовать `profile-settings.ts`, `profile-settings.html`, `profile-settings.scss`, проверив, что спеки 5.1 зеленые
- [ ] 5.3 Написать падающие спеки `src/app/domains/users/feature-profile/password-settings/password-settings.spec.ts`: показана форма смены пароля; `hasUnsavedChanges()` и `beforeunload` - как в 5.1
- [ ] 5.4 Реализовать `password-settings.ts`, `password-settings.html`, `password-settings.scss`, проверив, что спеки 5.3 зеленые
- [ ] 5.5 Написать падающие спеки `src/app/pages/settings-page/settings-page.spec.ts` и `settings.routes.spec.ts` (`RouterTestingHarness`): ссылки `Profile` / `Password` с отметкой текущего раздела и `Back to chats`; `/settings` переадресует на `/settings/profile`; раздел профиля открывается только после ответа resolver и получает `currentUser`; resolver без значения оставляет прежний адрес; раздел пароля resolver не вызывает; уход с изменениями спрашивает подтверждение
- [ ] 5.6 Реализовать `settings-page.ts`, `settings-page.html`, `settings-page.scss` по артбордам `Main` и `Password`, `current-user.resolver.ts` и `settings.routes.ts` в `src/app/pages/settings-page/`; подключить `settings` через `loadChildren` и маршрут `logout` с `logoutGuard` в `src/app/app.routes.ts`, проверив, что спеки 5.5 зеленые
- [ ] 5.7 Дописать падающие спеки `src/app/core/routing/` (или `app.routes.spec.ts`): **Гость** на `/settings` и `/settings/password` уходит на `/sign-in`, данные профиля не запрашиваются
- [ ] 5.8 Переписать падающие спеки `current-user-avatar-menu.spec.ts`: в меню `Settings` → `/settings` и `Logout` → `/logout`, пунктов `Edit profile` и `Change password` нет, выбор пункта закрывает меню; реализовать в `current-user-avatar-menu.ts` и `.html`, проверив, что спеки зеленые
- [ ] 5.9 Удалить `update-profile-modal-content` и `change-password-modal-content` вместе со спеками; проверить, что `ModalService` в `users` больше не используется
- [ ] 5.10 Переписать e2e `e2e/profile/update-profile.spec.ts`, `change-password.spec.ts`, `change-avatar.spec.ts` и `e2e/auth/logout.spec.ts` с модалок на страницу **Настроек**
- [ ] 5.11 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e`

## 6. Индикатор навигации

- [ ] 6.1 Написать падающие спеки `src/app/core/layouts/navigation-progress/navigation-progress.spec.ts` (fake timers): навигация дольше 200 мс показывает полоску с ролью `progressbar`; быстрее - не показывает; конец, отмена и ошибка навигации полоску прячут; если fake timers не уживаются с роутером - подменить поток событий `Router` и записать это в `design.md`
- [ ] 6.2 Реализовать `navigation-progress.ts`, `navigation-progress.html`, `navigation-progress.scss` по артборду `Navigating` и поставить `<app-navigation-progress>` в `src/app/app.html` над `<router-outlet>`, проверив, что спеки 6.1 зеленые
- [ ] 6.3 Прогнать `npm run lint` и `npm run test:ci`

## 7. Сквозные сценарии и макет

- [ ] 7.1 Написать e2e `e2e/settings/settings.spec.ts`: вход в **Настройки** из меню открывает `/settings/profile`; уход с измененным профилем - отказ оставляет значение, согласие уводит к **Чатам**; «назад» в браузере с изменениями спрашивает подтверждение; переход в раздел пароля с введенным паролем спрашивает подтверждение; **Выход** с изменениями - отказ оставляет сессию и раздел, согласие уводит на `/sign-in`; **Истечение сессии** - `page.route` отвечает `401` на сохранение измененного профиля: **Уведомление** `Session expired` и переход на `/sign-in` без подтверждения ухода
- [ ] 7.2 Заменить скриншотные e2e профиля и пароля на `e2e/settings/settings.screenshot.spec.ts` (`settings profile @visual`, `settings password @visual`), обновить `current-user-menu @visual` под новое меню; эталоны взять из артефакта `test-results` job `visual`
- [ ] 7.3 Сверить снимки с артбордами канваса `Main`, `Password` и меню на `Navigating`
- [ ] 7.4 Прогнать `npm run lint`, `npm run test:ci`, `npm run e2e` и дождаться зеленого job `visual` в CI
