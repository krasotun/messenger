# Messenger

[![ci](https://github.com/krasotun/messenger/actions/workflows/ci.yml/badge.svg)](https://github.com/krasotun/messenger/actions/workflows/ci.yml)

Веб-мессенджер на Angular: регистрация и вход, профиль пользователя, чаты и
сообщения. Работает поверх учебного API Яндекс.Практикума.

- Production: https://krasotun.github.io/messenger/
- API reference: https://ya-praktikum.tech/api/v2/swagger/#/
- Описание проекта, стек, архитектура и конвенции: `openspec/config.yaml`
- Требования к поведению системы: `openspec/specs/`
- Текущие изменения в работе: `openspec/changes/`

## Установка

Нужны Node.js 20+ и npm 10+. Docker не нужен.

```bash
npm install
npm ci --prefix mock-auth-backend   # зависимости мок-бэкенда, нужны для e2e
```

## Как запускается приложение

Режима два, отличаются они тем, в какой API ходит приложение. Файлы окружений -
в `src/environments/`.

| Команда             | Порт | API                                | Когда нужен                          |
| ------------------- | ---- | ---------------------------------- | ------------------------------------ |
| `npm start`         | 4200 | `https://ya-praktikum.tech/api/v2` | Работа с настоящими данными          |
| `npm run start:e2e` | 4300 | `http://localhost:3000` (мок)      | Разработка и отладка без боевого API |

Мок-бэкенд под второй режим поднимается отдельной командой:

```bash
npm run e2e:backend   # http://localhost:3000
```

Данные он держит в памяти: состояние живет до остановки процесса, а
`POST /test/reset` сбрасывает его.

## Сборка

```bash
npm run build       # production-сборка в dist/messenger/browser
```

## Тесты и проверки

Unit и component (Vitest):

```bash
npm run lint
npm run lint:fix
npm run test            # watch-режим
npm run test:ci         # один прогон
npm run test:coverage
```

E2E (Playwright). Стенд поднимается сам - мок-бэкенд на :3000 и приложение на
:4300, состояние мока сбрасывается перед прогоном. Заранее запускать ничего не
нужно; уже поднятые процессы переиспользуются.

```bash
npm run e2e             # все, кроме визуальных тестов
npm run e2e:visual      # только @visual
npx playwright test --ui
npx playwright show-report   # отчет последнего прогона
```

Скриншотный тест помечается тегом `@visual` в имени: по этому тегу разделены
прогоны, и без тега такой тест попадет в обычный `npm run e2e` и упадет там.

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
