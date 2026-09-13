## 1. Тексты chats

- [x] 1.1 Перевести ожидания в `src/app/domains/chats/presentation/add-chat-user-panel/add-chat-user-panel.spec.ts` на `Start typing a login` и `No users found` и убедиться, что спека красная: строки в компоненте еще русские
- [x] 1.2 Перевести константы `notStartedHint` и `nobodyFoundHint` в `add-chat-user-panel.ts` и `aria-label` в `add-chat-user-panel.html` на `Search users`; проверка - спека из 1.1 зеленая
- [x] 1.3 Перевести названия `describe` в `add-chat-user-panel.spec.ts` и `src/app/domains/chats/application/user-search/user-search.state.spec.ts` на английский; проверка - `npm run test:ci` зеленый, русских заголовков в выводе нет
- [x] 1.4 Перевести обращение по доступному имени в `e2e/chats/add-chat-user.spec.ts` на `Search users`; проверка - `npm run e2e` зеленый
- [x] 1.5 Quality gates блока: `npm run lint`, `npm run test:ci`, `npm run e2e`

## 2. Тексты identity-access

- [x] 2.1 Перевести ожидания в `change-avatar-form.spec.ts` и `update-profile-modal-content.spec.ts` на `Select a file`, `No file selected`, `Allowed formats: JPEG, JPG, PNG, GIF, WebP` и убедиться, что спеки красные
- [x] 2.2 Перевести `formatErrorMessage`, `missingFileErrorMessage` и подпись отсутствующего файла в `change-avatar-form.ts`, текст ошибки отправки в `change-avatar-form.html` на `Avatar change failed:`; проверка - спеки из 2.1 зеленые
- [x] 2.3 Перевести ожидания в `e2e/profile/change-avatar.spec.ts` на `No file selected` и `Allowed formats`; проверка - `npm run e2e` зеленый
- [x] 2.4 Обновить эталон `e2e/profile/update-profile.screenshot.spec.ts-snapshots/profile-modal-chromium-darwin.png`: форма смены аватара в модалке теперь английская; линуксовый эталон взять из артефакта прогона `visual`; проверка - `npm run e2e:visual` зеленый
- [x] 2.5 Quality gates блока: `npm run lint`, `npm run test:ci`, `npm run e2e`, `npm run e2e:visual`

## 3. Доступное имя модального окна

- [ ] 3.1 Перевести ожидание доступного имени кнопки закрытия в `src/app/shared/ui/modal/modal-shell/modal-shell.spec.ts` на `Close` и убедиться, что спека красная
- [ ] 3.2 Перевести `aria-label` в `modal-shell.html`; проверка - спека из 3.1 зеленая, обращения по имени `Закрыть` в `src` и `e2e` не осталось (`grep -rn 'Закрыть' src e2e` пуст)
- [ ] 3.3 Quality gates блока: `npm run lint`, `npm run test:ci`, `npm run e2e`

## 4. Страж языка в линтере

- [ ] 4.1 Добавить в `eslint.config.js` блок `no-restricted-syntax` для `**/*.ts`: `Literal` и `TemplateElement` с кириллицей в значении; проверка - временная русская строка в компоненте роняет `npm run lint`, комментарий рядом - нет
- [ ] 4.2 Добавить в блок `files: ['**/*.html']` правило `no-restricted-syntax` с селекторами `Text`, `BoundText`, `TextAttribute`; проверка - временный русский текст и русский `aria-label` в шаблоне роняют `npm run lint`
- [ ] 4.3 Убрать временные строки и убедиться, что `npm run lint` зеленый на всем репозитории: переведенный код правилу не противоречит, русские комментарии не подсвечиваются
- [ ] 4.4 Quality gates блока: `npm run lint`, `npm run test:ci`

## 5. Завершение change

- [ ] 5.1 `npx openspec validate translate-ui-to-english --strict` зеленый
- [ ] 5.2 Полный прогон: `npm run lint`, `npm run test:ci`, `npm run e2e`, `npm run e2e:visual`
- [ ] 5.3 `grep -rnP '[А-Яа-яЁё]' src e2e` не показывает ничего, кроме комментариев и `*.contract.md`
