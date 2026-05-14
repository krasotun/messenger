import { computed, inject, Injectable, signal } from '@angular/core';

import { AuthFlowStatus } from '../auth-flow-status';
import { AUTH_GATEWAY } from '../auth.gateway';

import { SignUpInput } from '@app/domains/identity-access/application/sign-up/sign-up.input';
import { ApplicationError } from '@app/shared/errors';
import { Nullable } from '@shared/types';
@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  readonly status = signal<AuthFlowStatus>(AuthFlowStatus.Idle);
  readonly errorMessage = signal<Nullable<string>>(null);

  readonly isSubmitting = computed(() => {
    return this.status() === AuthFlowStatus.Submitting;
  });

  private readonly _authGateway = inject(AUTH_GATEWAY);

  signUp(signUpInput: SignUpInput): void {
    this.errorMessage.set(null);
    this.status.set(AuthFlowStatus.Submitting);

    this._authGateway.signUp(signUpInput).subscribe({
      next: () => {
        this.status.set(AuthFlowStatus.Success);

        this.errorMessage.set(null);
      },
      error: ({ message }: ApplicationError) => {
        this.status.set(AuthFlowStatus.Error);

        this.errorMessage.set(message);
      },
    });
  }

  resetSignUpStatus(): void {
    this.status.set(AuthFlowStatus.Idle);
    this.errorMessage.set(null);
  }
}
