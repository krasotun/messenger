import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

import { SessionExpiryService } from '@core/session/session-expiry.service';
import { CurrentSessionStore, CurrentSessionStatus } from '@domains/users';

export const sessionExpiryInterceptor: HttpInterceptorFn = (req, next) => {
  const currentSessionStore = inject(CurrentSessionStore);
  const sessionExpiryService = inject(SessionExpiryService);

  return next(req).pipe(
    tap({
      error: (err: unknown) => {
        if (
          err instanceof HttpErrorResponse &&
          err.status === 401 &&
          currentSessionStore.status() === CurrentSessionStatus.Authenticated
        ) {
          sessionExpiryService.handle();
        }
      },
    }),
  );
};
