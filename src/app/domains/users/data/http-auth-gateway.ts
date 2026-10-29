import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import {
  AuthGateway,
  CurrentSessionResult,
  SignInInput,
  SignInResult,
  SignUpInput,
  SignUpResult,
} from './auth-gateway';
import { CurrentSessionStatus } from './current-session-status';
import { currentUserMapper } from './internal/current-user-mapper';
import { AUTH_ERROR_MESSAGES } from './internal/error-messages';
import { signInRequestMapper } from './internal/sign-in-request-mapper';
import { SignUpResponseDto } from './internal/sign-up-dto';
import { signUpRequestMapper } from './internal/sign-up-request-mapper';
import { UserDto } from './internal/user-dto';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { toApplicationError } from '@shared/errors';

@Injectable()
export class HttpAuthGateway implements AuthGateway {
  private readonly _httpClient = inject(HttpClient);
  private readonly _resourcesBaseUrl = inject(RESOURCES_BASE_URL);

  signUp(signUpInput: SignUpInput): Observable<SignUpResult> {
    const signUpRequest = signUpRequestMapper(signUpInput);

    return this._httpClient.post<SignUpResponseDto>('/auth/signup', signUpRequest).pipe(
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

    return this._httpClient.post('/auth/signin', signInRequest, { responseType: 'text' }).pipe(
      map(() => {
        return {
          authenticated: true,
        };
      }),
      toApplicationError(AUTH_ERROR_MESSAGES.signIn),
    );
  }

  currentSession(): Observable<CurrentSessionResult> {
    return this._httpClient.get<UserDto>('/auth/user').pipe(
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
    return this._httpClient
      .post<void>('/auth/logout', null)
      .pipe(toApplicationError(AUTH_ERROR_MESSAGES.logout));
  }
}
