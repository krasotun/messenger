import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { apiBaseUrl } from '../environments/environment';

import { routes } from './app.routes';

import { provideCurrentSessionRestore } from '@core/app-initializers/restore-current-session.initializer';
import { API_BASE_URL } from '@core/tokens';
import { provideIdentityAccess } from '@domains/identity-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: API_BASE_URL,
      useValue: apiBaseUrl,
    },
    provideIdentityAccess(),
    provideCurrentSessionRestore(),
  ],
};
