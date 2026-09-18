## 1. Вход: сервис живет вместе с формой

- [x] 1.1 Написать в `src/app/domains/identity-access/presentation/sign-in-form/sign-in-form.spec.ts` блок `flow lifetime` с реальным `SignInService` и незавершающимся шлюзом: форму отправили, уничтожили и создали заново - поля и кнопка отправки доступны; убедиться, что тест падает, пока сервис в `root`
- [x] 1.2 Дописать в тот же блок проверку «закрытие не отменяет отправку»: после уничтожения формы шлюз отвечает ошибкой - `NOTIFIER.error` вызван. Сейчас тест зеленый и остается страховкой от отмены при переезде
- [x] 1.3 Снять `providedIn: 'root'` с `src/app/domains/identity-access/application/sign-in/sign-in.service.ts` и добавить `providers: [SignInService]` в `src/app/domains/identity-access/presentation/sign-in-form/sign-in-form.ts`; проверить, что тесты из 1.1 и 1.2 зеленые
- [x] 1.4 Перевести мок сервиса в остальных тестах `sign-in-form.spec.ts` на `TestBed.overrideComponent`, а в `src/app/domains/identity-access/application/sign-in/sign-in.service.spec.ts` положить `SignInService` в `providers` `TestBed`; проверить, что обе спеки зеленые
- [x] 1.5 Прогнать `npm run lint` и `npm run test:ci`

## 2. Регистрация: сервис живет вместе с формой

- [ ] 2.1 Написать в `src/app/domains/identity-access/presentation/sign-up-form/sign-up-form.spec.ts` блок `flow lifetime` с реальным `SignUpService` и незавершающимся шлюзом: форму отправили, уничтожили и создали заново - поля и кнопка отправки доступны; убедиться, что тест падает, пока сервис в `root`
- [ ] 2.2 Дописать в тот же блок проверку «закрытие не отменяет отправку»: после уничтожения формы шлюз отвечает ошибкой - `NOTIFIER.error` вызван
- [ ] 2.3 Снять `providedIn: 'root'` с `src/app/domains/identity-access/application/sign-up/sign-up.service.ts` и добавить `providers: [SignUpService]` в `src/app/domains/identity-access/presentation/sign-up-form/sign-up-form.ts`; проверить, что тесты из 2.1 и 2.2 зеленые
- [ ] 2.4 Перевести мок сервиса в остальных тестах `sign-up-form.spec.ts` на `TestBed.overrideComponent`, а в `src/app/domains/identity-access/application/sign-up/sign-up.service.spec.ts` положить `SignUpService` в `providers` `TestBed`; проверить, что обе спеки зеленые
- [ ] 2.5 Проверить, что `providedIn: 'root'` не осталось ни у одного сервиса с **Флоу отправки**: `grep -rln "createFormSubmitFlowState" src/app/domains | xargs grep -l "providedIn"` ничего не выводит
- [ ] 2.6 Прогнать `npm run lint`, `npm run test:ci` и `npm run e2e` (основной путь **Входа** и **Регистрации** в `e2e/auth/`)
