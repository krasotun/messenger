## Context

Мотив - в `proposal.md`. Текущее состояние, от которого отталкиваемся:

- Профиль, аватар и пароль открываются из `CurrentUserAvatarMenu` через
  `ModalService`: `UpdateProfileModalContent` держит `UpdateProfileForm` и
  `ChangeAvatarForm` и предоставляет `UpdateProfileService` и
  `ChangeAvatarService`; `ChangePasswordModalContent` - `ChangePasswordForm` и
  `ChangePasswordService`. На успехе модалка закрывается.
- `UpdateProfileForm` берет исходные значения из
  `UpdateProfileService.initialValues`, то есть из **Текущего пользователя**,
  один раз в конструкторе.
- Дерево маршрутов (`app.routes.ts`) уже вложенное и ленивое через
  `loadComponent`; стражи `authenticatedOnlyGuard` и `guestOnlyGuard` живут в
  `core/routing`. `provideRouter` подключен с `withComponentInputBinding()`.
- `CurrentSessionService.restoreCurrentSession()` на любой ошибке переводит
  сессию в `Anonymous` - для подготовки профиля он не годится: спека требует,
  чтобы ошибка сессию не трогала.
- Глобальной обработки `401` нет: сигнал `status` в `CurrentSessionService`
  меняется только кодом приложения. Истекшая посреди работы кука оставляет
  `Authenticated` до перезагрузки - `restore-current-session.initializer.ts`
  выясняет сессию только на старте.
- `Logout` сначала зовет бэкенд, потом переходит на `/sign-in`, а `/sign-in`
  закрыт `guestOnlyGuard`: пока сессия жива, переход туда переадресует на `/`.
- Макет - канвас https://claude.ai/artifact/SoubckrW8uk6zcSJFKNovA (4
  артборда: профиль с аватаром, пароль, подтверждение ухода, индикатор и меню).

## Goals / Non-Goals

**Goals:**

- Данные идут маршрутом: resolver → input раздела → input формы, без чтения
  сессии формой.
- Один страж ухода на все разделы: он спрашивает у компонента «есть ли
  несохраненные изменения» и не знает про формы.
- **Выход** проходит через роутер, чтобы страж ухода сработал до запроса.

**Non-Goals:**

- Сравнение значений формы профиля с исходными (вернул как было - изменений
  нет): признак изменений - `dirty`, как у `requireChanges` в `app-form`.
  Сравнение с исходными - форма A, отдельный issue.
- `ControlValueAccessor` для выбора файла: `ChangeAvatarForm` меняет разметку,
  но остается на `(change)`.
- Предупреждение `beforeunload` на других экранах.

## Поток

Одно нажатие по времени: кто кого зовет и в каком блоке `tasks.md` это
появляется. Решения ниже объясняют «почему» каждой стрелки.

```
Человек в Чатах выбирает Settings в меню аватара               [4]
│
├─ роутер: /settings → redirectTo → /settings/profile            [4]
│    NavigationStart: через 200 мс без ответа - полоска сверху    [5]
│
├─ resolve { currentUser } маршрута profile
│    currentUserResolver (pages)                                  [4]
│      → RefreshCurrentUserService.refreshCurrentUser()           [1]
│          → AUTH_GATEWAY.currentSession() → GET /auth/user
│    пока ответа нет - на экране Чаты
│
├─ ответ
│    Authenticated → CurrentSessionService.updateCurrentUser      [1]
│                    (шапка тоже свежая)
│                  → currentUser во вход ProfileSettings          [4]
│                  → profile во вход UpdateProfileForm            [2]
│    401 → sessionExpiryInterceptor (распознает)                  [0]
│            → SessionExpiryService.handle(): сессия Anonymous,
│              Уведомление, /sign-in
│          шлюз → Anonymous → поток пуст, без Уведомления         [1]
│    ошибка → Уведомление, поток пуст                             [1]
│           → навигация отменена, человек в Чатах                 [4]
│
└─ уход из раздела (ссылка, «назад», Logout → /logout)
     canDeactivate: unsavedChangesGuard                           [3]
       → раздел.hasUnsavedChanges() → формы: dirty / файл         [2, 4]
       → есть изменения: подтверждение Discard changes
       → Истечение сессии: страж пропускает без вопроса           [3]
     /logout: canActivate logoutGuard → Выход → /sign-in          [3]
     закрытие вкладки: beforeunload в разделе                     [4]
```

