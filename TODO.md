# TODO

## Активная задача

```text
[Identity] Add current user avatar menu
```

## Текущий шаг

`shared/ui/avatar` v1 закрыт.

Ближайший TDD-шаг:

1. Сформулировать component specs для identity-specific avatar menu.
2. Зафиксировать header integration spec: справа в authenticated header отображается user control.
3. Реализовать минимальный avatar menu через `shared/ui/popover`.
4. Подключить menu к current session state через application boundary.

## Что делаем

- В authenticated header справа отображается avatar control текущего пользователя.
- По клику avatar control открывает menu через `shared/ui/popover`.
- Menu показывает только authorization/account actions текущего scope.
- Header остается layout-компонентом без identity business logic, API calls и browser storage access.
- Identity-specific menu component находится в `src/app/domains/identity-access/presentation`.
- Avatar UI primitive находится в `src/app/shared/ui/avatar`.

## Acceptance Criteria

- Header показывает user control справа на основе current session state.
- User control использует `shared/ui/avatar` для отображения avatar/fallback.
- User control открывает avatar menu через `shared/ui/popover`.
- Avatar menu не запускает profile editing flow.
- Avatar menu не добавляет chats/messages/non-auth flows.
- Поведение фиксируется component/unit specs до production-реализации.

## Завершено

### `shared/ui/avatar` v1

- Reusable primitive находится в `src/app/shared/ui/avatar`.
- Поддерживает `imageUrl`, `label`, `size: sm | md | lg`, `fallbackText`.
- Отображает image/fallback/error fallback.
- Передает accessible label через `alt` или `aria-label`.
- Размер задается predefined BEM modifier class.
- Покрыт component specs.

## Avatar Menu

Acceptance:

- Menu открывается из avatar control в правой части authenticated header.
- Menu получает данные текущего пользователя через application/session boundary.
- Menu отображает только account/authorization actions текущего scope.
- Logout action остается authorization action, без profile editing side effects.
- Header делегирует identity-specific поведение presentation-компоненту домена.

Component/unit specs:

- Renders current user avatar from current session data.
- Opens menu by avatar trigger click via `shared/ui/popover`.
- Shows only authorization/account actions allowed in current scope.
- Does not render profile editing actions yet.
- Emits/calls logout action through identity application boundary.
- Header renders identity user control on the right without direct identity business logic.

## Product Scope

Текущий scope:

- sign up;
- sign in;
- current session;
- session restore;
- logout;
- current user avatar menu.

Out of scope без отдельной задачи:

- profile editing flow;
- chats;
- messages;
- broader settings UI;
- non-auth application flows.
