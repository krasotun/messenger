import { inject, Injectable } from '@angular/core';

import { createAuthFlowState } from '../create-auth-flow-state';
import { CurrentSessionService } from '../current-session/current-session.service';
import { USER_GATEWAY } from '../user.gateway';

import { ChangeAvatarInput } from './change-avatar.input';

import { ApplicationError } from '@shared/errors';

@Injectable()
export class ChangeAvatarService {
  private readonly _userGateway = inject(USER_GATEWAY);
  private readonly _currentSessionService = inject(CurrentSessionService);

  private readonly _flow = createAuthFlowState();

  readonly status = this._flow.status;
  readonly errorMessage = this._flow.errorMessage;

  readonly isSubmitting = this._flow.isSubmitting;

  changeAvatar(changeAvatarInput: ChangeAvatarInput): void {
    this._flow.startSubmitting();

    this._userGateway.changeAvatar(changeAvatarInput).subscribe({
      next: ({ user }) => {
        this._currentSessionService.updateCurrentUser(user);
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
