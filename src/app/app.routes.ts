import { Routes } from '@angular/router';

import { SignInPage } from '@domains/identity-access/presentation/sign-in-page/sign-in-page';
import { SignUpPage } from '@domains/identity-access/presentation/sign-up-page/sign-up-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'sign-up',
  },
  {
    path: 'sign-in',
    component: SignInPage,
  },
  {
    path: 'sign-up',
    component: SignUpPage,
  },
];
