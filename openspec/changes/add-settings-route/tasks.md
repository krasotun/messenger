## 1. Свежий профиль в application

- [ ] 1.1 Написать падающие спеки `src/app/domains/identity-access/application/refresh-current-user/refresh-current-user.service.spec.ts`: ответ `Authenticated` обновляет **Текущую сессию** и отдает **Текущего пользователя**; ответ `Anonymous` и ошибка шлюза показывают **Уведомление** об ошибке (текст из **Ошибки приложения**, при его отсутствии - generic), поток завершается без значения, а **Текущая сессия** и **Статус сессии** не меняются
- [ ] 1.2 Реализовать `refresh-current-user.service.ts` (`providedIn: 'root'`, `AUTH_GATEWAY.currentSession()`, `CurrentSessionService.updateCurrentUser`, `NOTIFIER`) и экспортировать его из `src/app/domains/identity-access/index.ts`, проверив, что спеки 1.1 зеленые
- [ ] 1.3 Прогнать `npm run lint` и `npm run test:ci`

## 2. Формы для страницы

- [ ] 2.1 Переписать падающие спеки `src/app/domains/identity-access/presentation/update-profile-form/update-profile-form.spec.ts`: форма заполняется из входа `profile`; после успешной отправки поля показывают сохраненные значения, Save недоступна; `hasUnsavedChanges()` ложно на открытии и после успеха, истинно после изменения поля; из спеков `src/app/domains/identity-access/application/update-profile/update-profile.service.spec.ts` уходят проверки `initialValues`
- [ ] 2.2 Добавить в `update-profile-form.ts` вход `profile`, `hasUnsavedChanges()` и `reset(getRawValue())` на успехе; удалить `initialValues` из `update-profile.service.ts`; в `update-profile-modal-content` передать `profile` из **Текущей сессии**, чтобы модалка дожила до блока 4; проверить, что спеки 2.1 зеленые
- [ ] 2.3 Дописать падающие спеки `change-password-form.spec.ts`: после успешной смены поля пустые и без сообщений об ошибках; `hasUnsavedChanges()` ложно на открытии и после успеха, истинно после ввода
- [ ] 2.4 Добавить `hasUnsavedChanges()` и `reset()` на успехе в `change-password-form.ts`, проверив, что спеки 2.3 зеленые
- [ ] 2.5 Переписать падающие спеки `change-avatar-form.spec.ts` по артборду `Main` канваса: без файла - текущий **Аватар**, имя и `Change avatar`, без `Upload` и `Cancel`; после выбора допустимого файла - превью, имя файла, `Upload` и `Cancel`; `Cancel` возвращает текущий **Аватар**; ошибка формата - сообщение в форме, `Upload` нет; во время отправки выбор, `Upload` и `Cancel` недоступны; `hasUnsavedChanges()` истинно только при выбранном файле
- [ ] 2.6 Перерисовать `change-avatar-form.html` и `change-avatar-form.scss` строкой по артборду `Main`, добавить `Cancel` и `hasUnsavedChanges()` в `change-avatar-form.ts`, проверив, что спеки 2.5 зеленые
- [ ] 2.7 Прогнать `npm run lint` и `npm run test:ci`

## 3. Стражи ухода и выхода

- [ ] 3.1 Написать падающие спеки `src/app/core/routing/unsaved-changes.guard.spec.ts`: без изменений - `true` без подтверждения; с изменениями - подтверждение `Discard changes` с `Discard`, `isDangerous` и предметом раздела; согласие - `true`, отказ - `false`
- [ ] 3.2 Реализовать `src/app/core/routing/unsaved-changes.guard.ts` с интерфейсом `HasUnsavedChanges` и `CanDeactivateFn`, проверив, что спеки 3.1 зеленые
- [ ] 3.3 Написать падающие спеки `src/app/core/routing/logout.guard.spec.ts`: страж выполняет **Выход** и отдает `UrlTree` на `/sign-in` и на успехе, и на ошибке запроса
- [ ] 3.4 Реализовать `src/app/core/routing/logout.guard.ts`, проверив, что спеки 3.3 зеленые
- [ ] 3.5 Прогнать `npm run lint` и `npm run test:ci`

## 4. Страница Настроек вместо модалок

