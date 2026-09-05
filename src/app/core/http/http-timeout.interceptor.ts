import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { HTTP_REQUEST_TIMEOUT_MS } from '@core/tokens';

export const httpTimeoutInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.timeout !== undefined) {
    return next(request);
  }

  const timeout = inject(HTTP_REQUEST_TIMEOUT_MS);

  return next(request.clone({ timeout }));
};
