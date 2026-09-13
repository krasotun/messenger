## 1. Хелперы состояния контрола и текста нарушения

- [x] 1.1 Написать падающий спек `src/app/shared/forms/create-control-state.spec.ts`: сигнал отдает нарушения контрола, признак «трогали» и признак «показывать сообщение»; значения обновляются после смены значения, статуса и `markAsTouched()`; проверить, что обновление приходит без ручного вызова change detection
- [x] 1.2 Реализовать `src/app/shared/forms/create-control-state.ts` на потоке событий контрола по образцу `create-submit-availability.ts`; спек 1.1 зеленый
- [x] 1.3 Написать падающий спек `src/app/shared/forms/resolve-control-error.spec.ts`: обязательность, слишком короткое, слишком длинное, неверный формат, несовпадение с парным полем, нарушение неизвестного вида - каждый со своим английским текстом, нет нарушений - текста нет
- [x] 1.4 Реализовать `src/app/shared/forms/resolve-control-error.ts`, английские тексты - в `src/app/shared/forms/control-error-messages.constants.ts`, как `error-messages.constants.ts` в доменах; спек 1.3 зеленый
- [x] 1.5 Экспортировать оба хелпера из `src/app/shared/forms/index.ts` и проверить, что импорт по `@shared/forms` собирается (`npm run build`)
- [x] 1.6 Quality gates секции: `npm run lint`, `npm run test:ci`

## 2. Поле ввода узнает свое состояние само

- [x] 2.1 Написать падающий спек в `src/app/shared/ui/input/input.spec.ts`: поле с невалидным контролом, по которому побывал фокус, объявляется как содержащее неверное значение; после исправления признак снимается; поле без контрола признак не получает
- [x] 2.2 Реализовать в `src/app/shared/ui/input/input.ts` инжект `NgControl` и вычисление признака через состояние контрола из 1.2; удалить входы `invalid` и `disabled`; спек 2.1 зеленый
- [x] 2.3 Убрать `[invalid]` из шаблонов `sign-in-form.html`, `sign-up-form.html`, `update-profile-form.html`, `change-password-form.html`, `create-chat-form.html`, `add-chat-user-panel.html`; спеки этих компонентов остаются зелеными
- [x] 2.4 Quality gates секции: `npm run lint`, `npm run test:ci`

## 3. Примитив поля получает контрол

- [ ] 3.1 Написать падающий спек `src/app/shared/ui/form-field/form-field.spec.ts`: текст сообщения по виду нарушения приходит из резолвера; сообщения нет, пока по полю не побывал фокус; сообщение исчезает после исправления; щелчок по подписи переводит фокус в поле; поле объявляется своей подписью
- [ ] 3.2 Реализовать в `src/app/shared/ui/form-field/form-field.ts` и `.html` вход с контролом вместо `htmlFor` и `error`, подпись оборачивает проекцию поля; спек 3.1 зеленый
- [ ] 3.3 Перевести на новый вход пять шаблонов форм: убрать `htmlFor`, `error`, `id` у полей, передать контрол
- [ ] 3.4 Удалить из `sign-in-form.ts`, `sign-up-form.ts`, `update-profile-form.ts`, `change-password-form.ts`, `create-chat-form.ts` методы `getControlError`, `hasControlError` и `_getErrorMessage`; спеки этих компонентов переписать на проверку видимого сообщения, а не вызова метода
- [ ] 3.5 Quality gates секции: `npm run lint`, `npm run test:ci`

## 4. Совпадение нового пароля и повтора

- [ ] 4.1 Написать падающий спек в `src/app/domains/identity-access/presentation/change-password-form/change-password-form.spec.ts`: сообщение о несовпадении показано под полем повтора; исчезает при правке повтора; исчезает при правке нового пароля; кнопка отправки при несовпадении недоступна
- [ ] 4.2 Перенести правило совпадения с группы на контрол повтора в `change-password-form.ts` и перепроверять повтор при смене нового пароля; спек 4.1 зеленый
- [ ] 4.3 Quality gates секции: `npm run lint`, `npm run test:ci`

## 5. Примитив формы

- [ ] 5.1 Написать падающий спек `src/app/shared/ui/form/form.spec.ts` на тестовом host-компоненте: отправка валидной формы доходит до вызывающего; отправка невалидной не доходит; кнопка недоступна при невалидной форме и во время отправки; поля недоступны во время отправки; при требовании изменений кнопка недоступна до правки значения
- [ ] 5.2 Создать `src/app/shared/ui/form/form.ts`, `form.html`, `form.scss`: тег формы, раскладка полей и действий, кнопка отправки, отказ начать отправку невалидной формы, вход требования изменений; внутрь переезжает `create-submit-availability`; спек 5.1 зеленый
- [ ] 5.3 Написать падающий спек `src/app/shared/forms/connect-submit-flow.spec.ts`: поля блокируются на время отправки и разблокируются любым исходом, событие успеха доходит до вызывающего однократно
- [ ] 5.4 Реализовать `src/app/shared/forms/connect-submit-flow.ts` поверх `lock-form-while-submitting.ts`, экспортировать из `index.ts`; спек 5.3 зеленый
- [ ] 5.5 Quality gates секции: `npm run lint`, `npm run test:ci`

## 6. Пять форм на примитивах

- [ ] 6.1 Перевести `sign-in-form`, `sign-up-form`, `update-profile-form`, `change-password-form`, `create-chat-form` на примитив формы: поля уходят в проекцию под контейнер с привязкой группы, конструктор сводится к подключению флоу отправки, `onSubmit` теряет отказ от отправки; спеки компонентов зеленые
- [ ] 6.2 Удалить `sign-in-form.scss`, `sign-up-form.scss`, `update-profile-form.scss`, `change-password-form.scss`, `create-chat-form.scss` и ссылки на них; проверить, что раскладка форм не изменилась визуально
- [ ] 6.3 Проверить, что в пяти компонентах не осталось русских строк и обращений к `ValidationErrors` (`grep`), а `update-profile-form` сохранил предзаполнение и требование изменений
- [ ] 6.4 Quality gates секции: `npm run lint`, `npm run test:ci`

## 7. Сквозная проверка и снимки

- [ ] 7.1 Прогнать `npm run e2e` и починить сценарии, которые искали поля по `id` или по русским сообщениям
- [ ] 7.2 Прогнать `npm run e2e:visual`, пересмотреть разошедшиеся снимки глазами и обновить их осознанно, по одному экрану
- [ ] 7.3 Финальные quality gates: `npm run lint`, `npm run test:ci`, `npm run e2e`, `npm run e2e:visual`
