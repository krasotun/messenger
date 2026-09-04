import { Routes } from '@angular/router';

import { authenticatedOnlyGuard } from '@core/routing/authenticated-only.guard';
import { guestOnlyGuard } from '@core/routing/guest-only.guard';

export const routes: Routes = [
  {
    path: 'sign-in',
    canActivate: [guestOnlyGuard],
    loadComponent: () =>
      import('@domains/identity-access/presentation/sign-in-page/sign-in-page').then(
        (m) => m.SignInPage,
      ),
  },
  {
    path: 'sign-up',
    canActivate: [guestOnlyGuard],
    loadComponent: () =>
      import('@domains/identity-access/presentation/sign-up-page/sign-up-page').then(
        (m) => m.SignUpPage,
      ),
  },
  {
    path: '',
    canActivate: [authenticatedOnlyGuard],
    loadComponent: () =>
      import('./core/layouts/authenticated-shell/authenticated-shell').then(
        (m) => m.AuthenticatedShell,
      ),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/chats-page/chats-page').then((m) => m.ChatsPage),
        children: [
          {
            path: ':chatId',
            loadComponent: () =>
              import('@domains/chats/presentation/selected-chat-header/selected-chat-header').then(
                (m) => m.SelectedChatHeader,
              ),
          },
        ],
      },
    ],
  },
];
