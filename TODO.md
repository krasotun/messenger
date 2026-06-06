# TODO

## Активная задача

```text
[Identity] Add current user avatar menu
```

## Текущий шаг

Продолжить issue `[Identity] Add current user avatar menu`.

Ближайший TDD-шаг:

- Сформулировать acceptance и component specs для `shared/ui/avatar` перед реализацией.
- Выделить reusable UI primitive `shared/ui/avatar` для отображения круглого avatar/fallback.
- Затем сформулировать acceptance для `[Identity] Add current user avatar menu`.
- Определить component/unit specs для avatar menu и его интеграции с header.
- Не переходить к profile editing flow, пока avatar menu не закрыт.

## Текущий статус

- Authorization-only MVP готов:
  sign up, sign in, current session, session restore, logout.
- `[Shell] Add authenticated layout with header` закрыта как routing/layout-фича.
- Authenticated shell с header уже есть.
- Header остается shell/layout-компонентом без identity business logic, API calls и browser storage access.
- Reusable `shared/ui/popover` v1 готов и покрыт тестами:
  open by trigger click, close by second trigger click, `Escape`, outside click.
- Reusable `shared/ui/popover` singleton-контракт готов и покрыт тестами:
  одновременно открыт только один popover через internal `PopoverCoordinator`.
- Следующий UI primitive для avatar menu:
  `shared/ui/avatar`.

## Acceptance Criteria текущей задачи

- Header показывает control текущего пользователя на основе current session state.
- User control открывает avatar menu через `shared/ui/popover`.
- Avatar menu отображает только authorization/account actions, разрешенные текущим scope.
- Avatar menu не запускает profile editing flow.
- Header не содержит profile editing business logic, API calls или browser storage access.
- Identity-specific menu component находится в `domains/identity-access/presentation`.
- Для отображения аватара используется отдельный reusable `shared/ui/avatar` или минимальный placeholder, если avatar component еще не выделен текущим TDD-шагом.
- Поведение фиксируется component/unit specs до production-реализации.

## Acceptance Criteria для `shared/ui/avatar` v1

- Avatar отображает круглую область фиксированного размера.
- Если передан `imageUrl`, отображается изображение пользователя.
- Если `imageUrl` не передан, отображается fallback.
- Если изображение не загрузилось, компонент переключается на fallback.
- Fallback не содержит identity/application logic.
- Компонент принимает доступное имя для image/fallback.
- Компонент поддерживает только предопределенные product sizes: `sm`, `md`, `lg`.
- `custom` size не добавляется в v1; расширение размера делается только под подтвержденный сценарий.
- Компонент находится в `src/app/shared/ui/avatar`.

## Component Specs для `shared/ui/avatar`

- Renders image when `imageUrl` is provided.
- Renders fallback when `imageUrl` is empty.
- Renders fallback after image loading error.
- Applies selected predefined size.
- Uses provided accessible label for image/fallback.

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
