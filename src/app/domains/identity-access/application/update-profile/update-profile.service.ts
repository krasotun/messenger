import { computed, inject, Injectable } from '@angular/core';

import { createAuthFlowState } from '../create-auth-flow-state';
import { CurrentSessionService } from '../current-session/current-session.service';
import { USER_GATEWAY } from '../user.gateway';

import { UpdateProfileInput } from './update-profile-input.type';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

const emptyInitialValues: UpdateProfileInput = {
  firstName: '',
  secondName: '',
  displayName: '',
  login: '',
  email: '',
  phone: '',
};

@Injectable()
export class UpdateProfileService {
  private readonly _userGateway = inject(USER_GATEWAY);
  private readonly _currentSessionService = inject(CurrentSessionService);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _flow = createAuthFlowState();

  readonly isSubmitting = this._flow.isSubmitting;

  readonly succeeded$ = this._flow.succeeded$;

  readonly initialValues = computed<UpdateProfileInput>(() => {
    const currentUser = this._currentSessionService.currentUser();

    if (!currentUser) {
      return emptyInitialValues;
    }

    const { firstName, secondName, displayName, login, email, phone } = currentUser;

    return {
      firstName,
      secondName,
      displayName: displayName ?? '',
      login,
      email,
      phone,
    };
  });

  updateProfile(updateProfileInput: UpdateProfileInput): void {
    this._flow.startSubmitting();

    this._userGateway.updateProfile(updateProfileInput).subscribe({
      next: ({ user }) => {
        this._currentSessionService.updateCurrentUser(user);
        this._flow.markSuccess();
        this._notifier.success('Update profile', 'Profile updated successfully');
      },
      error: ({ message }: ApplicationError) => {
        this._flow.markError();
        this._notifier.error('Failed to update profile', message);
      },
    });
  }
}
