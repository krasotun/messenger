import { Routes } from '@angular/router';

import { authenticatedOnlyGuard } from './core/routing/authenticated-only.guard';
import { guestOnlyGuard } from './core/routing/guest-only.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authenticatedOnlyGuard],
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
  },
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
];
