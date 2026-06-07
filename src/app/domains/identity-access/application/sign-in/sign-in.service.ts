import { inject, Injectable } from '@angular/core';
import { switchMap } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';
import { createAuthFlowState } from '../create-auth-flow-state';
import { CurrentSessionStatus } from '../current-session/current-session-status';
import { CurrentSessionService } from '../current-session/current-session.service';

import { SignInInput } from './sign-in.input';

import { ApplicationError } from '@shared/errors';

@Injectable({
  providedIn: 'root',
})
export class SignInService {
  private readonly _authGateway = inject(AUTH_GATEWAY);
  private readonly _currentSessionService = inject(CurrentSessionService);

  private readonly _flow = createAuthFlowState();

  readonly status = this._flow.status;
  readonly errorMessage = this._flow.errorMessage;

  readonly isSubmitting = this._flow.isSubmitting;

  signIn(signInInput: SignInInput): void {
    this._flow.startSubmitting();

    this._authGateway
      .signIn(signInInput)
      .pipe(switchMap(() => this._currentSessionService.restoreCurrentSession()))
      .subscribe({
        next: ({ status }) => {
          if (status === CurrentSessionStatus.Authenticated) {
            this._flow.markSuccess();
            return;
          }

          this._flow.markError('Login failed. Please try again later');
        },
        error: ({ message }: ApplicationError) => {
          this._flow.markError(message);
        },
      });
  }

  reset(): void {
    this._flow.reset();
  }
}
