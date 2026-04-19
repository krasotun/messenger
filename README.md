# Messenger

Frontend-приложение messenger на Angular.

## API

Swagger API: https://ya-praktikum.tech/api/v2/swagger/#/

## Архитектура

Выбран подход:

```text
Angular standalone + lazy routes + simplified Feature-Sliced Design + signal-based services
```

Используем упрощенный Feature-Sliced Design без слоя `widgets` на старте.

Основные слои:

```text
app
pages
features
entities
shared
```

`widgets` добавим позже, только если страницы станут слишком крупными.

## Текущий фокус

Сейчас в проекте есть только базовые сценарии авторизации:

```text
features/auth/sign-in
features/auth/sign-up
```

Messenger-сценарии вроде отправки сообщений и создания чатов пока не планируем как текущую задачу. Они появятся позже.

## Организация features

Так как сценариев со временем станет много, `features` не делаем плоской папкой.

Используем практичный формат:

```text
features/{domain}/{scenario}
```

Примеры:

```text
features/auth/sign-in
features/auth/sign-up
features/auth/logout

features/profile/update-profile
features/profile/update-avatar
features/profile/update-password

features/chats/create-chat
features/chats/delete-chat
features/chats/add-user-to-chat

features/messages/send-message
features/messages/edit-message
features/messages/delete-message
```

Важно: доменная папка внутри `features` нужна только для группировки сценариев. Сами сущности всё равно живут в `entities`.

```text
entities/user       // пользователь как сущность
features/auth/sign-in // действие входа

entities/message       // сообщение как сущность
features/messages/send-message // действие отправки сообщения
```

## Рекомендуемая структура

```text
src/
  app/
    app.config.ts
    app.routes.ts
    app.ts
    app.html

    pages/
      sign-in/
        sign-in-page.ts
        sign-in-page.html
        sign-in-page.scss
      sign-up/
        sign-up-page.ts
        sign-up-page.html
        sign-up-page.scss
      messenger/
        messenger-page.ts
        messenger-page.html
        messenger-page.scss
      profile/
        profile-page.ts
        profile-page.html
        profile-page.scss

    features/
      auth/
        api/
          auth.api.ts
        sign-in/
          ui/
            sign-in-form/
          model/
        sign-up/
          ui/
            sign-up-form/
          model/
        logout/
          ui/
          model/

      profile/
        update-profile/
          ui/
          model/
          api/
        update-avatar/
          ui/
          model/
          api/

      chats/
        create-chat/
          ui/
          model/
          api/
        delete-chat/
          ui/
          model/
          api/

      messages/
        send-message/
          ui/
          model/
          api/
        edit-message/
          ui/
          model/
          api/

    entities/
      user/
        model/
          user.types.ts
          user-session.service.ts
        api/
          user.api.ts
        ui/
          avatar/

      chat/
        model/
          chat.types.ts
          chat-state.service.ts
        api/
          chat.api.ts
        ui/
          chat-list/
          chat-card/

      message/
        model/
          message.types.ts
          message-state.service.ts
        api/
          message.api.ts
        ui/
          message-list/
          message-card/

    shared/
      api/
        api.config.ts
        api-error.ts
      realtime/
        websocket.service.ts
      ui/
        button/
        input/
        form-field/
        loader/
        modal/
        avatar/
      directives/
      pipes/
      utils/
      validators/
      types/
```

## Слои

### `app`

Инициализация приложения.

Здесь лежат:

- корневой компонент;
- `app.config.ts`;
- `app.routes.ts`;
- глобальные providers;
- подключение router/http/interceptors.

### `pages`

Страницы приложения.

Страница собирает экран из `features`, `entities` и `shared`, но не содержит сложную бизнес-логику.

Примеры:

```text
pages/sign-in
pages/sign-up
pages/messenger
pages/profile
```

### `features`

Пользовательские действия и сценарии.

Feature отвечает на вопрос: **что пользователь делает?**

Текущие features:

```text
features/auth/sign-in  // пользователь входит
features/auth/sign-up  // пользователь регистрируется
```

Features на потом:

```text
features/auth/logout
features/profile/update-profile
features/chats/create-chat
features/chats/delete-chat
features/messages/send-message
features/messages/edit-message
```

Важно: в FSD `features` — это не сущности и не общие компоненты, а конкретные пользовательские сценарии. Мы группируем их по доменам только для порядка.

