## Why

Issue: #103

Обработка ошибок размазана копиями по двум слоям. `mapHttpError` свел к одной
функции только разбор ответа внешнего API; выше по стеку дублирование осталось:
12 одинаковых блоков `catchError` в шлюзах и 9 use-case-сервисов, которые
построчно повторяют свою пару сигналов `status`/`errorMessage`. Цена копий -
новый use case заводится копипастой, а расхождение в одной из копий никто не
замечает.

## What Changes

- В `@shared/errors` появляется RxJS-оператор `toApplicationError(fallback)`.
  12 блоков `catchError` -> `throwError` -> `mapHttpError` в
  `http-auth-gateway`, `http-user-gateway` и `http-chat-gateway` схлопываются в
  один оператор в конце каждого `pipe`.
- Появляется `@shared/flow` с двумя фабриками состояния: **Флоу отправки**
  (`createSubmitFlowState`) и **Флоу загрузки** (`createLoadFlowState`).
- `createAuthFlowState` и `AuthFlowStatus` из `identity-access/application`
  переезжают в `@shared/flow` под именем **Флоу отправки**; чем закрывается
  расхождение по словарю - имя `auth` было уже самой вещи.
- На **Флоу отправки** переходят 7 сервисов: `sign-in`, `sign-up`,
  `change-password`, `change-avatar`, `update-profile`, `create-chat`,
  `add-chat-user`. `CreateChatStatus` и `AddChatUserStatus` удаляются.
- На **Флоу загрузки** переходят `chat-list` и `chat-users`. `ChatListStatus` и
  `ChatUsersStatus` удаляются.
- Поведение экранов не меняется: набор состояний, тексты сообщений и порядок
  переходов сохраняются один в один. `CurrentSessionService` и `user-search`
  не затрагиваются - у первого свой доменный `CurrentSessionStatus`, у второго
  нет use-case-сервиса.

## Capabilities

### New Capabilities

Новых нет.

### Modified Capabilities

Требования не меняются: показ **Ошибки приложения** на каждом экране уже описан
в `identity-access`, `chats` и `core-http`, и change его не трогает. Change
объявляет `skip_specs: true`.

## Impact

- Слои: `shared` (новый `@shared/flow`, дополненный `@shared/errors`),
  `infrastructure` (три шлюза), `application` (9 use-case-сервисов
  `identity-access` и `chats`), `presentation` (компоненты и их спеки, которые
  сравнивают статус). `core` не затрагивается.
- В `presentation` меняются только имена перечислений: имена сигналов
  `status`, `errorMessage`, `isSubmitting`, `isLoading` и разметка остаются
  прежними.
- `CONTEXT.md` уже обновлен: **Флоу отправки** переименовано с `auth flow` на
  `submit flow`, заведен термин **Флоу загрузки**, расхождение по имени
  переведено в решенные.
- Разблокирует #112: тосты подключаются к одной паре сигналов, а не к 9 копиям.
