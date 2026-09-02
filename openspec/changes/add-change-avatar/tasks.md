## 1. Резолв URL аватара

- [x] 1.1 Написать падающий spec на чистую функцию в
      `src/app/domains/identity-access/infrastructure/current-session/resolve-avatar-url.spec.ts`:
      `resolveAvatarUrl(path, baseUrl)` возвращает `${baseUrl}${path}` для
      непустого пути и `null` для `null`
- [x] 1.2 Реализовать `resolve-avatar-url.ts`
- [x] 1.3 Добавить токен `RESOURCES_BASE_URL` в `src/app/core/tokens.ts` (или
      рядом с `API_BASE_URL`) и значение
      `https://ya-praktikum.tech/resources` в `src/environments/environment.ts`
      и `environment.prod.ts`; подключить провайдер в `app.config.ts`
- [x] 1.4 Обновить `currentUserMapper` и его spec
      (`current-user.mapper.spec.ts`): маппер принимает базовый URL ресурсов
      параметром и прогоняет `avatar` через `resolveAvatarUrl`
- [x] 1.5 Обновить вызывающие `currentUserMapper` места
      (`http-auth-gateway.ts`, `http-user-gateway.ts`) - передать
      инжектированный `RESOURCES_BASE_URL`; обновить их specs
- [x] 1.6 Прогнать `npm run lint` и `npm run test:ci`

## 2. Инфраструктура user API

- [ ] 2.1 Написать падающий spec на маппер запроса в
      `src/app/domains/identity-access/infrastructure/change-avatar/change-avatar-request.mapper.spec.ts`:
      `{ file }` превращается в `FormData` с единственным полем `avatar`,
      содержащим переданный файл
- [ ] 2.2 Написать падающий spec в
      `src/app/domains/identity-access/infrastructure/user.api.spec.ts`:
      `changeAvatar` идет `PUT` на относительный `/user/profile/avatar` с
      телом `FormData`, без явного `Content-Type`; базовый URL и
      `withCredentials` проставляет `apiRequestInterceptor`, в методе их нет
- [ ] 2.3 Написать падающий spec в `http-user-gateway.spec.ts`:
      успех отдает `ChangeAvatarResult` с обновленным `CurrentUser` (аватар
      резолвится через `resolveAvatarUrl`, как у `updateProfile`), ошибка
      приводится к `ApplicationError` с текстом из `reason`, а без `reason` -
      к generic-сообщению
- [ ] 2.4 Реализовать `change-avatar/change-avatar.dto.ts` (при
      необходимости - тело ответа переиспользует `CurrentUserDTO`),
      `change-avatar/change-avatar-request.mapper.ts`, метод
      `UserApi.changeAvatar` и `HttpUserGateway.changeAvatar`; объявить
      `changeAvatar` в `application/user.gateway.ts`,
      `application/change-avatar/change-avatar.input.ts` и
      `application/change-avatar/change-avatar.result.ts`; проверить прогоном
      `npm run test:ci`
- [ ] 2.5 Дописать `PUT /user/profile/avatar` в
      `infrastructure/user-api.contract.md`: относительный адрес,
      `multipart/form-data` как аномалия относительно JSON-эндпоинтов
      `/user/*`, допустимые форматы файла, недокументированный лимит размера
- [ ] 2.6 Прогнать `npm run lint` и `npm run test:ci`

## 3. Use case смены аватара

- [ ] 3.1 Написать падающий spec
      `src/app/domains/identity-access/application/change-avatar/change-avatar.service.spec.ts`:
      начальное состояние флоу - `Idle` без сообщения об ошибке
- [ ] 3.2 Spec: `changeAvatar` вызывает `USER_GATEWAY.changeAvatar` с
      переданным файлом и переводит флоу в `Submitting`
- [ ] 3.3 Spec: при успехе флоу переходит в `Success`, текущая сессия
      обновляется новым `CurrentUser` из результата, навигация не вызывается
- [ ] 3.4 Spec: при ошибке флоу переходит в `Error` с сообщением из
      `ApplicationError`, текущая сессия не меняется
- [ ] 3.5 Spec: `reset` возвращает флоу в `Idle` и очищает сообщение об ошибке
- [ ] 3.6 Реализовать `change-avatar.service.ts` на `createAuthFlowState`;
      проверить прогоном `npm run test:ci`
- [ ] 3.7 Прогнать `npm run lint` и `npm run test:ci`

## 4. Форма смены аватара

