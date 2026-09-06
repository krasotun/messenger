import { inject, Injectable } from '@angular/core';

import { createAuthFlowState } from '../create-auth-flow-state';
import { USER_GATEWAY } from '../user.gateway';

import { ChangePasswordInput } from './change-password-input.type';

import { ApplicationError } from '@shared/errors';

@Injectable()
export class ChangePasswordService {
  private readonly _userGateway = inject(USER_GATEWAY);

  private readonly _flow = createAuthFlowState();

  readonly status = this._flow.status;
  readonly errorMessage = this._flow.errorMessage;

  readonly isSubmitting = this._flow.isSubmitting;

  changePassword(changePasswordInput: ChangePasswordInput): void {
    this._flow.startSubmitting();

    this._userGateway.changePassword(changePasswordInput).subscribe({
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
