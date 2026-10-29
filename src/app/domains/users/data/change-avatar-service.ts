import { inject, Injectable } from '@angular/core';

import { CurrentSessionStore } from './current-session-store';
import { ChangeAvatarInput, USER_GATEWAY } from './user-gateway';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createFormSubmitFlowState } from '@shared/submit-flow';

@Injectable()
export class ChangeAvatarService {
  private readonly _userGateway = inject(USER_GATEWAY);
  private readonly _currentSessionStore = inject(CurrentSessionStore);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _flow = createFormSubmitFlowState();

  readonly isSubmitting = this._flow.isSubmitting;

  readonly succeeded$ = this._flow.succeeded$;

  changeAvatar(changeAvatarInput: ChangeAvatarInput): void {
    this._flow.startSubmitting();

    this._userGateway.changeAvatar(changeAvatarInput).subscribe({
      next: ({ user }) => {
        this._currentSessionStore.updateCurrentUser(user);
        this._flow.markSuccess();
        this._notifier.success('Change avatar', 'Avatar changed successfully');
      },
      error: ({ message }: ApplicationError) => {
        this._flow.markError();
        this._notifier.error('Failed to change avatar', message);
      },
    });
  }
}
