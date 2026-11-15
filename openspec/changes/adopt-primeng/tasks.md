Предусловие: #300 (Angular 22) смержен в `main`, ветка issue обновлена от него.

## 1. Кит подключен, граница импорта закрыта

- [x] 1.1 Установить `primeng`, `@primeuix/themes`, `primeicons` под Angular 22 в `package.json`; проверить, что `npm install` проходит без конфликтов peer-зависимостей
- [x] 1.2 Сверить по `node_modules/primeng` имена, на которые опирается `design.md`: `providePrimeNG`, пресет Aura, `MessageService`, `ConfirmationService`, `DialogService` и ссылку диалога; расхождения внести в `design.md` и назвать в отчете блока
- [x] 1.3 Подключить кит в `src/app/app.config.ts` (`providePrimeNG` с пресетом Aura, провайдер анимаций, если v22 его требует) и стили `primeicons` в `angular.json`; дописать в `src/app/app.config.spec.ts` проверку, что конфигурация собирается, и убедиться, что она зеленая
- [x] 1.4 Дописать в `eslint.config.js` запрет `primeng`, `primeng/*`, `@primeuix/*` в `applicationRestrictedPatterns` и в блоке `src/app/shared/**` с исключением для `src/app/shared/ui/**`; проверить запрет временным импортом в `src/app/domains/chats/data/chat-list-store.ts` - `npm run lint` падает, после удаления импорта зеленый
- [x] 1.5 Обновить `openspec/config.yaml`: стек (PrimeNG), `shared` - «связки с китом и общие типы» вместо «UI-примитивы», запрет импорта кита в `data/`; проверить `npx openspec validate --strict`
- [x] 1.6 Включить в коммит блока `docs/adr/2026-11-15-ui-kit-instead-of-own-primitives.md` и строку статуса в `docs/adr/2026-06-05-own-ui-primitives-on-cdk.md`
- [x] 1.7 Прогнать `npm run lint`, `npm run test:ci`, `npm run build` и `npm run e2e`: приложение с подключенной темой и нетронутой версткой работает, бюджеты сборки не превышены

## 2. Кнопки, поля и аватар на ките

- [ ] 2.1 Переписать падающий спек `src/app/shared/ui/form/form.spec.ts` там, где он ищет кнопку по классу `button-*`: кнопка отправки находится по роли и имени, недоступность - `toBeDisabled`
- [ ] 2.2 Заменить `appButton` на кнопку кита в `src/app/shared/ui/form/form.html` и `form.ts`; спек 2.1 зеленый
- [ ] 2.3 Поправить спеки, которые опираются на классы `appButton`, и заменить `appButton` и «голые» `<button>` кнопками кита в `chat-list.html`, `selected-chat-header.html`, `add-chat-user-panel.html`, `change-avatar-form.html`, `chat-users-panel.html`, `chat-user-row.html` и их `.ts`; `aria-label` кнопок-значков сохранить; спеки этих компонентов зеленые
- [ ] 2.4 Дописать падающий тест в `src/app/shared/ui/text-field/text-field.spec.ts`: поле с показанным нарушением имеет `aria-invalid`, после исправления значения признак снят (переезд проверки из `input.spec.ts`)
- [ ] 2.5 Перевести `text-field.ts` на директиву текстового поля кита и свой признак `aria-invalid`, `form-field.html` и `form-field.scss` - на компонент сообщения кита; спеки `text-field.spec.ts` и `form-field.spec.ts` зеленые без правки ожиданий по тексту и роли
- [ ] 2.6 Перевести `src/app/shared/ui/avatar/avatar.html` и `avatar.scss` на аватар кита, не меняя входы; `avatar.spec.ts` зеленый, правятся только ожидания по разметке, не по поведению
- [ ] 2.7 Удалить `src/app/shared/ui/button/` и `src/app/shared/ui/input/` со спеками; `grep -r "appButton\|appInput" src` пуст
- [ ] 2.8 Убрать из `src/styles.scss` и стилей компонентов правила, которые дублируют или ломают оформление кнопок и полей кита; проверить глазами страницы Входа, Регистрации и экран чатов на `npm start`
- [ ] 2.9 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e`

## 3. Уведомления на ките

- [ ] 3.1 Написать падающий спек `src/app/shared/ui/toast/prime-notifier.spec.ts` (хост-компонент с настоящим `<p-toast>`, fake timers): успех и ошибка показывают заголовок и текст; без интервала **Уведомление** гаснет через 5 секунд, с заданным - через заданный; два **Уведомления** видны одновременно; повтор с тем же текстом дает второе; четвертое не убирает первое; кнопка закрытия убирает одно
- [ ] 3.2 Реализовать `src/app/shared/ui/toast/prime-notifier.ts`; спек 3.1 зеленый
- [ ] 3.3 Провайдить `MessageService` и `{ provide: NOTIFIER, useExisting: PrimeNotifier }` в `src/app/app.config.ts`, поставить `<p-toast position="top-right">` в `src/app/app.html`; обновить `app.config.spec.ts` и убедиться, что он зеленый
- [ ] 3.4 Удалить `toast-service.ts`, `toast/`, `toast-stack/` со спеками и их стили из `src/styles.scss`; `NotificationMocks` не трогать; `grep -r "ToastService\|ToastStack" src` пуст
- [ ] 3.5 Поправить `e2e/toast-position.spec.ts` под разметку кита (поиск **Уведомления** по тексту и роли, а не по классу) и убедиться, что он зеленый: **Уведомление** в правом верхнем углу и поверх модального окна
- [ ] 3.6 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e`

