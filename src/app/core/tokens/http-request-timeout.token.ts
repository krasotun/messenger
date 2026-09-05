import { InjectionToken } from '@angular/core';

export const HTTP_REQUEST_TIMEOUT_MS = new InjectionToken<number>('HTTP_REQUEST_TIMEOUT_MS', {
  providedIn: 'root',
  factory: () => 10_000,
});
