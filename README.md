# Messenger

Frontend-приложение messenger на Angular.

## API

Swagger API: https://ya-praktikum.tech/api/v2/swagger/#/

## Архитектура

Выбран подход:

```text
Domain-first Angular + lightweight DDD boundaries
```

Код группируется вокруг бизнес-доменов. Внутри домена используется легкое
разделение на `domain`, `application`, `infrastructure`, `presentation`.

`shared` остается только для переиспользуемого технического и UI-кода без
бизнес-логики.

Текущее состояние: базовая domain-first структура уже заведена. Auth-related UI
перенесен в `domains/identity-access/presentation`, старые top-level
`features` и `pages` больше не используются.

## Текущий фокус

Сейчас продуктовый фокус - авторизация:

- регистрация пользователя;
- вход пользователя;
- хранение текущей сессии;
- восстановление сессии в будущем.

Чаты, сообщения и другие messenger-сценарии будут добавлены позже. Не вводим их
в архитектуру раньше времени.

Текущий домен:

```text
domains/identity-access
```

Он отвечает за:

- sign in;
- sign up;
- current user session;
- tokens;
- session restore;
- auth guards;
- authorization-related user state.

## Верхнеуровневая структура

```text
src/app
  core
  shared
  domains
```

Текущая структура проекта:

```text
src/app
  core
  shared
    ui
      button
      form-field
      input
  domains
    identity-access
      domain
      application
      infrastructure
      presentation
        sign-in-page
        sign-up-page
        sign-up-form
```

### `core`

Глобальная инфраструктура Angular-приложения:

- bootstrap/config;
- routes;
- global providers;
- interceptors;
- app-level guards;
- app initialization.

`core` не должен содержать бизнес-логику конкретного домена.

### `shared`

Переиспользуемый технический и UI-код без бизнес-логики:

```text
shared/ui/button
shared/ui/input
shared/ui/form-field
shared/ui/loader
shared/api
shared/lib
shared/validators
shared/types
```

`shared` не зависит от доменов.

### `domains`

Бизнес-домены приложения. Каждый домен инкапсулирует свою бизнес-модель,
application logic, инфраструктуру и presentation.

На текущем этапе основной домен:

```text
domains/identity-access
```

Позже могут появиться:

```text
domains/messaging
domains/profile
domains/notifications
```

## Нейминг

Соглашения по именам:

```text
*.api.ts       // HTTP requests only
*.dto.ts       // backend request/response contracts
*.input.ts     // application scenario input contracts
*.result.ts    // internal application scenario results
*.mapper.ts    // mapping between input/result and DTO
*.service.ts   // state, session, infrastructure services
*.use-case.ts  // optional complex application scenario
*.types.ts     // shared technical types when needed
```

Не используем `store` naming для текущих state services. Предпочитаем имена по
ответственности:

```text
auth-session.service.ts
auth-token.storage.ts
```

Предпочитаем naming по архитектурной роли, а не по синтаксису декларации.
Например, файл с `interface` для backend-контрактов все равно называется
`*.dto.ts`, если это DTO.

## Структура домена

Каждый домен может иметь такую структуру:

```text
domains/{domain-name}
  domain
  application
  infrastructure
  presentation
```

### `domain`

Чистая бизнес-модель домена:

- domain types;
- entities;
- value objects;
- domain rules;
- domain errors.

Код в `domain` не должен зависеть от Angular, `HttpClient`, `Router`,
`localStorage`, `sessionStorage`, HTML или CSS.

Пример для `identity-access`:

```text
domains/identity-access/domain
  user.ts
  session.ts
  auth-credentials.ts
  sign-up-data.ts
  auth-Error.ts
```

### `application`

Сценарии приложения и координация бизнес-процессов:

- application services;
- session state services;
- orchestration logic;
- loading/Error/Success state для сценариев.

Пример:

```text
domains/identity-access/application
  auth.service.ts
  auth-session.service.ts
```

Для Angular на старте предпочитаем `auth.service.ts`, который координирует
сценарии `signIn()`, `signUp()`, `logout()`, `restoreSession()`.

Отдельные `*.use-case.ts` можно вводить позже, если конкретный сценарий
разрастется и станет самостоятельной сложной единицей.

Для состояния используем Angular Signals:

- `signal` для состояния;
- `computed` для производных значений;
- `effect` для реакций, когда они действительно нужны;
- RxJS для HTTP, WebSocket и stream-сценариев.

NgRx на старте не используем.

### `infrastructure`

Работа с внешним миром:

- HTTP API;
- backend DTO;
- mappers;
- token storage;
- localStorage/sessionStorage adapters;
- другие технические adapters.

Пример:

```text
domains/identity-access/infrastructure
  auth.api.ts
  auth.dto.ts
  auth.mapper.ts
  auth-token.storage.ts
```

