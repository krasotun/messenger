## 1. Порт уведомлений

- [x] 1.1 Создать `src/app/shared/notifications/notification-kind.type.ts`, `notification.type.ts` и `notification.constants.ts` - вид **Уведомления**, его состав (вид, заголовок, текст) и константу `DEFAULT_NOTIFICATION_DELAY_MS = 5000`; проверка: `npx tsc -p tsconfig.app.json --noEmit` проходит
- [x] 1.2 Создать `src/app/shared/notifications/notifier.type.ts` - контракт показа с необязательным интервалом угасания и токен `NOTIFIER` рядом с ним; проверка: токен импортируется из слоя use case без срабатывания `no-restricted-imports` (`npm run lint`)
- [x] 1.3 Создать баррель `src/app/shared/notifications/index.ts`; проверка: `npm run lint` зеленый

## 2. Примитив одного уведомления

- [ ] 2.1 Написать падающий `src/app/shared/ui/toast/toast/toast.spec.ts` на состав: заголовок и текст видны, вид меняет модификатор класса (успех - `--color-success`, ошибка - `--color-danger`)
- [ ] 2.2 Реализовать `toast.ts`, `toast.html`, `toast.scss`; проверка: спека из 2.1 зеленая
- [ ] 2.3 Написать падающий тест на закрытие кнопкой и на угасание (таймеры Vitest): без интервала - 5 секунд, с заданным интервалом - он, соседние **Уведомления** гаснут независимо
- [ ] 2.4 Реализовать таймер на входном интервале с дефолтом `DEFAULT_NOTIFICATION_DELAY_MS` и кнопку закрытия в `toast.ts`; проверка: спека из 2.3 зеленая
- [ ] 2.5 Реализовать оформление видов в `toast.scss` на токенах `--color-success` и `--color-danger` по макету из `design.md`; проверка: спека из 2.1 зеленая
- [ ] 2.6 Прогнать `npm run lint` и `npm run test:ci`

## 3. Стек уведомлений и реализация порта

- [ ] 3.1 Написать падающий `src/app/shared/ui/toast/toast-stack/toast-stack.spec.ts`: порядок (новое сверху), предел в три, вытеснение самого старого, два одинаковых не схлопываются, контейнер объявлен как live region
- [ ] 3.2 Реализовать `toast-stack.ts`, `toast-stack.html`, `toast-stack.scss`; проверка: спека из 3.1 зеленая
- [ ] 3.3 Написать падающий `src/app/shared/ui/toast/toast-service.spec.ts`: показ создает overlay, интервал из вызова доходит до `Toast`, стек опустел - overlay уничтожен, **Уведомление** видно поверх открытой модалки, фокус не переносится
- [ ] 3.4 Реализовать `toast-service.ts` как реализацию `Notifier` на CDK Overlay с `global().top().right()`; проверка: спека из 3.3 зеленая
- [ ] 3.5 Подключить `NOTIFIER` к `ToastService` в `src/app/app.config.ts`; проверка: спека, поднимающая приложение, получает `Notifier` из инжектора
- [ ] 3.6 Прогнать `npm run lint` и `npm run test:ci`

## 4. Исход входа и регистрации

- [ ] 4.1 Дописать падающие спеки `sign-in.service.spec.ts` и `sign-up.service.spec.ts`: ошибка отправки показывает **Уведомление** с текстом из `reason`, а без `reason` - с generic-сообщением
- [ ] 4.2 Убрать сигнал с текстом ошибки из `src/app/domains/identity-access/application/create-auth-flow-state.ts` и вызвать порт в `sign-in.service.ts`, `sign-up.service.ts`; проверка: спеки из 4.1 зеленые
- [ ] 4.3 Написать падающие component specs на то, что `sign-in-form` и `sign-up-form` не содержат текста ошибки отправки
- [ ] 4.4 Убрать блоки ошибки из `sign-in-form.html`, `sign-in-form.ts`, `sign-up-form.html`, `sign-up-form.ts` и соответствующие правила из их `.scss`; проверка: спеки из 4.3 зеленые
- [ ] 4.5 Прогнать `npm run lint` и `npm run test:ci`

## 5. Исход действий над профилем

- [ ] 5.1 Дописать падающие спеки `update-profile.service.spec.ts`, `change-password.service.spec.ts`, `change-avatar.service.spec.ts`: успех показывает **Уведомление** об успехе, ошибка - **Уведомление** об ошибке
- [ ] 5.2 Вызвать порт из этих трех сервисов; проверка: спеки из 5.1 зеленые
- [ ] 5.3 Написать падающие component specs: `update-profile-form`, `change-password-form`, `change-avatar-form` не содержат текста ошибки отправки, а проверки файла в `change-avatar-form` остаются в форме
- [ ] 5.4 Убрать блоки ошибки отправки из трех шаблонов и их компонентов, сохранив сообщения клиентских проверок; проверка: спеки из 5.3 зеленые
- [ ] 5.5 Прогнать `npm run lint` и `npm run test:ci`

## 6. Исход действий над чатами

- [ ] 6.1 Дописать падающие спеки `create-chat.service.spec.ts` и `add-chat-user.service.spec.ts`: ошибка показывает **Уведомление**, исход виден и после закрытия **Поиска пользователя**
- [ ] 6.2 Убрать сигнал с текстом ошибки из обоих сервисов и вызвать порт; проверка: спеки из 6.1 зеленые
- [ ] 6.3 Написать падающие component specs: `create-chat-form` и `add-chat-user-panel` не содержат текста **Ошибки приложения**
- [ ] 6.4 Убрать блоки ошибки из `create-chat-form.html`, `add-chat-user-panel.html` и их компонентов; проверка: спеки из 6.3 зеленые, `chat-list` и `selected-chat-header` не тронуты
- [ ] 6.5 Прогнать `npm run lint` и `npm run test:ci`

## 7. Визуальный тест и quality gates

- [ ] 7.1 Написать `e2e/toast.screenshot.spec.ts` с тегом `@visual`: стек из **Уведомления** об успехе и **Уведомления** об ошибке на детерминированных ответах `mock-backend`; интервал угасания в тесте задается явно, чтобы снимок не зависел от дефолта
- [ ] 7.2 Снять эталоны и сверить их с макетом из `design.md`; проверка: `npm run e2e:visual` зеленый
- [ ] 7.3 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e` - сквозные сценарии форм затронуты
- [ ] 7.4 Прогнать `npx openspec validate --strict add-toast-notifications`