## 4. Диалоги и подтверждения на ките

- [ ] 4.1 Проверочный спек: в `src/app/domains/chats/feature-selected-chat/selected-chat/selected-chat.spec.ts` заменить двойник подтверждения настоящим `ConfirmationService` кита с `<p-confirmdialog>` в хосте и написать падающий тест «человек подтверждает **Удаление чата** кнопкой `Delete` - двойник `CHAT_GATEWAY.deleteChat` вызван». Если диалог кита не появляется или не закрывается в jsdom даже с отключенными анимациями - остановиться и вернуться с развилкой
- [ ] 4.2 Дописать там же падающие тесты сценариев `chats`: закрытие окна удаления по `Escape` и кнопкой закрытия, закрытие окна исключения без выбора - Шлюз не вызван; повторный запрос после закрытия выполняет действие один раз; кнопка `Delete` оформлена опасной, `Remove` - обычной
- [ ] 4.3 Перевести `selected-chat.ts` на `ConfirmationService` кита: заголовок, сообщение с названием **Чата** или именем **Участника чата**, подписи кнопок, опасное оформление у удаления; провайдить `ConfirmationService` в `app.config.ts` и поставить `<p-confirmdialog>` в `src/app/app.html`; спеки 4.1 и 4.2 зеленые
- [ ] 4.4 Удалить `src/app/shared/ui/confirmation/` со спеками; `grep -r "shared/ui/confirmation" src` пуст
- [ ] 4.5 Создать `src/app/shared/ui/dialog/dialog-defaults.constants.ts` с `DIALOG_DEFAULTS` (закрытие по `Escape`, по фону, кнопкой) и провайдить `DialogService` в `app.config.ts`; проверка - спеки 4.6-4.8
- [ ] 4.6 Переписать падающие спеки `chat-list.spec.ts` и `create-chat-modal-content.spec.ts` на настоящий `DialogService`: `Create` открывает окно с формой; успех создания закрывает окно; отказ Шлюза оставляет окно открытым с введенным названием; затем перевести `chat-list.ts` и `create-chat-modal-content.ts` на `DialogService` и ссылку диалога кита, спеки зеленые
- [ ] 4.7 Переписать падающие спеки `current-user-avatar-menu.spec.ts`, `update-profile-modal-content.spec.ts`, `change-password-modal-content.spec.ts` на настоящий `DialogService`: `Edit profile` открывает окно только после ответа `refreshCurrentUser()` и передает **Текущего пользователя**; `Change password` открывает окно сразу; затем перевести `current-user-avatar-menu.ts` и оба содержимых на кит, спеки зеленые. Пропустить для тех модалок, которые к этому моменту убрал #292
- [ ] 4.8 Написать падающий спек `src/app/core/routing/dialogs-close-on-navigation.spec.ts` (настоящие `Router` и `DialogService`, `provideRouter` с двумя маршрутами): завершенный переход закрывает открытый диалог; отмененный переход (`canActivate` отдает `false`) оставляет его открытым
- [ ] 4.9 Реализовать `src/app/core/routing/dialogs-close-on-navigation.ts` (`provideDialogsCloseOnNavigation`) и подключить в `app.config.ts`; спек 4.8 зеленый. Нет публичного способа перечислить открытые диалоги - остановиться и вернуться с развилкой
- [ ] 4.10 Удалить `src/app/shared/ui/modal/` целиком вместе с `testing/` и убрать `ModalMocks` из `chats-page.spec.ts`; убрать стили оверлея модалки из `src/styles.scss`; `grep -r "shared/ui/modal\|ModalMocks" src` пуст
- [ ] 4.11 Обновить `openspec/config.yaml`: из правила о двойниках убрать «примитивы поверх CDK Overlay (`ModalService`, `ConfirmationService`)» и `ModalMocks`, дописать, что наложения кита в спеках настоящие; из запрета для `data/` убрать упоминание `ModalRef`; проверить `npx openspec validate --strict`
- [ ] 4.12 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e` (включая `e2e/auth/session-expiry.spec.ts`: после **Истечения сессии** диалога на экране нет)

## 5. Меню Текущего пользователя на ките

- [ ] 5.1 Переписать падающий спек `current-user-avatar-menu.spec.ts` в части меню: клик по аватару показывает пункты `Edit profile`, `Change password`, `Logout`; выбор пункта закрывает меню; повторный клик по аватару закрывает меню
- [ ] 5.2 Перевести `current-user-avatar-menu.ts`, `.html`, `.scss` на всплывающее меню кита; спек 5.1 зеленый
- [ ] 5.3 Заменить SVG в `src/app/core/layouts/header/header.html` значком `primeicons` и поправить `header.spec.ts`, если он опирался на разметку значка; спек зеленый
- [ ] 5.4 Удалить `src/app/shared/ui/popover/` со спеками; убрать `@angular/cdk` из `dependencies`, если `grep -r "@angular/cdk" src` находит только `@angular/cdk/testing` в harness - тогда перенести пакет в `devDependencies`; `npm run build` зеленый
- [ ] 5.5 Поправить e2e-тесты меню (`e2e/auth/current-user-menu*.spec.ts` и те, что открывают меню по пути) под роли кита (`menuitem` вместо `button`, если кит их так объявляет); `npm run e2e` зеленый
- [ ] 5.6 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e`

## 6. Эталоны и финальные гейты

- [ ] 6.1 Запушить ветку блока и взять из артефакта `test-results` упавшего job `visual` файлы `*-actual.png` для семи скриншотных тестов (`sign-in`, `sign-up`, `current-user-menu`, `update-profile`, `change-password`, `chats`, `toast`)
- [ ] 6.2 Просмотреть каждый снимок глазами: нет наложений, обрезанного текста и потерянных отступов; найденное чинится в верстке, а не закрывается эталоном
- [ ] 6.3 Положить новые эталоны в каталоги `*-snapshots` рядом с тестами и показать их в PR блока; job `visual` в CI зеленый
- [ ] 6.4 Проверить, что в `shared/ui` остались только `avatar/`, `dialog/`, `form/`, `form-field/`, `text-field/`, `toast/prime-notifier.ts`, а `npx openspec validate --strict` зеленый
- [ ] 6.5 Прогнать `npm run lint`, `npm run test:ci`, `npm run build` и `npm run e2e`; дождаться зеленых `quality`, `e2e` и `visual` в CI
