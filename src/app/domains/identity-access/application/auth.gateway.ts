import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { CurrentSessionResult } from './current-session/current-session-result';
import { SignInInput } from './sign-in/sign-in.input';
import { SignInResult } from './sign-in/sign-in.result';
import { SignUpInput } from './sign-up/sign-up.input';
import { SignUpResult } from './sign-up/sign-up.result';

export interface AuthGateway {
  signUp(input: SignUpInput): Observable<SignUpResult>;
  signIn(input: SignInInput): Observable<SignInResult>;
  currentSession(): Observable<CurrentSessionResult>;
  logout(): Observable<void>;
}

export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AUTH_GATEWAY');
