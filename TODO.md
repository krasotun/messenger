# TODO

## Активная задача

```text
[Deploy] First manual VDS deployment
```

## Текущий шаг

Подготовить первый ручной deployment frontend на VDS.

Ближайший конкретный шаг:

- Зафиксировать минимальный deployment contract:
  static Angular build, host nginx, domain или IP, сначала HTTP, HTTPS следующим шагом.
- На VDS вручную выполнить первый static deployment:
  установить nginx, собрать frontend, скопировать `dist/` в web root, настроить SPA fallback.
- Не использовать Docker для первого frontend deployment, если не появится backend/API deployment need.
- Вести подробный deployment guide:
  `docs/deployment/manual-vds-deploy.md`.
- Не добавлять GitHub Actions CD до первого успешного ручного deployment.

## Текущий статус

- Authorization-only MVP закрыт на уровне unit/component specs.
- Playwright auth e2e уже покрывают sign up, sign in, session restore и logout.
- Mock auth backend добавлен в `mock-auth-backend/`.
- `docker-compose.e2e.yml` поднимает frontend production container и mock auth backend.
- Все auth e2e переписаны на mock auth backend без `page.route(...)`.
- `POST /test/reset` выполняется один раз в Playwright `globalSetup` после старта mock backend; specs изолируются уникальными тестовыми пользователями.
- Последняя успешная проверка полного e2e:
  `npm run e2e` -> passed.
- CI quality pipeline добавлен:
  - GitHub Actions запускает `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`, `npm run e2e`;
  - `npm run e2e` исключает visual specs через `@visual`;
  - `npm run test` остается локальным watch-mode, `npm run test:ci` запускает Angular/Vitest unit tests один раз через `ng test --watch=false`;
  - `npm run e2e` использует Docker Compose через Playwright `globalSetup` и `globalTeardown`.
- Visual workflow добавлен:
  - запускается вручную через `workflow_dispatch`;
  - запускает `npm run e2e:visual`;
  - сохраняет `playwright-report` и `test-results` как artifacts;
  - canonical visual baseline: GitHub Actions `ubuntu-latest` + Chromium.
- VDS manual deploy bootstrap начат:
  - domain `73053.koara.live` указывает на VDS;
  - nginx установлен и запущен;
  - `curl -I http://73053.koara.live` вернул `HTTP/1.1 200 OK`;
  - Angular app еще не deployed.

## Завершено

- `[CI] Add GitHub Actions quality pipeline`
  - Основной CI запускает `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`.
  - Behavioral auth e2e запускаются через `npm run e2e`.
  - Screenshot specs исключены из основного CI через `--grep-invert @visual`.
  - Pipeline не добавляет deployment/CD.

- `[Test] Add manual GitHub Actions visual workflow`
  - Visual workflow запускается вручную через `workflow_dispatch`.
  - Screenshot specs запускаются отдельно через `npm run e2e:visual`.
  - Artifacts сохраняют `playwright-report` и `test-results`.
  - Linux Chromium snapshots добавлены как baseline для GitHub Actions.

- `[Infra] Add Docker Compose e2e with mock auth backend`
  - Все auth e2e проходят через mock auth backend, без `page.route(...)`.
  - `npm run e2e` локально поднимает compose окружение и проходит.
  - Frontend production image собирается и раздается через nginx container.
  - Mock backend покрывает только authorization scope:
    `POST /auth/signup`, `POST /auth/signin`, `GET /auth/user`, `POST /auth/logout`.
  - `POST /test/reset` используется только как test-only hook для e2e run setup.

## Acceptance Criteria текущей задачи

- Production frontend build вручную собирается и переносится на VDS.
- Host nginx отдает Angular static files.
- SPA routes корректно fallback'ятся на `index.html`.
- Приложение доступно через domain или IP.
- Первый шаг может быть HTTP-only; HTTPS через Let's Encrypt явно зафиксирован как следующий технический шаг.
- CORS/session-cookie ограничения проверены для authorization-only flow.
- Mock auth backend не используется в production deployment.
- GitHub Actions CD не добавлен до первого успешного ручного deployment.

## Следующие задачи

1. Продолжить manual VDS bootstrap:
   создать non-root admin user, добавить sudo и SSH key, проверить вход по SSH.
2. Сделать первый ручной VDS deployment:
   static Angular build, host nginx, domain или IP, HTTP-only на первом шаге.
3. Добавить HTTPS через Let's Encrypt после успешной проверки HTTP.
4. После успешного ручного deployment рассмотреть GitHub Actions CD.
5. Ansible рассмотреть после ручного deployment и зафиксировать playbook по уже проверенным шагам.

## Deployment Notes

- Production deployment на VDS на первом этапе должен быть static frontend через host nginx.
- Mock auth backend используется только локально и в CI для e2e.
- Первый deployment делать вручную: build frontend, доставить `dist/` на VDS, настроить nginx.
- CI лучше добавить перед ручным deployment как quality gate.
- CD через GitHub Actions не добавлять до первого успешного ручного deployment.
- Docker не нужен для первого Angular-only deployment; вернуться к нему позже, если появится backend/API/DB или отдельная учебная цель по контейнеризации.
- HTTPS-сертификат Let's Encrypt не хранить как критичный артефакт; хранить процедуру выпуска и учитывать rate limits.
- Ansible сейчас преждевременен; при ручном deployment фиксировать команды и конфиги как будущий playbook draft.
- Подробный черновик будущего Ansible playbook:
  `docs/deployment/manual-vds-deploy.md`.

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
