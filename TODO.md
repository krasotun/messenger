# TODO

## Активная задача

```text
[CI] Add GitHub Actions quality pipeline
```

## Текущий шаг

Добавить GitHub Actions pre-deploy quality gate.

Ближайший конкретный шаг:

- Создать workflow, который запускает:
  `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`, `npm run e2e`.
- `npm run e2e` в CI запускает behavioral auth e2e без screenshot specs.
- Не добавлять deployment/CD.

## Текущий статус

- Authorization-only MVP закрыт на уровне unit/component specs.
- Playwright auth e2e уже покрывают sign up, sign in, session restore и logout.
- Mock auth backend добавлен в `mock-auth-backend/`.
- `docker-compose.e2e.yml` поднимает frontend production container и mock auth backend.
- Все auth e2e переписаны на mock auth backend без `page.route(...)`.
- `POST /test/reset` выполняется один раз в Playwright `globalSetup` после старта mock backend; specs изолируются уникальными тестовыми пользователями.
- Последняя успешная проверка полного e2e:
  `npm run e2e` -> passed.
- CI contract согласован:
  - GitHub Actions запускает `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`, `npm run e2e`;
  - `npm run e2e` исключает visual specs через `@visual`;
  - screenshot specs запускаются отдельно через `npm run e2e:visual` и требуют отдельного GitHub Actions visual workflow с artifacts;
  - `npm run test` остается локальным watch-mode, `npm run test:ci` запускает Angular/Vitest unit tests один раз через `ng test --watch=false`;
  - `npm run e2e` использует Docker Compose через Playwright `globalSetup`.

## Завершено

- `[Infra] Add Docker Compose e2e with mock auth backend`
  - Все auth e2e проходят через mock auth backend, без `page.route(...)`.
  - `npm run e2e` локально поднимает compose окружение и проходит.
  - Frontend production image собирается и раздается через nginx container.
  - Mock backend покрывает только authorization scope:
    `POST /auth/signup`, `POST /auth/signin`, `GET /auth/user`, `POST /auth/logout`.
  - `POST /test/reset` используется только как test-only hook для e2e run setup.

## Acceptance Criteria текущей задачи

- GitHub Actions устанавливает зависимости через `npm ci`.
- GitHub Actions запускает lint через `npm run lint`.
- GitHub Actions запускает unit/component specs через `npm run test:ci`.
- GitHub Actions собирает production frontend build через `npm run build`.
- GitHub Actions запускает Docker Compose behavioral e2e через `npm run e2e`.
- Screenshot specs не блокируют основной CI и вынесены в отдельную будущую visual pipeline.
- Pipeline не добавляет deployment/CD.

## Следующие задачи

1. Добавить GitHub Actions CI quality pipeline:
   lint, unit/component specs, production build, Docker Compose behavioral e2e.
2. Добавить отдельный GitHub Actions visual workflow:
   ручной запуск `workflow_dispatch`, `npm run e2e:visual`, upload artifacts для `playwright-report` и `test-results`.
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
