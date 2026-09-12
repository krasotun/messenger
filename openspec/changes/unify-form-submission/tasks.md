## 1. Флоу отправки переезжает в shared

- [ ] 1.1 Перенести спеку фабрики в `src/app/shared/submit-flow/create-submit-flow-state.spec.ts`, переименовав в ней `createAuthFlowState` в `createSubmitFlowState`; убедиться, что спека падает на отсутствующем модуле
- [ ] 1.2 Перенести фабрику в `src/app/shared/submit-flow/create-submit-flow-state.ts` под новым именем и завести `src/app/shared/submit-flow/index.ts`; проверить, что спека из 1.1 зеленая
- [ ] 1.3 Удалить `src/app/domains/identity-access/application/create-auth-flow-state.ts` и его спеку, убрать экспорт из публичного API домена `identity-access`
- [ ] 1.4 Перевести `sign-in`, `sign-up`, `update-profile`, `change-password` и `change-avatar` сервисы в `identity-access/application` на `createSubmitFlowState` из `@shared/submit-flow`; проверить, что их существующие application specs зеленые без правок ожиданий
- [ ] 1.5 Добавить в `eslint.config.js` запрет на `@shared/forms/*` из `domains/*/application` рядом с существующим запретом на `@shared/ui/*`; проверить `npm run lint`
- [ ] 1.6 Прогнать `npm run lint` и `npm run test:ci`

## 2. Сервисы chats переходят на общий Флоу отправки

- [ ] 2.1 Перевести `src/app/domains/chats/application/create-chat/create-chat.service.ts` на `createSubmitFlowState`, убрав собственные `_isSubmitting` и `_succeeded`; проверить, что `create-chat.service.spec.ts` зеленая без правок ожиданий
- [ ] 2.2 То же для `src/app/domains/chats/application/add-chat-user/add-chat-user.service.ts`; проверить `add-chat-user.service.spec.ts`
- [ ] 2.3 То же для `src/app/domains/chats/application/delete-chat/delete-chat.service.ts`; проверить `delete-chat.service.spec.ts`
- [ ] 2.4 Прогнать `npm run lint` и `npm run test:ci`

## 3. Доступность кнопки отправки как общая фабрика

- [ ] 3.1 Написать падающую спеку `src/app/shared/forms/create-submit-availability.spec.ts` на сценарии требования «Доступность кнопки отправки»: форма невалидна, форма стала валидной, валидное значение снова стало невалидным
- [ ] 3.2 Реализовать `src/app/shared/forms/create-submit-availability.ts` поверх подписки на `form.events` и завести `src/app/shared/forms/index.ts`; проверить, что спека из 3.1 зеленая
- [ ] 3.3 Дописать в спеку из 3.1 падающие случаи требования «Запрет отправки неизмененной формы»: предзаполненная форма не тронута, значение изменили, фокус побывал в поле без изменения значения, требование не предъявлено
- [ ] 3.4 Добавить в фабрику необязательный `requireChanges` на `form.dirty`; проверить, что спека зеленая
- [ ] 3.5 Прогнать `npm run lint` и `npm run test:ci`

## 4. Правило в формах без запрета на неизмененное

- [ ] 4.1 Дописать в `sign-in-form.spec.ts` падающую проверку сценария «Отправка пустой формы входа»: кнопка отправки недоступна, пока форма невалидна
- [ ] 4.2 Подключить фабрику доступности в `sign-in-form.ts`, заменить `[disabled]` в `sign-in-form.html` на `isSubmitting() || !canSubmit()` и убрать `markAllAsTouched()` из `onSubmit`, сохранив охранное `if (invalid) return`; проверить спеку из 4.1
- [ ] 4.3 То же для `sign-up-form` по сценарию «Отправка формы с невалидными данными»
- [ ] 4.4 То же для `change-password-form` по сценариям «Отправка формы с незаполненными полями» и «Повтор не совпадает с новым паролем»; в последнем проверить, что сообщение под полем повтора по-прежнему появляется после ухода с поля
- [ ] 4.5 То же для `change-avatar-form` по сценариям «Отправка формы без выбранного файла» и «Выбор файла неподдерживаемого формата»
- [ ] 4.6 То же для `create-chat-form` по сценариям «Название не указано» и «Название стерли после ввода»
- [ ] 4.7 Прогнать `npm run lint` и `npm run test:ci`

## 5. Редактирование профиля не отправляет неизмененную форму

- [ ] 5.1 Дописать в `update-profile-form.spec.ts` падающие проверки сценариев «Сохранение недоступно до изменений», «Сохранение становится доступным после изменения» и «Отправка невалидной формы»
- [ ] 5.2 Подключить фабрику доступности с `requireChanges` в `update-profile-form.ts`, поправить `[disabled]` в `update-profile-form.html` и убрать `markAllAsTouched()`; проверить спеки из 5.1
- [ ] 5.3 Прогнать `npm run lint` и `npm run test:ci`

## 6. Словарь и скриншоты

- [ ] 6.1 Обновить `CONTEXT.md`: имя **Флоу отправки** в коде - `submit flow`, запись про `auth flow` в `## Flagged ambiguities` переводится в решенную
- [ ] 6.2 Прогнать `npm run e2e` и убедиться, что сквозные сценарии входа, регистрации и создания чата проходят с новым правилом доступности кнопки
- [ ] 6.3 Прогнать `npm run e2e:visual`, пересмотреть разошедшиеся снимки глазами и обновить те, где расхождение объясняется недоступной кнопкой
- [ ] 6.4 Quality gates: `npm run lint`, `npm run test:ci`, `npm run e2e`, `npm run e2e:visual`
