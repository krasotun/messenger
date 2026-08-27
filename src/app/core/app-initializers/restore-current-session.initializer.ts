import { inject, provideAppInitializer } from '@angular/core';
import { catchError, EMPTY } from 'rxjs';

import { CurrentSessionService } from '@domains/identity-access';

export const provideCurrentSessionRestore = () => {
  return provideAppInitializer(() => {
    const currentSession = inject(CurrentSessionService);

    // Отказ бэкенда не должен отменять бутстрап: статус к этому моменту уже
    // Anonymous, и посетителю нужно показать экран входа, а не пустую страницу.
    // Проброс ошибки остается остальным вызывающим сторонам - его использует вход.
    return currentSession.restoreCurrentSession().pipe(catchError(() => EMPTY));
  });
};
