import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { AuthGateway } from '../application/auth.gateway';
import { CurrentSessionResult } from '../application/current-session/current-session-result';
import { CurrentSessionStatus } from '../application/current-session/current-session-status';
import { SignInInput } from '../application/sign-in/sign-in.input';
import { SignInResult } from '../application/sign-in/sign-in.result';
import { SignUpInput } from '../application/sign-up/sign-up.input';
import { SignUpResult } from '../application/sign-up/sign-up.result';

import { AuthApi } from './auth.api';
import { currentUserMapper } from './current-session/current-user.mapper';
import { signInRequestMapper } from './sign-in/sign-in-request.mapper';
import { signUpRequestMapper } from './sign-up/sign-up-request.mapper';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { mapHttpError } from '@shared/errors';

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
      catchError((error) => {
        return throwError(() => mapHttpError(error, 'Failed to sign up. Please try again.'));
      }),
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
      catchError((error) => {
        return throwError(() => mapHttpError(error, 'Failed to sign in. Please try again.'));
      }),
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

        return throwError(() => mapHttpError(error, 'Failed to load session. Please try again.'));
      }),
    );
  }

  logout(): Observable<void> {
    return this._authApi
      .logout()
      .pipe(
        catchError((error) =>
          throwError(() => mapHttpError(error, 'Failed to logout. Please try again.')),
        ),
      );
  }
}