Раздел пароля идет той же веткой без `resolve`.

## Decisions

### 1. Страница в `pages`, разделы в домене

`SettingsPage` - композиция страницы (навигация разделов, возврат к **Чатам**,
`<router-outlet>`) - живет в `src/app/pages/settings-page/` рядом со своим
`settings.routes.ts`. Разделы `ProfileSettings` и `PasswordSettings` - в
`identity-access/presentation`: им нужны сервисы домена в `providers`.
`app.routes.ts` подключает группу через `loadChildren` внутри оболочки
`AuthenticatedShell`, рядом с маршрутом **Чатов**:

```
''            AuthenticatedShell   canActivate: authenticatedOnlyGuard
 ├ ''         ChatsPage → ':chatId' SelectedChat
 └ 'settings' loadChildren → settings.routes.ts
     ''       SettingsPage
      ├ ''        redirectTo 'profile', pathMatch 'full'
      ├ 'profile'  ProfileSettings   resolve { currentUser }  canDeactivate
      └ 'password' PasswordSettings                            canDeactivate
'logout'      canActivate: logoutGuard   (компонента нет)
```

Альтернатива - вся ветка в домене (`identity-access/settings.routes.ts`).
Отклонена: маршрут с `redirectTo` и стражами из `core` - композиция, как
`ChatsPage`; домен отдает только разделы. `loadComponent` разделов идет
динамическим импортом по пути внутри домена, как у `SelectedChat`
(`app.routes.ts:37-40`): статический импорт `presentation/*` ESLint
запрещает, динамический - нет, и чанк остается ленивым.

### 2. Resolver отменяет навигацию, а не переадресует

`currentUserResolver` (`pages/settings-page`) зовет
`RefreshCurrentUserService.refreshCurrentUser()` и отдает `CurrentUser`. На
ошибке сервис сообщает ее **Уведомлением** и завершает поток без значения;
роутер отменяет навигацию (`NavigationCancellationCode.NoDataFromResolver`),
человек остается на прежнем экране. Ключ `currentUser` попадает в input
`ProfileSettings` через `withComponentInputBinding()`.

`RefreshCurrentUserService` (application, `providedIn: 'root'`) зовет
`AUTH_GATEWAY.currentSession()`: `Authenticated` →
`CurrentSessionService.updateCurrentUser(user)` и значение; `Anonymous` →
пустое завершение без **Уведомления** (его уже показал перехватчик, решение 9);
ошибка → `NOTIFIER.error('Failed to load profile', message)` (текст - из
**Ошибки приложения**, запасной кладет шлюз) и пустое завершение. Сессию сервис не меняет ни
в одной из веток.

Альтернативы: `restoreCurrentSession()` - сбрасывает сессию на ошибке, против
спеки; `RedirectCommand` на `/` - уводит со страницы, где человек был, против
сценария «остается на прежнем экране»; данные без resolver из сессии - решено
в explore запрашивать заново.

### 3. Форма профиля получает исходные значения входом

`UpdateProfileForm` получает `profile: UpdateProfileInput` и заполняется
им (`setValue`). `UpdateProfileService.initialValues` удаляется вместе с
чтением сессии. После успешной отправки форма сама делает
`reset(getRawValue())`: значения остаются, `dirty` сбрасывается - Save снова
недоступна и страж ухода молчит. Маппинг `CurrentUser → UpdateProfileInput`
(`displayName ?? ''`) уезжает в `ProfileSettings`.

`ChangePasswordForm` на успехе делает `reset()`: пустые, нетронутые поля без
сообщений об ошибках. `ChangeAvatarForm` уже сбрасывает выбор на
`succeeded$`.

