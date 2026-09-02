import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { apiBaseUrl, resourcesBaseUrl } from '../environments/environment';

import { routes } from './app.routes';

import { provideCurrentSessionRestore } from '@core/app-initializers/restore-current-session.initializer';
import { apiRequestInterceptor } from '@core/http/api-request.interceptor';
import { API_BASE_URL, RESOURCES_BASE_URL } from '@core/tokens';
import { provideIdentityAccess } from '@domains/identity-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiRequestInterceptor])),
    {
      provide: API_BASE_URL,
      useValue: apiBaseUrl,
    },
    {
      provide: RESOURCES_BASE_URL,
      useValue: resourcesBaseUrl,
    },
    provideIdentityAccess(),
    provideCurrentSessionRestore(),
  ],
};
