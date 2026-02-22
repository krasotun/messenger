import { Routes } from '@angular/router';

import { SignInPage } from './pages/sign-in/sign-in-page';
import { SignUpPage } from './pages/sign-up/sign-up-page';

export const routes: Routes = [
  {
    path: 'sign-in',
    component: SignInPage,
  },
  {
    path: 'sign-up',
    component: SignUpPage,
  },
];
