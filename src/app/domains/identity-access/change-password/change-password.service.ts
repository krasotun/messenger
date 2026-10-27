import { inject, Injectable } from '@angular/core';

import { USER_GATEWAY } from '../user.gateway';

import { ChangePasswordInput } from './change-password-input.type';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createFormSubmitFlowState } from '@shared/submit-flow';

@Injectable()
export class ChangePasswordService {
  private readonly _userGateway = inject(USER_GATEWAY);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _flow = createFormSubmitFlowState();

  readonly isSubmitting = this._flow.isSubmitting;

  readonly succeeded$ = this._flow.succeeded$;

  changePassword(changePasswordInput: ChangePasswordInput): void {
    this._flow.startSubmitting();

    this._userGateway.changePassword(changePasswordInput).subscribe({
      next: () => {
        this._flow.markSuccess();
        this._notifier.success('Change password', 'Password changed successfully');
      },
      error: ({ message }: ApplicationError) => {
        this._flow.markError();
        this._notifier.error('Failed to change password', message);
      },
    });
  }
}
