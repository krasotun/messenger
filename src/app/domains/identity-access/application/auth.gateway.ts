import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { SignUpInput } from './sign-up/sign-up.input';
import { SignUpResult } from './sign-up/sign-up.result';

export interface AuthGateway {
  signUp(input: SignUpInput): Observable<SignUpResult>;
}

export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AUTH_GATEWAY');
