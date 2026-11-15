import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';

import { apiBaseUrl, resourcesBaseUrl } from '../environments/environment';

import { routes } from './app.routes';

import { provideCurrentSessionRestore } from '@core/app-initializers/restore-current-session.initializer';
import { apiRequestInterceptor } from '@core/http/api-request.interceptor';
import { httpTimeoutInterceptor } from '@core/http/http-timeout.interceptor';
import { sessionExpiryInterceptor } from '@core/http/session-expiry.interceptor';
import { PRIMEUI_LICENSE } from '@core/primeui-license.constants';
import { provideDialogsCloseOnNavigation } from '@core/routing/dialogs-close-on-navigation';
import { API_BASE_URL, RESOURCES_BASE_URL } from '@core/tokens';
import { provideChats } from '@domains/chats';
import { provideUsers } from '@domains/users';
import { NOTIFIER } from '@shared/notifications';
import { PrimeNotifier } from '@shared/ui/toast/prime-notifier';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ theme: { preset: Aura }, license: PRIMEUI_LICENSE }),
    MessageService,
    ConfirmationService,
    DialogService,
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
      useExisting: PrimeNotifier,
    },
    provideUsers(),
    provideChats(),
    provideCurrentSessionRestore(),
    provideDialogsCloseOnNavigation(),
  ],
};
