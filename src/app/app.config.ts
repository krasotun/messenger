import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { apiBaseUrl } from '../environments/environment';

import { routes } from './app.routes';
import { AUTH_GATEWAY } from './domains/identity-access/application/auth.gateway';
import { HttpAuthGateway } from './domains/identity-access/infrastructure/http-auth-gateway';

import { API_BASE_URL } from '@app/core/tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: API_BASE_URL,
      useValue: apiBaseUrl,
    },
    {
      provide: AUTH_GATEWAY,
      useClass: HttpAuthGateway,
    },
  ],
};
