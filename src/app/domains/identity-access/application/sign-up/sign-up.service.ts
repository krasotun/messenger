import { inject, Injectable } from '@angular/core';

import { AUTH_GATEWAY } from '../auth.gateway';

import { SignUpInput } from '@domains/identity-access/application/sign-up/sign-up-input.type';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createFormSubmitFlowState } from '@shared/submit-flow';

@Injectable()
export class SignUpService {
  private readonly _authGateway = inject(AUTH_GATEWAY);
  private readonly _notifier = inject(NOTIFIER);
  private readonly _flow = createFormSubmitFlowState();

  readonly isSubmitting = this._flow.isSubmitting;

  readonly succeeded$ = this._flow.succeeded$;

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
}
