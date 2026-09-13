import { inject, Injectable } from '@angular/core';
import { switchMap } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';
import { CurrentSessionStatus } from '../current-session/current-session-status.type';
import { CurrentSessionService } from '../current-session/current-session.service';

import { SignInInput } from './sign-in-input.type';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createFormSubmitFlowState } from '@shared/submit-flow';

@Injectable({
  providedIn: 'root',
})
export class SignInService {
  private readonly _authGateway = inject(AUTH_GATEWAY);
  private readonly _currentSessionService = inject(CurrentSessionService);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _flow = createFormSubmitFlowState();

  readonly isSubmitting = this._flow.isSubmitting;

  readonly succeeded$ = this._flow.succeeded$;

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

          this._flow.markError();
          this._notifier.error('Sign-in failed', 'Login failed. Please try again later');
        },
        error: ({ message }: ApplicationError) => {
          this._flow.markError();
          this._notifier.error('Sign-in failed', message);
        },
      });
  }
}
