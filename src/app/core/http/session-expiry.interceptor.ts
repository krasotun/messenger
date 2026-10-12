import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

import { SessionExpiryService } from '@core/session/session-expiry.service';
import { CurrentSessionService, CurrentSessionStatus } from '@domains/identity-access';

export const sessionExpiryInterceptor: HttpInterceptorFn = (req, next) => {
  const currentSessionService = inject(CurrentSessionService);
  const sessionExpiryService = inject(SessionExpiryService);

  return next(req).pipe(
    tap({
      error: (err: unknown) => {
        if (
          err instanceof HttpErrorResponse &&
          err.status === 401 &&
          currentSessionService.status() === CurrentSessionStatus.Authenticated
        ) {
          sessionExpiryService.handle();
        }
      },
    }),
  );
};
