import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { apiBaseUrl, resourcesBaseUrl } from '../environments/environment';

import { routes } from './app.routes';

import { provideCurrentSessionRestore } from '@core/app-initializers/restore-current-session.initializer';
import { apiRequestInterceptor } from '@core/http/api-request.interceptor';
import { httpTimeoutInterceptor } from '@core/http/http-timeout.interceptor';
import { sessionExpiryInterceptor } from '@core/http/session-expiry.interceptor';
import { PRIMEUI_LICENSE } from '@core/primeui-license.constants';
import { API_BASE_URL, RESOURCES_BASE_URL } from '@core/tokens';
import { provideChats } from '@domains/chats';
import { provideUsers } from '@domains/users';
import { NOTIFIER } from '@shared/notifications';
import { ToastService } from '@shared/ui/toast/toast-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ theme: { preset: Aura }, license: PRIMEUI_LICENSE }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withXhr(),
      withInterceptors([apiRequestInterceptor, httpTimeoutInterceptor, sessionExpiryInterceptor]),
    ),
    {
      provide: API_BASE_URL,
      useValue: apiBaseUrl,
    },
    {
      provide: RESOURCES_BASE_URL,
      useValue: resourcesBaseUrl,
    },
    {
      provide: NOTIFIER,
      useExisting: ToastService,
    },
    provideUsers(),
    provideChats(),
    provideCurrentSessionRestore(),
  ],
};