### `entities`

Бизнес-сущности приложения.

Entity отвечает на вопрос: **с чем работает приложение?**

Основные сущности messenger:

```text
entities/user
entities/chat
entities/message
```

На текущем этапе первой нужна сущность:

```text
entities/user
```

`entities/chat` и `entities/message` можно добавить позже, когда начнется работа над экраном messenger.

### `shared`

Общий переиспользуемый код без бизнес-логики.

Здесь лежат:

- базовые UI-компоненты;
- общая API-инфраструктура;
- директивы;
- pipes;
- validators;
- utils;
- общие технические типы.

Примеры:

```text
shared/ui/button
shared/ui/input
shared/ui/form-field
shared/api
shared/directives
shared/utils
shared/types
```

## Правила зависимостей

Направление зависимостей:

```text
app -> pages -> features -> entities -> shared
```

Правила:

- `shared` не зависит ни от кого.
- `entities` могут использовать только `shared`.
- `features` могут использовать `entities` и `shared`.
- `pages` могут использовать `features`, `entities` и `shared`.
- `app` может использовать все слои для настройки приложения.
- Нижний слой не должен импортировать верхний.
- Компоненты не должны напрямую вызывать `HttpClient`.
- API-запросы должны идти через API-сервисы.

Нежелательно:

```text
Component -> HttpClient
```

Лучше:

```text
Component -> Service/Facade -> Api Service -> HttpClient
```

## State management

На старте используем Angular Signals:

- `signal` для состояния;
- `computed` для производных значений;
- `effect` для реакций на изменения;
- RxJS для HTTP, WebSocket и потоковых сценариев.

Состояние текущего пользователя:

```text
entities/user/model/user-session.service.ts
```

Логику конкретного сценария можно держать внутри feature:

```text
features/auth/sign-in/model/sign-in.facade.ts
features/auth/sign-up/model/sign-up.facade.ts
```

NgRx на старте не нужен.

## Нейминг state

В проекте не используем нейминг `store`.

Причины:

- `store` ассоциируется с Redux, NgRx или другими state-manager библиотеками;
- сейчас состояние храним в обычных Angular `@Injectable` services;
- для Angular-проекта понятнее имена с конкретной ответственностью.

Соглашение по неймингу:

```text
*.api.ts      // HTTP-запросы
*.service.ts  // состояние, сессия, инфраструктура
*.facade.ts   // orchestration-логика сложного сценария
*.types.ts    // типы
```

Примеры:

```text
entities/user/model/user-session.service.ts
entities/chat/model/chat-state.service.ts
entities/message/model/message-state.service.ts
features/auth/sign-in/model/sign-in.facade.ts
features/auth/api/auth.api.ts
```

Если позже подключим NgRx или другой state manager, соглашение можно пересмотреть.

## Сервисы, state и facade

Разделяем разные ответственности, а не складываем всё в один большой `UserService`.

### API-сервис

API-сервис отвечает только за HTTP-запросы.

Пример:

```text
entities/user/api/user.api.ts
features/auth/api/auth.api.ts
```

Что делает API-сервис:

- вызывает backend;
- возвращает `Observable`;
- не хранит состояние приложения;
- не управляет router;
- не содержит UI-логику.

### Session/state-сервис

Session/state-сервис хранит состояние текущего пользователя и авторизации.

Предпочтительное имя:

```text
entities/user/model/user-session.service.ts
```

Он отвечает за:

```text
currentUser
isAuthenticated
isLoading
authError
```

Пример ответственности:

```text
setUser
clearUser
setLoading
setError
```

Это Angular-way: обычный `@Injectable` service через DI, внутри которого можно использовать Angular Signals.

Не называем это `store`. Используем Angular-style имя:

```text
user-session.service.ts
```

### Facade

Facade добавляем не сразу, а когда сценарий становится сложным.

Facade нужен, если компоненту приходится координировать несколько зависимостей:

```text
SignInForm
  -> AuthApi
  -> UserApi
  -> UserSessionService
  -> Router
```

В таком случае лучше сделать:

```text
features/auth/sign-in/model/sign-in.facade.ts
```

И компонент будет работать только с facade:

```text
SignInForm -> SignInFacade.signIn()
```

Facade внутри может использовать:

