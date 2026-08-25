# Messenger

[![ci](https://github.com/krasotun/messenger/actions/workflows/ci.yml/badge.svg)](https://github.com/krasotun/messenger/actions/workflows/ci.yml)

Веб-мессенджер на Angular: регистрация и вход, профиль пользователя, чаты и
сообщения. Работает поверх учебного API Яндекс.Практикума.

- Production: https://krasotun.github.io/messenger/
- API reference: https://ya-praktikum.tech/api/v2/swagger/#/
- Описание проекта, стек, архитектура и конвенции: `openspec/config.yaml`
- Требования к поведению системы: `openspec/specs/`
- Текущие изменения в работе: `openspec/changes/`

## Запуск

Нужны Node.js 20+ и npm 10+.

```bash
npm install
npm start           # dev-сервер на http://localhost:4200
```

`npm start` собирается с `src/environments/environment.ts` и ходит в боевой API
`https://ya-praktikum.tech/api/v2`. Чтобы работать против мок-бэкенда, нужна
e2e-конфигурация (`environment.e2e.ts`):

```bash
npm ci --prefix mock-auth-backend   # один раз: зависимости мок-бэкенда
npm run e2e:backend                 # мок-бэкенд на http://localhost:3000
npm run start:e2e                   # приложение на http://localhost:4300
```

## Сборка

```bash
npm run build       # production-сборка в dist/
```

## Тесты и проверки

```bash
npm run lint
npm run lint:fix
npm run test            # Vitest в watch-режиме
npm run test:ci         # Vitest один прогон
npm run test:coverage
```

E2E (Playwright сам поднимает мок-бэкенд на :3000 и приложение на :4300):

```bash
npm ci --prefix mock-auth-backend   # один раз: зависимости мок-бэкенда
npm run e2e             # все, кроме визуальных тестов
npm run e2e:visual      # только @visual
npm run e2e:report
npx playwright test --ui
```

Приложение для e2e собирается с `environment.e2e.ts`, то есть ходит в
мок-бэкенд, а не в боевой API. Поднять его отдельно: `npm run start:e2e`
(:4300) и `npm run e2e:backend` (:3000).

Спецификации:

```bash
npx openspec list
npx openspec validate --strict
```

## Деплой

Приложение раздается GitHub Pages по адресу
https://krasotun.github.io/messenger/. Деплой выполняет workflow
`.github/workflows/ci.yml`: он прогоняет `lint`, `test:ci`, `e2e`, собирает
приложение с `--base-href /messenger/` и публикует `dist/messenger/browser`
через `actions/upload-pages-artifact` и `actions/deploy-pages`. Публикация
запускается автоматически при пуше в `main` и вручную через
`workflow_dispatch`; при падении любой проверки публикация не выполняется.

Прежний деплой на VDS через Ansible больше не используется: сервер выведен из
эксплуатации, секреты `VDS_*` удалены, отката на прежний хостинг нет. Каталоги
`ansible/` и `docs/deployment/` остаются как архив и не описывают актуальный
процесс.
