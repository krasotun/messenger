import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from '@core/tokens';

const isApiRequest = (url: string): boolean => {
  return url.startsWith('/');
};

export const apiRequestInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isApiRequest(request.url)) {
    return next(request);
  }

  const baseUrl = inject(API_BASE_URL);

  const apiRequest = request.clone({
    url: `${baseUrl}${request.url}`,
    withCredentials: true,
  });

  return next(apiRequest);
};
