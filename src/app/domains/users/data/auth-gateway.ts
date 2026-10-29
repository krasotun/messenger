import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { CurrentSessionStatus } from './current-session-status';
import { CurrentUser } from './current-user';

export interface SignUpInput {
  firstName: string;
  secondName: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

export interface SignUpResult {
  userId: number;
}

export interface SignInInput {
  login: string;
  password: string;
}

export interface SignInResult {
  authenticated: boolean;
}

export type CurrentSessionResult =
  | {
      status: CurrentSessionStatus.Authenticated;
      user: CurrentUser;
    }
  | {
      status: CurrentSessionStatus.Anonymous;
    };

export interface AuthGateway {
  signUp(input: SignUpInput): Observable<SignUpResult>;
  signIn(input: SignInInput): Observable<SignInResult>;
  currentSession(): Observable<CurrentSessionResult>;
  logout(): Observable<void>;
}

export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AUTH_GATEWAY');