- [ ] 4.1 Написать падающий component spec
      `src/app/domains/identity-access/presentation/change-avatar-form/change-avatar-form.spec.ts`:
      форма открывается без выбранного файла и без превью
- [ ] 4.2 Spec: выбор файла допустимого формата (JPEG, JPG, PNG, GIF, WebP)
      показывает превью через `URL.createObjectURL`, кнопка отправки
      становится активной
- [ ] 4.3 Spec: выбор файла недопустимого формата не создает превью,
      показывает сообщение об ошибке формата и не вызывает use case при
      отправке
- [ ] 4.4 Spec: отправка без выбранного файла не вызывает use case и
      показывает сообщение о необходимости выбрать файл
- [ ] 4.5 Spec: валидная отправка вызывает use case с выбранным файлом
- [ ] 4.6 Spec: во время отправки поле выбора файла и кнопка заблокированы
- [ ] 4.7 Spec: при ошибке показывается сообщение из use case, выбранный файл
      и превью остаются
- [ ] 4.8 Spec: при успехе форма сбрасывается к состоянию без выбранного
      файла и без превью, наружу ничего не эмитит - модалку закрывать не
      нужно
- [ ] 4.9 Spec: при смене выбранного файла и при уничтожении компонента
      предыдущий/текущий `Object URL` освобождается (`URL.revokeObjectURL`)
- [ ] 4.10 Реализовать `change-avatar-form.ts`, `.html`, `.scss`; проверить
      прогоном `npm run test:ci`
- [ ] 4.11 Прогнать `npm run lint` и `npm run test:ci`

## 5. Встраивание в модалку профиля

- [ ] 5.1 Обновить `update-profile-modal-content.html`: добавить
      `<app-change-avatar-form>` над `<app-update-profile-form>`
- [ ] 5.2 Добавить `ChangeAvatarService` в `providers` компонента
      `update-profile-modal-content.ts`, рядом с `UpdateProfileService`
- [ ] 5.3 Написать падающий component spec в
      `update-profile-modal-content.spec.ts`: обе формы отображаются
      одновременно; отправка формы смены аватара не вызывает
      `UpdateProfileService` и не закрывает модалку, отправка формы
      редактирования профиля не вызывает `ChangeAvatarService`
- [ ] 5.4 Spec: закрытие модалки без отправки формы смены аватара не меняет
      текущую сессию; повторное открытие редактирования профиля показывает
      форму смены аватара без выбранного файла и без ошибки
- [ ] 5.5 Проверить, что `application` не импортирует `ModalRef`, overlay,
      Angular-формы и `File`/`FormData`-специфику транспорта: прогон
      `npm run lint` с правилами границ слоев
- [ ] 5.6 Прогнать `npm run lint` и `npm run test:ci`

## 6. Мок-бэкенд и сквозной сценарий

- [ ] 6.1 Добавить `PUT /user/profile/avatar` в `mock-auth-backend/src/server.ts`:
      `401` без сессии, `400` с `reason` на неподдерживаемый формат файла,
      иначе `200` и обновленный `avatar` (путь) в хранилище и в ответе;
      проверить `curl -F avatar=@file.png` по поднятому моку
- [ ] 6.2 E2E `e2e/profile/change-avatar.spec.ts`: пользователь открывает
      редактирование профиля, выбирает файл, меняет аватар - форма смены
      аватара сбрасывается, модалка остается открытой, новый аватар виден в
      шапке без перезагрузки страницы
- [ ] 6.3 E2E: неподдерживаемый формат файла не отправляет запрос и
      показывает сообщение об ошибке формата
- [ ] 6.4 E2E: бэкенд отклоняет смену - форма смены аватара остается открытой
      с выбранным файлом и сообщением об ошибке, форма редактирования профиля
      не затрагивается
- [ ] 6.5 Обновить существующий снимок
      `e2e/profile/update-profile.screenshot.spec.ts-snapshots/profile-modal-*`:
      верстка модалки меняется (добавился блок смены аватара), разошедшийся
      снимок пересмотреть глазами и обновить, не переснимать вслепую
- [ ] 6.6 Прогнать `npm run lint`, `npm run test:ci`, `npm run e2e` и
      `npm run e2e:visual`

## 7. Quality gates

- [ ] 7.1 Прогнать `npm run lint`, `npm run test:ci`, `npm run e2e` и
      `npm run e2e:visual` целиком
- [ ] 7.2 Прогнать `npx openspec validate --changes --strict`
