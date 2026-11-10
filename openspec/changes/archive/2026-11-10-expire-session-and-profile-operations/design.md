## Context

Мотив - в `proposal.md`. Текущее состояние, от которого отталкиваемся:

- Профиль, аватар и пароль открываются из `CurrentUserAvatarMenu` через
  `ModalService`: `UpdateProfileModalContent` держит `UpdateProfileForm` и
  `ChangeAvatarForm`, `ChangePasswordModalContent` - `ChangePasswordForm`. На
  успехе модалка закрывается.
- `UpdateProfileForm` берет исходные значения из
  `UpdateProfileService.initialValues`, то есть из **Текущего пользователя**,
  один раз в конструкторе.
- С #275 состояние держит Стор, а флоу формы она создает сама и передает в
  метод Стора аргументом (ADR `2026-10-28-page-part-stores-and-folder-boundaries.md`).
  Блоки 1-2 уже перенесли в `CurrentSessionStore` `refreshCurrentUser()`,
  `changePassword` и `changeAvatar`; `UpdateProfileService` - последний
  сервис на сценарий в `users`.
- Блок 0 уже добавил **Истечение сессии**: `sessionExpiryInterceptor` и
  `SessionExpiryService`.
- `ModalService` создает overlay без `disposeOnNavigation`, и никто модалку на
  переходе не закрывает: после перехода на `/sign-in` форма профиля осталась
  бы поверх страницы входа.

## Goals / Non-Goals

**Goals:**

- **Истечение сессии** распознается в одном месте, без списка URL.
- Форма профиля получает исходные значения входом и не читает сессию сама.
- Все операции **Текущего пользователя** - методы `CurrentSessionStore`.

**Non-Goals:**

- Новый интерфейс: страница **Настроек**, стражи ухода, флажок
  `Show first and last name`, зависимые поля пароля, строка аватара,
  индикатор навигации. Все это - в отдельном issue, разбор этого change
  (канвас https://claude.ai/artifact/SoubckrW8uk6zcSJFKNovA, решения в
  истории git этого файла) - для него исходный материал.
- Поведение форм после успеха: модалка по-прежнему закрывается.

## Поток

```
Человек выбирает Edit profile в меню аватара
│
├─ меню закрывается сразу                                        [3]
├─ CurrentSessionStore.refreshCurrentUser()                     [1, 2]
│    → AUTH_GATEWAY.currentSession() → GET /auth/user
│    пока ответа нет - модалки нет
│
├─ ответ
│    Authenticated → состояние Стора (шапка тоже свежая)         [1, 2]
│                  → ModalService.open(UpdateProfileModalContent,
│                      { inputs: { currentUser } })              [3]
│                  → profile во вход UpdateProfileForm           [3]
│    401 → sessionExpiryInterceptor (распознает)                 [0]
│            → SessionExpiryService.handle(): сессия Anonymous,
│              Уведомление, /sign-in
│          шлюз → Anonymous → поток пуст, без Уведомления        [1]
│    ошибка → Уведомление, поток пуст, модалки нет               [1]
│
└─ форма открыта, сохранение получает 401
     → SessionExpiryService.handle() → /sign-in                  [0]
     → NavigationEnd → ModalService закрывает модалку            [4]
```

Change password идет без запроса: модалка открывается сразу.

## Decisions

### 1. Истечение сессии - перехватчик распознает, сервис реагирует

`sessionExpiryInterceptor` (`core/http`) стоит в конце `withInterceptors`
(`app.config.ts`) и только распознает **Истечение сессии**: на
`HttpErrorResponse` со статусом `401` при
`CurrentSessionStore.status() === Authenticated` он зовет
`SessionExpiryService.handle()`. Ошибка идет дальше вызывающему без изменений.

