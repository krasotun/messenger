import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { SignInInput } from './sign-in/sign-in.input';
import { SignInResult } from './sign-in/sign-in.result';
import { SignUpInput } from './sign-up/sign-up.input';
import { SignUpResult } from './sign-up/sign-up.result';

export interface AuthGateway {
  signUp(input: SignUpInput): Observable<SignUpResult>;
  signIn(input: SignInInput): Observable<SignInResult>;
}

export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AUTH_GATEWAY');
