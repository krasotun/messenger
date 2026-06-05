# TODO

## Активная задача

```text
[Identity] User Profile Editing
```

## Текущий шаг

Продолжить issue `[Identity] Add current user avatar menu`.

Ближайший TDD-шаг:

- Сформулировать acceptance для `[Identity] Add current user avatar menu` перед реализацией.
- Определить component/unit specs для avatar menu и его интеграции с header.
- Не переходить к profile editing flow, пока avatar menu не закрыт.

## Текущий статус

- Authorization-only MVP готов:
  sign up, sign in, current session, session restore, logout.
- Authenticated shell с header уже есть.
- Header остается shell/layout-компонентом без identity business logic, API calls и browser storage access.
- Reusable `shared/ui/popover` v1 готов и покрыт тестами:
  open by trigger click, close by second trigger click, `Escape`, outside click.
- Следующий UI primitive для avatar menu:
  `shared/ui/avatar`, если он нужен для текущего TDD-сценария.

## Acceptance Criteria текущей задачи

- Header показывает control текущего пользователя на основе current session state.
- User control открывает avatar menu через `shared/ui/popover`.
- Avatar menu отображает только authorization/account actions, разрешенные текущим scope.
- Avatar menu не запускает profile editing flow.
- Header не содержит profile editing business logic, API calls или browser storage access.
- Identity-specific menu component находится в `domains/identity-access/presentation`.
- Для отображения аватара используется отдельный reusable `shared/ui/avatar` или минимальный placeholder, если avatar component еще не выделен текущим TDD-шагом.
- Поведение фиксируется component/unit specs до production-реализации.

## Следующие задачи

1. `[Identity] Add current user avatar menu`.
2. `[Identity] Define profile editing contract`.
3. `[Identity] Add profile editing flow`.
4. `[Deploy] Upgrade CD to release directories with current symlink`.
5. Ansible рассмотреть позже, если появится отдельная infra-задача.
6. Docker рассмотреть позже только при появлении backend/API/DB или отдельной учебной цели по production container deployment.

## Product Scope

Текущий продуктовый фокус: authorization/account profile editing.

Разрешенные сценарии текущего scope:

- sign up;
- sign in;
- current session;
- future session restore;
- logout;
- current user avatar menu;
- future profile editing.

Out of scope без прямого запроса:

- chats;
- messages;
- broader settings UI beyond profile editing;
- новые non-auth application flows.
