## Why

Пользователь не может изменить свои данные: реализованы только регистрация,
вход и сессия. Контракт редактирования профиля был проработан ранее и лежал в
`src/app/domains/identity-access/application/update-profile/update-profile.application.md`
рядом с кодом, хотя реализации нет. Переносим его в change: это предложение, а
не документация существующего поведения.

Зависит от change `shared-ui-modal`: форма редактирования открывается в модалке.

## What Changes

- Добавляется use case обновления профиля текущего пользователя.
- Добавляется форма редактирования профиля, предзаполненная данными текущего
  пользователя, и открывающая ее точка входа в интерфейсе.
- Добавляется user API boundary: `PUT /user/profile` с cookie-сессией.
- Текущая сессия обновляется данными из ответа бэкенда.

Редактируемые поля: `firstName`, `secondName`, `displayName`, `login`, `email`,
`phone`. Не редактируются в этом flow: `id` и `avatar`.

## Capabilities

### New Capabilities

Нет: поведение относится к уже существующей capability.

### Modified Capabilities

- `identity-access`: добавляется требование к редактированию профиля текущего
  пользователя и к обновлению состояния сессии после успешного сохранения.

## Impact

- Слои: `application` (use case и состояние flow), `infrastructure` (user API,
  DTO, мапперы), `presentation` (форма и точка входа). `domain` затрагивается
  только правилами валидации полей. `core` не затрагивается: навигации нет.
- Зависимость: примитив модалки из change `shared-ui-modal`.
- Границы: application-слой не должен знать про `ModalRef`, overlay и формы -
  связку держит presentation.
- Контракт API уже описан в
  `src/app/domains/identity-access/infrastructure/user-api.contract.md`.