Реакция - в `SessionExpiryService` (`core/session`, `providedIn: 'root'`):
`CurrentSessionStore.expireCurrentSession()` (сессия в `Anonymous`, без
запроса), `NOTIFIER.error('Session expired', 'Please sign in again.')` и
`Router.navigateByUrl('/sign-in')`. Отдельно от перехватчика - потому что ее
же позовет лента на WebSocket, где `HttpClient` не участвует; так же разделяет
пример `authRedirectInterceptor` в документации Angular
(https://angular.dev/guide/http/interceptors). В `core`, а не в домене:
сервисам `application` роутер не нужен ни одному, а `core` уже связывает
домен с роутером.

Проверка статуса отсекает сразу три случая без списка URL: `401` при **Входе**
и **Регистрации** (статус `Anonymous`), при **Восстановлении сессии** на
старте (`Loading`) и повторные `401` параллельных запросов - первый уже
перевел статус в `Anonymous`.

**Уведомление** и переход - в `SessionExpiryService`, а не в Сторе: Стор
остается тихим состоянием. `expireCurrentSession()` отдельно от `logout()`:
тот шлет запрос к бэкенду.

Альтернативы: перехватчик сам сбрасывает, уведомляет и уводит - отклонено,
сцепляет распознавание с реакцией; обработка в каждом шлюзе - повтор в каждом;
перехватчик гасит ошибку в `EMPTY`, чтобы **Уведомление** было одно, -
отклонено в разборе, сценарии получают ошибку как обычно.

ADR не пишем: перехватчик легко убрать - условие «тяжело откатить» не
выполнено.

### 2. Операции Текущего пользователя - методы Стора

`updateProfile`, `changeAvatar`, `changePassword(input, flow)` и
`refreshCurrentUser()` - методы `CurrentSessionStore`. Флоу каждая форма
создает сама и передает аргументом, как `signIn`/`signUp` и
`ChatListStore.createChat` (требование `shared-form-submission` «Флоу
отправки живет вместе с формой»). Стор делает запрос, обновляет **Текущего
пользователя** там, где операция его меняет, и показывает **Уведомление**.
Сервисы операций и `RefreshCurrentUserService` удаляются, их `it` переезжают
в спек Стора. Смена пароля **Текущего пользователя** не меняет, но это
операция над ним - отдельный Стор ради одного метода вернул бы файл на
сценарий.

`refreshCurrentUser()`: `Authenticated` → ответ пишется прямо в состояние
Стора и отдается значением; `Anonymous` → пустое завершение без
**Уведомления** (его уже показал перехватчик), состояние не трогается;
ошибка → `NOTIFIER.error('Failed to load profile', message)` и пустое
завершение, состояние не трогается.

Цена - ширина Стора (~10 методов); она уже принята в ADR от 28-10. ADR не
пишем: правило «флоу формы - аргументом» записано там же.

### 3. Свежий профиль - в меню перед открытием модалки

`CurrentUserAvatarMenu.editProfile()` закрывает popover, зовет
`refreshCurrentUser()` и на значении открывает модалку с
`inputs: { currentUser }`. Пустое завершение модалку не открывает:
**Уведомление** уже показал Стор или перехватчик. `UpdateProfileModalContent`
получает вход `currentUser` и отдает форме `profile: UpdateProfileInput`;
маппинг `CurrentUser → UpdateProfileInput` (`displayName ?? ''`) - в
содержимом модалки. `UpdateProfileForm` заполняется входом (`setValue`), а
`UpdateProfileService` удаляется вместе с `initialValues` и чтением сессии.

Повторный клик, пока ответ идет, дает второй запрос; вторая модалка не
откроется (`ModalService` держит одну). Принимаем: отдельного признака
загрузки в меню ради этого не заводим.

Альтернатива - модалка открывается сразу и ждет данные внутри. Отклонена:
нужно состояние загрузки в форме, то есть новый интерфейс.

### 4. Модалка закрывается на `NavigationEnd`

`ModalService` подписывается на `Router.events` и на `NavigationEnd` при
активной модалке вызывает `modalRef.close()` - то же событие закрытия без
результата, что и у `Escape`. `NavigationCancel` и `NavigationError` модалку
не трогают: человек остался на месте.

`disposeOnNavigation` из CDK (`@angular/cdk` 21.2.14) не подходит: он
подписан на `Location` и срабатывает только на «назад»/«вперед» браузера, а
не на `router.navigateByUrl`.

Правило действует на все модалки, включая создание чата и подтверждения.
Сейчас ни одна из них не держится открытой через переход: подтверждение
удаления чата закрывается до `navigateByUrl('/')`.

Альтернатива - `SessionExpiryService` закрывает модалки сам. Отклонена:
`ModalService` пришлось бы открыть наружу «закрыть все», а повиснуть поверх
чужого маршрута модалка может не только при **Истечении сессии**.

## Контракты компонентов

### `UpdateProfileModalContent` (меняется)

| Вход / выход         | Тип           |
| -------------------- | ------------- |
| `currentUser` (вход) | `CurrentUser` |

Решает сам: маппинг в `UpdateProfileInput`, закрытие модалки на успехе.

### `UpdateProfileForm` (меняется)

| Вход / выход             | Тип                  |
| ------------------------ | -------------------- |
| `profile` (вход)         | `UpdateProfileInput` |
| `profileUpdated` (выход) | `void`               |

Решает сам: валидация, свой флоу и отправка через
`CurrentSessionStore.updateProfile`.

### `CurrentUserAvatarMenu` (меняется)

Решает сам: свежий профиль перед открытием модалки профиля; смена пароля и
выход - как раньше.

### `ModalService` (меняется)

Публичный контракт прежний; добавляется закрытие на `NavigationEnd`.

## Уровни тестов

| Требование / сценарии                                                        | Уровень                                                                                                                      |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Истечение сессии: `401` при `Authenticated`, не при другом статусе, один раз | interceptor (`HttpTestingController`), service (`SessionExpiryService`), application (`expireCurrentSession`)                |
| Истечение сессии: открытая форма закрывается                                 | e2e (`page.route` → `401` на сохранение профиля)                                                                             |
| Свежий профиль: данные из ответа, шапка обновлена                            | application (`CurrentSessionStore.refreshCurrentUser`), component (меню открывает модалку с ответом, форма заполнена входом) |
| Свежий профиль: ответа нет, ошибка, `401`                                    | application (Уведомление, сессия не тронута; `Anonymous` - без Уведомления), component (меню: модалка не открыта)            |
| Смена пароля данных не ждет                                                  | component (меню: модалка открыта без вызова `refreshCurrentUser`)                                                            |
| Профиль: сохранение через Стор                                               | application (`CurrentSessionStore.updateProfile`), component (`UpdateProfileForm`)                                           |
| Модалка: закрытие на завершенном переходе, отмененный не закрывает           | service (`ModalService` с настоящим `Router`)                                                                                |

## Risks / Trade-offs

- [Два **Уведомления** на одно событие: `Session expired` и ошибка сценария с
  `NOTIFIER`] → Принято в разборе: сценарии не меняются. Исключение -
  свежий профиль, где шлюз превращает `401` в `Anonymous`.
- [**Выход** при уже мертвой куке: если бэкенд на `POST /auth/logout` ответит
  `401`, человек увидит `Session expired`] → swagger `401` у logout не
  описывает; итог тот же - `/sign-in`, отдельным сценарием не выносим.
- [Пауза между кликом и модалкой профиля на медленной сети: меню закрыто, на
  экране ничего не происходит] → Принято: индикатор - часть issue страницы
  **Настроек**.
- [Модалка закрывается на любом завершенном переходе, в том числе по
  `routerLink` внутри содержимого] → Сейчас таких ссылок в модалках нет; для
  них закрытие и есть ожидаемое поведение.