### 4. Один страж ухода по интерфейсу

`HasUnsavedChanges { hasUnsavedChanges(): boolean }` и
`unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges>` - в `core/routing`.
Нет изменений → `true`. Есть → `ConfirmationService.confirm(...)` с
`isDangerous: true`, ответ - `Observable<boolean>`. Тексты:

| Поле           | Значение                                                     |
| -------------- | ------------------------------------------------------------ |
| `title`        | `Discard changes`                                            |
| `subject`      | раздел: `profile` / `password`                               |
| `message`      | `You have unsaved changes. If you leave, they will be lost.` |
| `confirmLabel` | `Discard`                                                    |

Кнопка отказа - штатная `Cancel` примитива, на канвасе так же.

Разделы реализуют интерфейс структурно, без импорта из `core`:
`ProfileSettings` спрашивает `UpdateProfileForm` и `ChangeAvatarForm` через
`viewChild`, `PasswordSettings` - `ChangePasswordForm`. Каждая форма отвечает
сама: профиль и пароль - `dirty` группы, аватар - выбран ли файл.

Альтернатива - сервис-реестр несохраненных форм, который спрашивает и страж,
и меню. Отклонена в explore: второй путь проверки рядом со стражем.

### 5. `beforeunload` - в разделах

`ProfileSettings` и `PasswordSettings` слушают `window:beforeunload` через
`host` и вызывают `event.preventDefault()`, только если
`hasUnsavedChanges()`. Текст диалога задает браузер. Общая директива не
заводится: потребителей два, оба на одной странице (правило «от конкретного к
общему»).

### 6. Выход - маршрут `/logout`

Пункт меню `Logout` становится ссылкой на `/logout`. У маршрута нет
компонента, только `canActivate: [logoutGuard]` (`core/routing`): страж
выполняет `CurrentSessionService.logout()` и на успехе и на ошибке отдает
`UrlTree` на `/sign-in` - как сейчас делает меню. Порядок роутера дает нужное
поведение даром: `canDeactivate` уходящего раздела → `canActivate` маршрута
`/logout`. Отказ в подтверждении отменяет навигацию до запроса. К моменту
перехода на `/sign-in` сессия уже `Anonymous`, `guestOnlyGuard` пропускает.

Цена - страж с побочным эффектом. Принимаем: маршрут существует только ради
этого действия, и страж - единственное место, которое роутер вызывает до
активации. Альтернативы (сначала `navigateByUrl('/')`, реестр форм)
разобраны в explore.

ADR не пишем: решение легко откатить - условие «тяжело откатить» не выполнено.

### 7. Индикатор навигации в корне приложения

`NavigationProgress` (`core/layouts/navigation-progress`) стоит в
`app.html` над `<router-outlet>`, чтобы покрывать любой маршрут, включая вход.
Читает `Router.events`: `NavigationStart` запускает таймер на 200 мс,
`NavigationEnd`/`NavigationCancel`/`NavigationError` гасит таймер и полоску.
Состояние - сигнал `visible`. Полоска - неопределенная анимация (бегущий
отрезок): процента навигации роутер не знает.

Альтернатива - `withNavigationErrorHandler` и события внутри `Router`
сервиса-обертки. Отклонена: сервис ради одного потребителя.

### 8. Аватар - строка над формой профиля

`ChangeAvatarForm` перерисовывается по артборду `Main`: аватар 56 px, имя,
ссылка-кнопка `Change avatar`, открывающая выбор файла; после выбора -
превью, имя файла, `Cancel` и `Upload`. Ошибка формата - строкой под строкой.
`Cancel` сбрасывает выбор (`_selectFile(null)`).

### 9. Истечение сессии - перехватчик распознает, сервис реагирует

`sessionExpiryInterceptor` (`core/http`) стоит в конце `withInterceptors`
(`app.config.ts`) и только распознает **Истечение сессии**: на
`HttpErrorResponse` со статусом `401` при
`CurrentSessionService.status() === Authenticated` он зовет
`SessionExpiryService.handle()`. Ошибка идет дальше вызывающему без изменений.

