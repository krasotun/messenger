import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';

import { SignUpInput } from '@domains/identity-access/application/sign-up.input';
import { AuthApi } from '@domains/identity-access/infrastructure/auth.api';
import { signUpRequestMapper } from '@domains/identity-access/infrastructure/sign-up-request.mapper';
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

  private readonly _authApi = inject(AuthApi);

  signUp(signUpInput: SignUpInput): void {
    const signUpRequest = signUpRequestMapper(signUpInput);

    this.errorMessage.set(null);
    this.status.set(SignUpStatus.Submitting);

    this._authApi.signUp(signUpRequest).subscribe({
      next: () => {
        this.status.set(SignUpStatus.Success);
        this.errorMessage.set(null);
      },
      error: (error) => {
        this.status.set(SignUpStatus.Error);

        if (error instanceof HttpErrorResponse && error.error?.reason) {
          this.errorMessage.set(error.error.reason);
        } else {
          this.errorMessage.set('Failed to sign up. Please try again.');
        }
      },
    });
  }
}
