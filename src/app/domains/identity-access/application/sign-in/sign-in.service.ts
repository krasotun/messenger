import { inject, Injectable } from '@angular/core';

import { AUTH_GATEWAY } from '../auth.gateway';
import { createAuthFlowState } from '../create-auth-flow-state';

import { SignInInput } from './sign-in.input';

import { ApplicationError } from '@app/shared/errors';

@Injectable({
  providedIn: 'root',
})
export class SignInService {
  private readonly _authGateway = inject(AUTH_GATEWAY);
  private readonly _flow = createAuthFlowState();

  readonly status = this._flow.status;
  readonly errorMessage = this._flow.errorMessage;

  readonly isSubmitting = this._flow.isSubmitting;

  signIn(signInInput: SignInInput): void {
    this._flow.startSubmitting();

    this._authGateway.signIn(signInInput).subscribe({
      next: () => {
        this._flow.markSuccess();
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