Реакция - в `SessionExpiryService` (`core/session`, `providedIn: 'root'`):
`CurrentSessionService.expireCurrentSession()` (новый метод: сессия в
`Anonymous`, без запроса), `NOTIFIER.error('Session expired', 'Please sign in
again.')` и `Router.navigateByUrl('/sign-in')`. Отдельно от перехватчика -
потому что ее же позовет лента на WebSocket, где `HttpClient` не участвует;
так же разделяет пример `authRedirectInterceptor` в документации Angular
(https://angular.dev/guide/http/interceptors). В `core`, а не в домене:
сервисам `application` роутер не нужен ни одному, а `core` уже связывает
домен с роутером (`logoutGuard`).

Проверка статуса отсекает сразу три случая без списка URL: `401` при **Входе**
и **Регистрации** (статус `Anonymous`), при **Восстановлении сессии** на
старте (`Loading`) и повторные `401` параллельных запросов - первый уже
перевел статус в `Anonymous`.

**Уведомление** и переход - в `SessionExpiryService`, а не в `CurrentSessionService`:
сервис сессии остается тихим состоянием, **Уведомления** показывает слой
выше - как у сценариев в `application`. `expireCurrentSession()` отдельно от
`logout()`: тот шлет запрос к бэкенду.

`unsavedChangesGuard` при статусе не `Authenticated` отдает `true` без
подтверждения: к переходу на `/sign-in` `SessionExpiryService` уже сбросил
сессию.

Альтернативы: перехватчик сам сбрасывает, уведомляет и уводит - отклонено,
сцепляет распознавание с реакцией; обработка в каждом шлюзе - повтор в каждом;
перехватчик гасит
ошибку в `EMPTY`, чтобы **Уведомление** было одно, - отклонено в разборе,
сценарии получают ошибку как обычно.

ADR не пишем: перехватчик легко убрать - условие «тяжело откатить» не
выполнено.

## Контракты компонентов

### `SettingsPage` (pages, новый)

| Вход / выход | Тип |
| ------------ | --- |
| -            | -   |

Решает сам: ссылки `Profile` / `Password` с отметкой текущего раздела
(`routerLinkActive`, `aria-current="page"`), ссылка `Back to chats` на `/`,
`<router-outlet>`.

### `ProfileSettings` (identity-access/presentation, новый)

| Вход / выход                      | Тип           |
| --------------------------------- | ------------- |
| `currentUser` (вход, из resolver) | `CurrentUser` |

Решает сам: `providers: [UpdateProfileService, ChangeAvatarService]`; маппинг
в `UpdateProfileInput` для формы; `hasUnsavedChanges(): boolean` (любая из
двух форм); `beforeunload`.

### `PasswordSettings` (identity-access/presentation, новый)

| Вход / выход | Тип |
| ------------ | --- |
| -            | -   |

Решает сам: `providers: [ChangePasswordService]`; `hasUnsavedChanges()`;
`beforeunload`.

### `UpdateProfileForm` (меняется)

| Вход / выход                  | Тип                  |
| ----------------------------- | -------------------- |
| `profile` (вход)              | `UpdateProfileInput` |
| `profileUpdated` (выход)      | `void`               |
| `hasUnsavedChanges()` (метод) | `boolean`            |

Решает сам: валидация, отправка, `reset(getRawValue())` на успехе.

### `ChangePasswordForm` (меняется)

| Вход / выход                  | Тип       |
| ----------------------------- | --------- |
| `passwordChanged` (выход)     | `void`    |
| `hasUnsavedChanges()` (метод) | `boolean` |

Решает сам: валидация, совпадение повтора, `reset()` на успехе.

### `ChangeAvatarForm` (меняется)

| Вход / выход                  | Тип       |
| ----------------------------- | --------- |
| `hasUnsavedChanges()` (метод) | `boolean` |

Решает сам: выбор и проверка формата файла, превью, `Cancel`, отправка,
сброс на успехе; текущий аватар и имя - из **Текущего пользователя**.

### `CurrentUserAvatarMenu` (меняется)

| Вход / выход | Тип |
| ------------ | --- |
| -            | -   |

Решает сам: пункты-ссылки `Settings` → `/settings` и `Logout` → `/logout`,
закрытие popover по выбору. `ModalService` и `Router` больше не нужны.

### `NavigationProgress` (core, новый)

| Вход / выход | Тип |
| ------------ | --- |
| -            | -   |

Решает сам: подписка на `Router.events`, задержка 200 мс, `visible`.

## Уровни тестов

| Требование / сценарии                                                           | Уровень                                                                                                                                   |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Страница Настроек: меню, `/settings` → профиль, прямой адрес, переходы, возврат | component (`SettingsPage`, меню), routing (`RouterTestingHarness` на `settings.routes`), e2e                                              |
| Свежий профиль: данные из ответа, сессия обновлена                              | application (`RefreshCurrentUserService`), component (`ProfileSettings` получает вход)                                                    |
| Свежий профиль: ошибка, экран прежний                                           | application (Уведомление, сессия не тронута; `Anonymous` - без Уведомления), routing                                                      |
| Истечение сессии: `401` при `Authenticated`, не при другом статусе, один раз    | interceptor (`HttpTestingController`), service (`SessionExpiryService`), application (`expireCurrentSession`), e2e (`page.route` → `401`) |
| Истечение сессии: несохраненные изменения не держат                             | guard (`unsavedChangesGuard`)                                                                                                             |
| Раздел пароля данных не ждет                                                    | routing                                                                                                                                   |
| Подтверждение ухода: есть / нет изменений, согласие, отказ                      | guard (`unsavedChangesGuard`), component (`hasUnsavedChanges` форм и разделов)                                                            |
| Подтверждение ухода: «назад» в браузере, между разделами                        | e2e                                                                                                                                       |
| `beforeunload`                                                                  | component (событие отменено / не отменено)                                                                                                |
| Выход с изменениями: отказ без запроса, согласие                                | guard (`logoutGuard`), e2e                                                                                                                |
| Профиль: успех оставляет форму, Save недоступна                                 | component (`UpdateProfileForm`)                                                                                                           |
| Пароль: очистка после успеха                                                    | component (`ChangePasswordForm`)                                                                                                          |
| Аватар: действия после выбора, `Cancel`, ошибка формата                         | component (`ChangeAvatarForm`)                                                                                                            |
| Политика доступа к `/settings`                                                  | routing                                                                                                                                   |
| Индикатор: долгий / быстрый / отмена                                            | component (`NavigationProgress`, fake timers)                                                                                             |
| Вид страницы                                                                    | e2e `@visual`: профиль и пароль по умолчанию                                                                                              |

## Risks / Trade-offs

- [Два **Уведомления** на одно событие: `Session expired` и ошибка сценария с
  `NOTIFIER`] → Принято в разборе: сценарии не меняются. Исключение -
  подготовка профиля, где шлюз превращает `401` в `Anonymous`.
- [**Выход** при уже мертвой куке: если бэкенд на `POST /auth/logout` ответит
  `401`, человек увидит `Session expired`] → swagger `401` у logout не
  описывает; итог тот же - `/sign-in`, отдельным сценарием не выносим.
- [Переход из перехватчика во время resolve профиля] → Новая навигация
  вытесняет текущую (`SupersededByNewNavigation`), resolver без значения
  ничего не ломает.
- [Страж `/logout` с побочным эффектом: прямой заход на `/logout` разлогинит]
  → Это и есть смысл маршрута; ссылки на него есть только в меню.
- [`dirty` вместо сравнения с исходными: вернул значение как было - страж все
  равно спросит] → Согласовано: сравнение - форма A.
- [Удаление модалок ломает e2e профиля, пароля и аватара] → Сценарии
  переписываются в том же блоке, что и меню.
- [Индикатор на fake timers в zoneless-спеке] → Проверить, что
  `vi.useFakeTimers()` дружит с `RouterTestingHarness`; если нет - тест
  индикатора на подмененном потоке событий `Router`.