```text
auth.api.ts
user.api.ts
user-session.service.ts
router
```

Когда facade нужен:

- компонент стал слишком умным;
- один сценарий использует несколько API или сервисов;
- есть loading/error/success state;
- нужна orchestration-логика;
- один сценарий вызывается из нескольких мест.

Когда facade не нужен:

- компонент вызывает один простой метод;
- логики мало;
- facade просто проксирует вызов без пользы.

Практичное правило:

```text
Сначала: Component -> Api + UserSessionService
Потом:  Component -> Facade -> Api + UserSessionService + Router
```

## API-слой

Общая API-инфраструктура:

```text
shared/api/api.config.ts
shared/api/api-error.ts
```

API текущего пользователя:

```text
entities/user/api/user.api.ts
```

API авторизации на текущем этапе:

```text
features/auth/api/auth.api.ts
```

Внутри `auth.api.ts` можно держать `signIn()` и `signUp()`. Разделять на `sign-in/api` и `sign-up/api` стоит только позже, если авторизация заметно разрастется.

Компоненты не должны обращаться к `HttpClient` напрямую.

## Роутинг

Страницы лучше подключать через lazy loading:

```ts
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'messenger',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./pages/sign-in/sign-in-page').then((m) => m.SignInPage),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/sign-up/sign-up-page').then((m) => m.SignUpPage),
  },
  {
    path: 'messenger',
    loadComponent: () =>
      import('./pages/messenger/messenger-page').then((m) => m.MessengerPage),
  },
];
```

Guard'ы можно добавить после реализации авторизации:

```text
/sign-in     guest only
/sign-up     guest only
/messenger   auth only
/profile     auth only
```

## UI

Базовые UI-компоненты:

```text
shared/ui/button
shared/ui/input
shared/ui/form-field
shared/ui/loader
shared/ui/modal
shared/ui/avatar
```

UI пользовательских действий:

```text
features/auth/sign-in/ui/sign-in-form
features/auth/sign-up/ui/sign-up-form
```

UI бизнес-сущностей:

```text
entities/user/ui/avatar
entities/chat/ui/chat-card
entities/message/ui/message-card
```

## Smart и dumb компоненты

Компоненты делим по ответственности.

Smart-компоненты знают про данные и сценарии:

- получают данные из service, facade или API;
- вызывают бизнес-действия;
- знают про loading и ошибки;
- могут работать с router;
- обычно живут в `pages` или `features/{domain}/{scenario}/ui`.

Примеры:

```text
pages/sign-in
features/auth/sign-in/ui/sign-in-form
features/auth/sign-up/ui/sign-up-form
```

Dumb-компоненты только отображают UI:

- получают данные через `input`;
- сообщают наружу через `output`;
- не знают про API, state-service и router;
- легко переиспользуются;
- обычно живут в `shared/ui` или `entities/*/ui`.

Примеры:

```text
shared/ui/button
shared/ui/input
shared/ui/form-field
entities/user/ui/avatar
entities/chat/ui/chat-card
```

Главное правило:

```text
Если компонент сам решает, что делать с бизнес-данными, он smart.
Если компонент только показывает данные и эмитит события, он dumb.
```

Для проекта:

```text
pages/*                         // чаще smart-сборщики экранов
features/{domain}/{scenario}/ui // чаще smart-сценарии
entities/*/ui                   // чаще dumb или semi-dumb
shared/ui                       // только dumb
```

## План внедрения

1. Перенести `features/users/components/sign-up-form` в `features/auth/sign-up/ui/sign-up-form`.
2. Создать `features/auth/sign-in`.
3. Создать `entities/user`.
4. Создать `features/auth/api/auth.api.ts`.
5. Создать `shared/api`.
6. Подключить API авторизации.
7. Добавить `user-session.service.ts` для текущего пользователя.
8. Перевести страницы на lazy routes.
9. Добавить guards после реализации входа и проверки сессии.
10. Создать `entities/chat`, `entities/message` и messenger-features позже.

## Краткое резюме

Сейчас берем упрощенный FSD, но внедряем только то, что нужно для входа и регистрации:

```text
features/auth/sign-in
features/auth/sign-up
entities/user
shared/ui
shared/api
```

Сценарии группируем так:

```text
features/{domain}/{scenario}
```

Остальное появится позже по мере развития messenger.
