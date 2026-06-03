# TODO

## Активная задача

```text
[Identity] User Profile Editing
```

## Текущий шаг

Начать issue `[Identity] Add current user avatar menu`.

Ближайший конкретный шаг:

- Issue order для milestone `[Identity] User Profile Editing`:
  1. `[Identity] Add current user avatar menu`;
  2. `[Identity] Define profile editing contract`;
  3. `[Identity] Add profile editing flow`.
- Acceptance для `[Identity] Add current user avatar menu` сформулировать перед реализацией.
- Avatar menu должен использовать current session state, но не должен начинать profile editing flow.
- Header остается shell/layout-компонентом без profile editing business logic, API calls или browser storage access.
- Ansible отложить: server deploy и CD уже работают.

## Текущий статус

- Authorization-only MVP закрыт на уровне unit/component specs и production deployment.
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
  - non-root admin user `deploy` создан, SSH key добавлен, вход по SSH и `sudo` проверены;
  - Angular production build скопирован в `/var/www/messenger`;
  - nginx настроен на Angular static files и SPA fallback;
  - автозапуск nginx через systemd проверен;
  - Angular app доступен по HTTPS;
  - HTTP -> HTTPS redirect проверен;
  - `/`, `/sign-in`, `/sign-up` по HTTPS проверены;
  - Let's Encrypt сертификат выпущен и подключен к nginx;
  - `certbot renew --dry-run` прошел успешно;
  - production deployment не использует mock auth backend;
  - CORS/session-cookie ограничения зафиксированы как будущая проверка при появлении production API;
  - GitHub Actions deploy secrets добавлены:
    `VDS_SSH_PRIVATE_KEY`, `VDS_HOST`, `VDS_USER`, `VDS_WEB_ROOT`;
  - deploy workflow добавлен:
    `.github/workflows/deploy.yml`;
  - первый ручной запуск `deploy` workflow проверен успешно;
  - автоматический deploy на push в `main` проверен успешно.

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

- `[Deploy] Bootstrap VDS non-root admin user`
  - Создан обычный sudo-пользователь `deploy`.
  - SSH public key добавлен в `/home/deploy/.ssh/authorized_keys`.
  - Вход по SSH под `deploy` проверен.
  - `sudo` для `deploy` проверен.

- `[Deploy] First manual VDS frontend deployment`
  - Production Angular build собран вручную.
  - Build output скопирован на VDS в `/var/www/messenger`.
  - Host nginx настроен для раздачи static files.
  - SPA fallback настроен через `try_files ... /index.html`.
  - Приложение доступно через `http://73053.koara.live`.

- `[Deploy] Add HTTPS with Let's Encrypt`
  - Let's Encrypt сертификат выпущен для `73053.koara.live`.
  - Сертификат подключен к nginx site config.
  - HTTPS доступен на `https://73053.koara.live`.
  - `certbot renew --dry-run` прошел успешно.

- `[Deploy] Complete first manual VDS deployment`
  - HTTP -> HTTPS redirect проверен.
  - `/`, `/sign-in`, `/sign-up` по HTTPS проверены.
  - Mock auth backend не используется в production deployment.
  - Для текущего static frontend production API отсутствует; CORS/session-cookie проверка переносится на этап появления production authorization API.

- `[Deploy] Prepare GitHub Actions CD access`
  - Отдельный SSH key для GitHub Actions создан.
  - Public key добавлен пользователю `deploy` на VDS.
  - GitHub Actions secrets добавлены:
    `VDS_SSH_PRIVATE_KEY`, `VDS_HOST`, `VDS_USER`, `VDS_WEB_ROOT`.

- `[Deploy] Add manual GitHub Actions CD workflow`
  - Workflow `.github/workflows/deploy.yml` добавлен.
  - Первый режим запуска: вручную через `workflow_dispatch`.
  - CD contract:
    `npm ci` -> `lint` -> `test:ci` -> `e2e` -> `build` -> `rsync`.
  - E2E запускаются через `npm run e2e`, visual specs исключены через `@visual`.
  - Deploy target:
    `deploy@73053.koara.live:/var/www/messenger/`.

- `[Deploy] Verify manual GitHub Actions CD workflow`
  - Первый ручной запуск `deploy` workflow прошел успешно.
  - Quality gate, behavioral e2e, production build и `rsync` проверены.
  - Deployed HTTPS routes после CD проверены.

- `[Deploy] Enable GitHub Actions CD on main push`
  - Workflow `deploy` теперь запускается на `push` в `main`.
  - Ручной запуск через `workflow_dispatch` сохранен.

- `[Deploy] Verify GitHub Actions CD on main push`
  - Автоматический запуск `deploy` workflow на push в `main` проверен успешно.
  - Quality gate, behavioral e2e, production build и `rsync` проверены.
  - Deployed HTTPS routes после auto CD проверены.

- `[Shell] Add authenticated layout with header`
  - Root app больше не содержит header/nav напрямую.
  - Authenticated shell добавлен для защищенной зоны приложения.
  - Authenticated shell рендерит header и nested page outlet.
  - Auth pages не оборачиваются authenticated header.
  - Header содержит logo и right-side user-control placeholder.
  - Header не содержит identity/profile business logic, API calls или browser storage access.

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

1. `[Identity] Add current user avatar menu`.
2. `[Deploy] Upgrade CD to release directories with current symlink`.
3. `[Identity] Define profile editing contract`.
4. `[Identity] Add profile editing flow`.
5. Ansible рассмотреть позже и зафиксировать playbook по уже проверенным VDS/CD шагам.
6. Docker рассмотреть позже только при появлении backend/API/DB или отдельной учебной цели по production container deployment.

## Deployment Notes

- Production deployment на VDS на первом этапе должен быть static frontend через host nginx.
- Mock auth backend используется только локально и в CI для e2e.
- Первый deployment делать вручную: build frontend, доставить `dist/` на VDS, настроить nginx.
- CI лучше добавить перед ручным deployment как quality gate.
- CD через GitHub Actions не добавлять до первого успешного ручного deployment.
- CD через GitHub Actions добавлен и проверен:
  manual `workflow_dispatch` и automatic `push` to `main`.
- Следующее deploy-улучшение после разработки header:
  перейти от `rsync --delete` прямо в live web root к release-based deploy:
  `dist/` загружать в `/var/www/messenger/releases/<run-id>`,
  nginx направить на `/var/www/messenger/current`,
  `current` переключать на новый release после проверки `index.html`,
  хранить несколько последних releases для rollback.
- Docker не нужен для первого Angular-only deployment; вернуться к нему позже, если появится backend/API/DB или отдельная учебная цель по контейнеризации.
- Для static Angular frontend отдельный `messenger` systemd service не нужен; автозапуск обеспечивает nginx.
- Для администрирования VDS использовать обычного sudo-пользователя `deploy`; системного пользователя создавать позже только при появлении backend/API runtime service.
- HTTPS-сертификат Let's Encrypt не хранить как критичный артефакт; хранить процедуру выпуска и учитывать rate limits.
- Ansible сейчас преждевременен; при ручном deployment фиксировать команды и конфиги как будущий playbook draft.
- Подробный черновик будущего Ansible playbook:
  `docs/deployment/manual-vds-deploy.md`.

## Product Scope

Authorization-only MVP готов.

Текущий следующий фокус продукта: identity/account profile editing.

Завершенные authorization сценарии:

- sign up;
- sign in;
- current session;
- future session restore;
- logout.

Следующий planned scenario:

- edit current user's profile.

Out of scope без прямого запроса:

- chats;
- messages;
- broader settings UI beyond profile editing;
- новые non-auth application flows.
