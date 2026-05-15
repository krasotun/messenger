import { inject, Injectable } from '@angular/core';

import { AUTH_GATEWAY } from '../auth.gateway';
import { createAuthFlowState } from '../create-auth-flow-state';

import { SignUpInput } from '@app/domains/identity-access/application/sign-up/sign-up.input';
import { ApplicationError } from '@app/shared/errors';

@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  private readonly _authGateway = inject(AUTH_GATEWAY);
  private readonly _flow = createAuthFlowState();

  readonly status = this._flow.status;
  readonly errorMessage = this._flow.errorMessage;

  readonly isSubmitting = this._flow.isSubmitting;

  signUp(signUpInput: SignUpInput): void {
    this._flow.startSubmitting();

    this._authGateway.signUp(signUpInput).subscribe({
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
