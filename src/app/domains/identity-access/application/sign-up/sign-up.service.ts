import { inject, Injectable } from '@angular/core';

import { AUTH_GATEWAY } from '../auth.gateway';
import { createAuthFlowState } from '../create-auth-flow-state';

import { SignUpInput } from '@domains/identity-access/application/sign-up/sign-up-input.type';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  private readonly _authGateway = inject(AUTH_GATEWAY);
  private readonly _notifier = inject(NOTIFIER);
  private readonly _flow = createAuthFlowState();

  readonly status = this._flow.status;

  readonly isSubmitting = this._flow.isSubmitting;

  signUp(signUpInput: SignUpInput): void {
    this._flow.startSubmitting();

    this._authGateway.signUp(signUpInput).subscribe({
      next: () => {
        this._flow.markSuccess();
      },
      error: ({ message }: ApplicationError) => {
        this._flow.markError();
        this._notifier.error('Sign-up failed', message);
      },
    });
  }

  reset(): void {
    this._flow.reset();
  }
}
