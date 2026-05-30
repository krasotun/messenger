# TODO

## Активная задача

```text
[Infra] Add Docker Compose e2e with mock auth backend
```

## Текущий шаг

Переписать оставшиеся auth e2e на mock auth backend без `page.route(...)`.

Ближайший конкретный шаг:

- `e2e/auth/sign-in.spec.ts`: setup пользователя делать через `POST /auth/signup` в Playwright `request`.

## Текущий статус

- Authorization-only MVP закрыт на уровне unit/component specs.
- Playwright auth e2e уже покрывают sign up, sign in, session restore и logout.
- Route-mocked e2e постепенно заменяются compose-based e2e через mock auth backend.
- Mock auth backend добавлен в `mock-auth-backend/`.
- `docker-compose.e2e.yml` поднимает frontend production container и mock auth backend.
- Sign-up e2e уже переписан на mock auth backend.
- Последняя успешная проверка sign-up compose e2e:
  `npm run e2e -- e2e/auth/sign-up.spec.ts --project=chromium` -> `2 passed`.

## Acceptance Criteria текущей задачи

- Все auth e2e проходят через mock auth backend, без `page.route(...)`.
- `npm run e2e` локально поднимает compose окружение и проходит.
- Frontend production image собирается и раздается через nginx container.
- Mock backend покрывает только authorization scope:
  `POST /auth/signup`, `POST /auth/signin`, `GET /auth/user`, `POST /auth/logout`.
- `POST /test/reset` используется только как test-only hook для e2e.

## Следующие задачи

1. Закрыть Docker Compose e2e с mock auth backend.
2. Добавить GitHub Actions CI quality pipeline:
   unit/component specs, production build, Docker Compose e2e.
3. Сделать первый ручной VDS deployment:
   Docker/nginx, domain или IP, HTTPS, CORS/session-cookie ограничения.
4. После успешного ручного deployment рассмотреть GitHub Actions CD.
5. Ansible рассмотреть только после первого ручного VDS deployment, если настройку сервера нужно будет повторять.

## Deployment Notes

- Production deployment на VDS должен включать только frontend container.
- Mock auth backend используется только локально и в CI для e2e.
- Первый deployment делать вручную: `git pull` на VDS, `docker build`, restart container.
- CI лучше добавить перед ручным deployment как quality gate.
- CD через GitHub Actions не добавлять до первого успешного ручного deployment.
- Ansible сейчас преждевременен.

## Product Scope

Текущий фокус продукта: authorization only.

Разрешенные сценарии:

- sign up;
- sign in;
- current session;
- future session restore;
- logout.

Out of scope без прямого запроса:

- chats;
- messages;
- profile/settings UI;
- новые non-auth application flows.
