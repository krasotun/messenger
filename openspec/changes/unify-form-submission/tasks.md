## 1. Флоу отправки переезжает в shared

- [x] 1.1 Перенести спеку фабрики в `src/app/shared/submit-flow/create-form-submit-flow-state.spec.ts`, переименовав в ней `createAuthFlowState` в `createFormSubmitFlowState`; убедиться, что спека падает на отсутствующем модуле
- [x] 1.2 Перенести фабрику в `src/app/shared/submit-flow/create-form-submit-flow-state.ts` под новым именем и завести `src/app/shared/submit-flow/index.ts`; проверить, что спека из 1.1 зеленая
- [x] 1.3 Удалить `src/app/domains/identity-access/application/create-auth-flow-state.ts` и его спеку, убрать экспорт из публичного API домена `identity-access`
- [x] 1.4 Перевести `sign-in`, `sign-up`, `update-profile`, `change-password` и `change-avatar` сервисы в `identity-access/application` на `createFormSubmitFlowState` из `@shared/submit-flow`; проверить, что их существующие application specs зеленые без правок ожиданий
- [x] 1.5 Добавить в `eslint.config.js` запрет на `@shared/forms/*` из `domains/*/application` рядом с существующим запретом на `@shared/ui/*`; проверить `npm run lint`
- [x] 1.6 Прогнать `npm run lint` и `npm run test:ci`

## 2. Сервисы chats переходят на общий Флоу отправки

- [x] 2.1 Перевести `src/app/domains/chats/application/create-chat/create-chat.service.ts` на `createFormSubmitFlowState`, убрав собственные `_isSubmitting` и `_succeeded`; проверить, что `create-chat.service.spec.ts` зеленая без правок ожиданий
- [x] 2.2 То же для `src/app/domains/chats/application/add-chat-user/add-chat-user.service.ts`; проверить `add-chat-user.service.spec.ts`
- [x] 2.3 То же для `src/app/domains/chats/application/delete-chat/delete-chat.service.ts`; проверить `delete-chat.service.spec.ts`
- [x] 2.4 Прогнать `npm run lint` и `npm run test:ci`

## 3. Доступность кнопки отправки как общая фабрика

- [x] 3.1 Написать падающую спеку `src/app/shared/forms/create-submit-availability.spec.ts` на сценарии требования «Доступность кнопки отправки»: форма невалидна, форма стала валидной, валидное значение снова стало невалидным
- [x] 3.2 Реализовать `src/app/shared/forms/create-submit-availability.ts` поверх подписки на `form.events` и завести `src/app/shared/forms/index.ts`; проверить, что спека из 3.1 зеленая
- [x] 3.3 Дописать в спеку из 3.1 падающие случаи требования «Запрет отправки неизмененной формы»: предзаполненная форма не тронута, значение изменили, фокус побывал в поле без изменения значения, требование не предъявлено
- [x] 3.4 Добавить в фабрику необязательный `requireChanges` на `form.dirty`; проверить, что спека зеленая
- [x] 3.5 Написать падающую спеку `src/app/shared/forms/lock-form-while-submitting.spec.ts` на сценарии требования «Недоступность полей на время отправки»: отправка идет, отправка завершилась успехом, отправка завершилась ошибкой, блокировка не считается изменением
- [x] 3.6 Реализовать `src/app/shared/forms/lock-form-while-submitting.ts` поверх `effect` с `disable`/`enable` и `emitEvent: false`, добавить экспорт в `src/app/shared/forms/index.ts`; проверить, что спека из 3.5 зеленая
- [x] 3.7 Прогнать `npm run lint` и `npm run test:ci`

## 4. Правило в формах без запрета на неизмененное

- [ ] 4.1 Дописать в `sign-in-form.spec.ts` падающие проверки сценариев «Отправка пустой формы входа», «Ошибки полей не показаны на нетронутой форме» и «Ошибка поля показана после ухода с него»
- [ ] 4.2 Подключить фабрику доступности и `lockFormWhileSubmitting` в `sign-in-form.ts` вместо собственного `effect`, заменить `[disabled]` в `sign-in-form.html` на `isSubmitting() || !canSubmit()` и убрать `markAllAsTouched()` из `onSubmit`, сохранив охранное `if (invalid) return`; проверить спеку из 4.1
- [ ] 4.3 То же для `sign-up-form` по сценариям «Отправка формы с невалидными данными», «Ошибки полей не показаны на нетронутой форме» и «Ошибка поля показана после ухода с него»
- [ ] 4.4 То же для `change-password-form` по сценариям «Отправка формы с незаполненными полями», «Ошибки полей не показаны на нетронутой форме» и «Повтор не совпадает с новым паролем»; в последнем проверить, что сообщение под полем повтора по-прежнему появляется после ухода с поля
- [ ] 4.5 То же для `change-avatar-form` по сценариям «Отправка формы без выбранного файла» и «Выбор файла неподдерживаемого формата»
- [ ] 4.6 То же для `create-chat-form` по сценариям «Название не указано», «Название стерли после ввода», «Ошибка обязательности появляется после ухода с поля», «Ошибка обязательности показана под полем» и «Форма заблокирована во время создания»
- [ ] 4.7 Прогнать `npm run lint` и `npm run test:ci`

## 5. Редактирование профиля не отправляет неизмененную форму

- [ ] 5.1 Дописать в `update-profile-form.spec.ts` падающие проверки сценариев «Сохранение недоступно до изменений», «Сохранение становится доступным после изменения» и «Отправка невалидной формы»
- [ ] 5.2 Дописать туда же падающие проверки сценариев «Ошибка поля показана после ухода с него», «Форма заблокирована во время сохранения» и «Блокировка на время сохранения не считается изменением»
- [ ] 5.3 Подключить фабрику доступности с `requireChanges` и `lockFormWhileSubmitting` в `update-profile-form.ts`, поправить `[disabled]` в `update-profile-form.html` и убрать `markAllAsTouched()`; проверить спеки из 5.1 и 5.2
- [ ] 5.4 Прогнать `npm run lint` и `npm run test:ci`

## 6. Словарь и скриншоты

- [ ] 6.1 Обновить `CONTEXT.md`: имя **Флоу отправки** в коде - `form submit flow`, запись про `auth flow` в `## Flagged ambiguities` переводится в решенную
- [ ] 6.2 Прогнать `npm run e2e` и убедиться, что сквозные сценарии входа, регистрации и создания чата проходят с новым правилом доступности кнопки
- [ ] 6.3 Прогнать `npm run e2e:visual`, пересмотреть разошедшиеся снимки глазами и обновить те, где расхождение объясняется недоступной кнопкой
- [ ] 6.4 Quality gates: `npm run lint`, `npm run test:ci`, `npm run e2e`, `npm run e2e:visual`