- [ ] 4.1 Написать падающие спеки `src/app/domains/identity-access/presentation/profile-settings/profile-settings.spec.ts`: форма профиля получает значения из входа `currentUser`; над ней строка **Смены аватара**; `hasUnsavedChanges()` истинно, если изменения есть в любой из двух форм; `beforeunload` отменяется только при изменениях
- [ ] 4.2 Реализовать `profile-settings.ts`, `profile-settings.html`, `profile-settings.scss` с `providers: [UpdateProfileService, ChangeAvatarService]`, проверив, что спеки 4.1 зеленые
- [ ] 4.3 Написать падающие спеки `src/app/domains/identity-access/presentation/password-settings/password-settings.spec.ts`: показана форма смены пароля; `hasUnsavedChanges()` и `beforeunload` - как в 4.1
- [ ] 4.4 Реализовать `password-settings.ts`, `password-settings.html`, `password-settings.scss` с `providers: [ChangePasswordService]`, проверив, что спеки 4.3 зеленые
- [ ] 4.5 Написать падающие спеки `src/app/pages/settings-page/settings-page.spec.ts` и `settings.routes.spec.ts` (`RouterTestingHarness`): ссылки `Profile` / `Password` с отметкой текущего раздела и `Back to chats`; `/settings` переадресует на `/settings/profile`; раздел профиля открывается только после ответа resolver и получает `currentUser`; resolver без значения оставляет прежний адрес; раздел пароля resolver не вызывает; уход с изменениями спрашивает подтверждение
- [ ] 4.6 Реализовать `settings-page.ts`, `settings-page.html`, `settings-page.scss` по артбордам `Main` и `Password`, `current-user.resolver.ts` и `settings.routes.ts` в `src/app/pages/settings-page/`; подключить `settings` через `loadChildren` и маршрут `logout` с `logoutGuard` в `src/app/app.routes.ts`, проверив, что спеки 4.5 зеленые
- [ ] 4.7 Дописать падающие спеки `src/app/core/routing/` (или `app.routes.spec.ts`): **Гость** на `/settings` и `/settings/password` уходит на `/sign-in`, данные профиля не запрашиваются
- [ ] 4.8 Переписать падающие спеки `current-user-avatar-menu.spec.ts`: в меню `Settings` → `/settings` и `Logout` → `/logout`, пунктов `Edit profile` и `Change password` нет, выбор пункта закрывает меню; реализовать в `current-user-avatar-menu.ts` и `.html`, проверив, что спеки зеленые
- [ ] 4.9 Удалить `update-profile-modal-content` и `change-password-modal-content` вместе со спеками; проверить, что `ModalService` в `identity-access` больше не используется
- [ ] 4.10 Переписать e2e `e2e/profile/update-profile.spec.ts`, `change-password.spec.ts`, `change-avatar.spec.ts` и `e2e/auth/logout.spec.ts` с модалок на страницу **Настроек**
- [ ] 4.11 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e`

## 5. Индикатор навигации

- [ ] 5.1 Написать падающие спеки `src/app/core/layouts/navigation-progress/navigation-progress.spec.ts` (fake timers): навигация дольше 200 мс показывает полоску с ролью `progressbar`; быстрее - не показывает; конец, отмена и ошибка навигации полоску прячут; если fake timers не уживаются с роутером - подменить поток событий `Router` и записать это в `design.md`
- [ ] 5.2 Реализовать `navigation-progress.ts`, `navigation-progress.html`, `navigation-progress.scss` по артборду `Navigating` и поставить `<app-navigation-progress>` в `src/app/app.html` над `<router-outlet>`, проверив, что спеки 5.1 зеленые
- [ ] 5.3 Прогнать `npm run lint` и `npm run test:ci`

## 6. Сквозные сценарии и макет

- [ ] 6.1 Написать e2e `e2e/settings/settings.spec.ts`: вход в **Настройки** из меню открывает `/settings/profile`; уход с измененным профилем - отказ оставляет значение, согласие уводит к **Чатам**; «назад» в браузере с изменениями спрашивает подтверждение; переход в раздел пароля с введенным паролем спрашивает подтверждение; **Выход** с изменениями - отказ оставляет сессию и раздел, согласие уводит на `/sign-in`
- [ ] 6.2 Заменить скриншотные e2e профиля и пароля на `e2e/settings/settings.screenshot.spec.ts` (`settings profile @visual`, `settings password @visual`), обновить `current-user-menu @visual` под новое меню; эталоны взять из артефакта `test-results` job `visual`
- [ ] 6.3 Сверить снимки с артбордами канваса `Main`, `Password` и меню на `Navigating`
- [ ] 6.4 Прогнать `npm run lint`, `npm run test:ci`, `npm run e2e` и дождаться зеленого job `visual` в CI
