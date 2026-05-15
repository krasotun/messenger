import { computed, inject, Injectable, signal } from '@angular/core';

import { AuthFlowStatus } from '../auth-flow-status';
import { AUTH_GATEWAY } from '../auth.gateway';

import { SignInInput } from './sign-in.input';

import { ApplicationError } from '@app/shared/errors';
import { Nullable } from '@app/shared/types';

@Injectable({
  providedIn: 'root',
})
export class SignInService {
  readonly status = signal<AuthFlowStatus>(AuthFlowStatus.Idle);

  readonly errorMessage = signal<Nullable<string>>(null);

  readonly isSubmitting = computed(() => {
    return this.status() === AuthFlowStatus.Submitting;
  });

  private readonly _authGateway = inject(AUTH_GATEWAY);

  signIn(signInInput: SignInInput): void {
    this.errorMessage.set(null);
    this.status.set(AuthFlowStatus.Submitting);

    this._authGateway.signIn(signInInput).subscribe({
      next: () => {
        this.status.set(AuthFlowStatus.Success);
      },

      error: ({ message }: ApplicationError) => {
        this.status.set(AuthFlowStatus.Error);

        this.errorMessage.set(message);
      },
    });
  }

  resetSignInStatus(): void {
    this.status.set(AuthFlowStatus.Idle);
    this.errorMessage.set(null);
  }
}
