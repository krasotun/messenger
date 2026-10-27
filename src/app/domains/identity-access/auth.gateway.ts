import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { CurrentSessionResult } from './current-session/current-session-result.type';
import { SignInInput } from './sign-in/sign-in-input.type';
import { SignInResult } from './sign-in/sign-in-result.type';
import { SignUpInput } from './sign-up/sign-up-input.type';
import { SignUpResult } from './sign-up/sign-up-result.type';

export interface AuthGateway {
  signUp(input: SignUpInput): Observable<SignUpResult>;
  signIn(input: SignInInput): Observable<SignInResult>;
  currentSession(): Observable<CurrentSessionResult>;
  logout(): Observable<void>;
}

export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AUTH_GATEWAY');
