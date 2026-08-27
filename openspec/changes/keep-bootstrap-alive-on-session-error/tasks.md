## 1. Старт приложения переживает отказ бэкенда

- [ ] 1.1 Написать падающий тест в `src/app/core/app-initializers/restore-current-session.initializer.spec.ts`: `restoreCurrentSession()` отдает ошибку, `ApplicationInitStatus.donePromise` MUST резолвиться, а не отклоняться. Проверка: тест падает до правки инициализатора
- [ ] 1.2 Написать тест там же на то, что при ошибке инициализатор не подменяет состояние: статус сессии остается тем, что выставил `CurrentSessionService` (`Anonymous`). Проверка: тест зеленый после 1.3
- [ ] 1.3 Погасить ошибку в `src/app/core/app-initializers/restore-current-session.initializer.ts`, не трогая `CurrentSessionService` и шлюз. Проверка: оба теста из 1.1 и 1.2 зеленые
- [ ] 1.4 Убедиться тестом в `src/app/domains/identity-access/application/sign-in/sign-in.service.spec.ts`, что проброс ошибки для входа сохранен: если восстановление сессии после успешного входа падает, флоу отправки переходит в `Error`. Проверка: тест зеленый без правок `SignInService` либо, если сценарий уже покрыт, зафиксировать это в отчете
- [ ] 1.5 Quality gates: `npm run lint` и `npm run test:ci`. E2E не запускается - по `design.md` сценарий сознательно проверяется на уровне core
