import { computed, inject, Injectable } from '@angular/core';

import { CurrentSessionStore } from './current-session-store';
import { UpdateProfileInput, USER_GATEWAY } from './user-gateway';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createFormSubmitFlowState } from '@shared/submit-flow';

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
  private readonly _currentSessionStore = inject(CurrentSessionStore);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _flow = createFormSubmitFlowState();

  readonly isSubmitting = this._flow.isSubmitting;

  readonly succeeded$ = this._flow.succeeded$;

  readonly initialValues = computed<UpdateProfileInput>(() => {
    const currentUser = this._currentSessionStore.currentUser();

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
        this._currentSessionStore.updateCurrentUser(user);
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
