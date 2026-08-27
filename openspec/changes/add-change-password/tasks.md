## 1. Инфраструктура user API

- [x] 1.1 Написать падающий spec на маппер запроса в
      `src/app/domains/identity-access/infrastructure/change-password/change-password-request.mapper.spec.ts`:
      входная модель переводится в тело с полями `oldPassword` и `newPassword`
      в camelCase, повтор пароля в тело не попадает
- [x] 1.2 Написать падающий spec в
      `src/app/domains/identity-access/infrastructure/user.api.spec.ts`:
      `changePassword` идет `PUT` на относительный `/user/password` с
      `responseType: 'text'`, ответ `OK` считается успехом; базовый URL и
      `withCredentials` проставляет `apiRequestInterceptor`, в методе их нет
- [x] 1.3 Написать падающий spec в
      `src/app/domains/identity-access/infrastructure/http-user-gateway.spec.ts`:
      успех отдает `ChangePasswordResult` с `passwordChanged: true`, ошибка приводится
      к `ApplicationError` с текстом из `reason`, а без `reason` - к
      generic-сообщению
- [x] 1.4 Реализовать `change-password/change-password.dto.ts`,
      `change-password/change-password-request.mapper.ts`, метод
      `UserApi.changePassword` и `HttpUserGateway.changePassword`;
      объявить `changePassword` в
      `src/app/domains/identity-access/application/user.gateway.ts`,
      `application/change-password/change-password.input.ts` и
      `application/change-password/change-password.result.ts`; проверить
      прогоном `npm run test:ci`
- [x] 1.5 Дописать `PUT /user/password` в
      `src/app/domains/identity-access/infrastructure/user-api.contract.md`:
      относительный адрес, camelCase тела как аномалия относительно
      `/user/profile`, неописанное тело ответа и пробелы Swagger; строку про
      credentials не добавлять - политика в контракте уже общая для всего API
- [x] 1.6 Прогнать `npm run lint` и `npm run test:ci`

## 2. Use case смены пароля

- [x] 2.1 Написать падающий spec
      `src/app/domains/identity-access/application/change-password/change-password.service.spec.ts`:
      начальное состояние флоу - `Idle` без сообщения об ошибке
- [x] 2.2 Spec: `changePassword` вызывает `USER_GATEWAY.changePassword` с
      переданными значениями и переводит флоу в `Submitting`
- [x] 2.3 Spec: при успехе флоу переходит в `Success`, текущая сессия и
      текущий пользователь не меняются, навигация не вызывается
- [x] 2.4 Spec: при ошибке флоу переходит в `Error` с сообщением из
      `ApplicationError`, текущая сессия не меняется
- [x] 2.5 Spec: `reset` возвращает флоу в `Idle` и очищает сообщение об ошибке
- [x] 2.6 Реализовать `change-password.service.ts` на `createAuthFlowState`;
      проверить прогоном `npm run test:ci`
- [x] 2.7 Прогнать `npm run lint` и `npm run test:ci`

## 3. Форма смены пароля

- [x] 3.1 Написать падающий component spec
      `src/app/domains/identity-access/presentation/change-password-form/change-password-form.spec.ts`:
      форма открывается с тремя пустыми полями
- [x] 3.2 Spec: отправка формы с пустыми полями не вызывает use case и
      показывает ошибки полей
- [x] 3.3 Spec: повтор, отличающийся от нового пароля, не вызывает use case и
      показывает ошибку поля повтора
- [x] 3.4 Spec: валидная отправка вызывает use case со старым и новым паролем,
      повтор в вызов не попадает
- [x] 3.5 Spec: во время отправки поля и кнопка заблокированы
- [x] 3.6 Spec: при ошибке показывается сообщение из use case, а введенные
      значения остаются в форме
- [x] 3.7 Spec: при успехе форма сообщает об этом наружу через `output`
- [x] 3.8 Реализовать `change-password-form.ts`, `.html`, `.scss` с
      кросс-валидатором повтора на уровне `FormGroup`; проверить прогоном
      `npm run test:ci`
- [x] 3.9 Прогнать `npm run lint` и `npm run test:ci`

## 4. Точка входа и модалка

- [ ] 4.1 Написать падающий component spec
      `src/app/domains/identity-access/presentation/change-password-modal-content/change-password-modal-content.spec.ts`:
      успех формы закрывает модалку через `ModalRef`
- [ ] 4.2 Написать падающий component spec в
      `src/app/domains/identity-access/presentation/current-user-avatar-menu/current-user-avatar-menu.spec.ts`:
      пункт «Change password» закрывает меню и открывает модалку смены пароля
- [ ] 4.3 Spec: закрытие формы без отправки не меняет текущую сессию и
      сбрасывает флоу, повторное открытие показывает пустую форму без ошибки
- [ ] 4.4 Реализовать `change-password-modal-content.ts` и `.html`, добавить
      пункт меню в `current-user-avatar-menu.ts` и `.html`
- [ ] 4.5 Проверить, что `application` не импортирует `ModalRef`, overlay и
      Angular-формы: прогон `npm run lint` с правилами границ слоев
- [ ] 4.6 Прогнать `npm run lint` и `npm run test:ci`

## 5. Мок-бэкенд и сквозной сценарий

- [ ] 5.1 Добавить `PUT /user/password` в `mock-auth-backend/src/server.ts`:
      `401` без сессии, `400` с `reason` на неверный старый пароль, иначе
      `200` и новый пароль в хранилище; проверить `curl` по поднятому моку
- [ ] 5.2 E2E `e2e/profile/change-password.spec.ts`: пользователь меняет
      пароль, модалка закрывается, он остается в приложении и входит заново с
      новым паролем
- [ ] 5.3 E2E: неверный старый пароль оставляет модалку открытой с сообщением
      об ошибке
- [ ] 5.4 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e`

## 6. Quality gates

- [ ] 6.1 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e` целиком
- [ ] 6.2 Прогнать `npx openspec validate --changes --strict`