API-сервисы делают HTTP-запросы и возвращают данные. Они не должны хранить UI
state, управлять router или содержать presentation logic.

### `presentation`

Angular UI конкретного домена:

- pages;
- smart components;
- forms;
- view models;
- presentation-specific helpers.

Пример:

```text
domains/identity-access/presentation
  sign-in-page
  sign-up-page
  sign-in-form
  sign-up-form
```

`presentation` может использовать `application`, но не должна напрямую работать
с `HttpClient`.

## Правила зависимостей

Основное направление зависимостей:

```text
presentation -> application -> domain
application -> infrastructure
infrastructure -> domain
shared <- can be used by all layers
```

Правила:

- `shared` не зависит от доменов.
- `domain` не зависит от Angular, UI, Router, HttpClient или browser storage.
- `presentation` не вызывает `HttpClient` напрямую.
- HTTP-запросы идут через infrastructure API services.
- Компоненты не должны содержать сложную бизнес-логику.
- Бизнес-правила живут в `domain`.
- Сценарии приложения живут в `application`.
- Внешние интеграции живут в `infrastructure`.

Предпочтительный поток:

```text
Component -> ApplicationService -> Api/Storage -> HttpClient
```

Избегать:

```text
Component -> HttpClient
Component -> localStorage
Component -> complex business rules
```

## UI

Базовые UI-компоненты живут в `shared/ui` и являются dumb/reusable:

```text
shared/ui/button
shared/ui/input
shared/ui/form-field
shared/ui/loader
shared/ui/modal
```

Требования к shared UI:

- не знает про бизнес-домены;
- не вызывает API;
- не работает с router;
- не хранит бизнес-состояние;
- получает данные через inputs;
- сообщает наружу через outputs или стандартные DOM-события.

UI конкретного бизнес-сценария живет в `domains/{domain}/presentation`.

## Роутинг

Для доменных страниц предпочитаем lazy loading через `loadComponent`.

Текущие auth-маршруты:

```text
/        -> redirect to /sign-up
/sign-in -> identity-access sign-in page
/sign-up -> identity-access sign-up page
```

Целевой формат подключения страниц:

```ts
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'sign-up',
  },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./domains/identity-access/presentation/sign-in-page/sign-in-page')
        .then((m) => m.SignInPage),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./domains/identity-access/presentation/sign-up-page/sign-up-page')
        .then((m) => m.SignUpPage),
  },
];
```

Guards добавляем после реализации авторизации и проверки сессии:

```text
/sign-in   guest only
/sign-up   guest only
/messenger auth only
/profile   auth only
```

## Текущий MVP

Текущий MVP: Authorization.

Порядок задач:

1. `[Shared UI] Create reusable button component` - done
2. `[Shared UI] Create reusable form field and input directive` - done
3. `[Identity Access] User can sign up` - active
4. `[Identity Access] User can sign in`

Текущая активная задача:

```text
[Identity Access] User can sign up
```

Готовые shared UI элементы:

```text
src/app/shared/ui/button
src/app/shared/ui/form-field
src/app/shared/ui/input
```

`shared/ui/form-field` отвечает за label, Error, layout и accessibility.
`shared/ui/input` содержит директиву `appInput` для визуального стиля native
input.

Пример использования:

```html
<app-form-field label="Email" htmlFor="email" [Error]="emailError">
  <input appInput id="email" type="email" formControlName="email" />
</app-form-field>
```

Для `sign up` нужно:

- уточнить backend contract: request, Success response, Error response;
- описать domain-модель: email, password, validation rules, domain errors;
- добавить application-сценарий с loading, Success и Error state;
- добавить infrastructure: DTO, mapper, `sign-up.api.ts`;
- собрать presentation: поля формы, validation messages, submit handling;
- решить поведение после успешной регистрации в зависимости от backend response.

Не включаем в эту задачу session restore, guards, chats/messages и другие
messenger-сценарии.

## Целевая структура

Ниже целевая структура по мере развития authorization MVP. Часть каталогов
может быть пустой и зафиксирована через `.gitkeep`, пока в слое нет кода.

```text
src/app
  core
    app.config.ts
    app.routes.ts
    interceptors
    guards

  shared
    ui
      button
      input
      form-field
      loader
    api
      api.config.ts
      api-Error.ts
    lib

  domains
    identity-access
      domain
        user.ts
        session.ts
        auth-credentials.ts
        sign-up-data.ts
        auth-Error.ts

      application
        auth.service.ts
        auth-session.service.ts

      infrastructure
        auth.api.ts
        auth.dto.ts
        auth.mapper.ts
        auth-token.storage.ts

      presentation
        sign-in-page
        sign-up-page
        sign-in-form
        sign-up-form
```

## Разработка

Установить зависимости:

```bash
npm install
```

Запустить dev server:

```bash
npm start
```

Сборка:

```bash
npm run build
```

Тесты:

```bash
npm test
```
