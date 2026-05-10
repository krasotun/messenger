import { computed, inject, Injectable, signal } from '@angular/core';

import { AUTH_GATEWAY } from '../auth.gateway';

import { SignUpInput } from '@app/domains/identity-access/application/sign-up/sign-up.input';
import { ApplicationError } from '@app/shared/errors';
import { Nullable } from '@shared/types';

export enum SignUpStatus {
  Idle = 'idle',
  Submitting = 'submitting',
  Success = 'success',
  Error = 'error',
}

@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  readonly status = signal<SignUpStatus>(SignUpStatus.Idle);
  readonly errorMessage = signal<Nullable<string>>(null);

  readonly isSubmitting = computed(() => {
    return this.status() === SignUpStatus.Submitting;
  });

  private readonly _authGateway = inject(AUTH_GATEWAY);

  signUp(signUpInput: SignUpInput): void {
    this.errorMessage.set(null);
    this.status.set(SignUpStatus.Submitting);

    this._authGateway.signUp(signUpInput).subscribe({
      next: () => {
        this.status.set(SignUpStatus.Success);

        this.errorMessage.set(null);
      },
      error: ({ message }: ApplicationError) => {
        this.status.set(SignUpStatus.Error);

        this.errorMessage.set(message);
      },
    });
  }

  resetSignUpStatus(): void {
    this.status.set(SignUpStatus.Idle);
    this.errorMessage.set(null);
  }
}
