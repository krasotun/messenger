import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { AuthGateway } from '../application/auth.gateway';
import { SignUpInput } from '../application/sign-up/sign-up.input';
import { SignUpResult } from '../application/sign-up/sign-up.result';

import { AuthApi } from './auth.api';
import { signUpRequestMapper } from './sign-up/sign-up-request.mapper';

import { ApplicationError } from '@app/shared/errors';

@Injectable()
export class HttpAuthGateway implements AuthGateway {
  private readonly _authApi = inject(AuthApi);

  signUp(signUpInput: SignUpInput): Observable<SignUpResult> {
    const signUpRequest = signUpRequestMapper(signUpInput);

    return this._authApi.signUp(signUpRequest).pipe(
      map(({ id }) => {
        return {
          userId: id,
        };
      }),
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.error?.reason) {
          return throwError(() => new ApplicationError(error.error.reason, error));
        }
        return throwError(
          () => new ApplicationError('Failed to sign up. Please try again.', error),
        );
      }),
    );
  }
}
