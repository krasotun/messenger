import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { AuthGateway } from './auth-gateway';
import { CurrentSessionResult } from './current-session-result';
import { CurrentSessionStatus } from './current-session-status';
import { AuthApi } from './internal/auth-api';
import { currentUserMapper } from './internal/current-user-mapper';
import { AUTH_ERROR_MESSAGES } from './internal/error-messages';
import { signInRequestMapper } from './internal/sign-in-request-mapper';
import { signUpRequestMapper } from './internal/sign-up-request-mapper';
import { SignInInput } from './sign-in-input';
import { SignInResult } from './sign-in-result';
import { SignUpInput } from './sign-up-input';
import { SignUpResult } from './sign-up-result';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { toApplicationError } from '@shared/errors';

@Injectable()
export class HttpAuthGateway implements AuthGateway {
  private readonly _authApi = inject(AuthApi);
  private readonly _resourcesBaseUrl = inject(RESOURCES_BASE_URL);

  signUp(signUpInput: SignUpInput): Observable<SignUpResult> {
    const signUpRequest = signUpRequestMapper(signUpInput);

    return this._authApi.signUp(signUpRequest).pipe(
      map(({ id }) => {
        return {
          userId: id,
        };
      }),
      toApplicationError(AUTH_ERROR_MESSAGES.signUp),
    );
  }

  signIn(signInInput: SignInInput): Observable<SignInResult> {
    const signInRequest = signInRequestMapper(signInInput);

    return this._authApi.signIn(signInRequest).pipe(
      map(() => {
        return {
          authenticated: true,
        };
      }),
      toApplicationError(AUTH_ERROR_MESSAGES.signIn),
    );
  }

  currentSession(): Observable<CurrentSessionResult> {
    return this._authApi.currentSession().pipe(
      map((response) => {
        const result: CurrentSessionResult = {
          status: CurrentSessionStatus.Authenticated,
          user: currentUserMapper(response, this._resourcesBaseUrl),
        };

        return result;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const result: CurrentSessionResult = {
            status: CurrentSessionStatus.Anonymous,
          };
          return of(result);
        }

        return throwError(() => error);
      }),
      toApplicationError(AUTH_ERROR_MESSAGES.currentSession),
    );
  }

  logout(): Observable<void> {
    return this._authApi.logout().pipe(toApplicationError(AUTH_ERROR_MESSAGES.logout));
  }
}
