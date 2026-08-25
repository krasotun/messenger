import { computed, inject, Injectable, signal } from '@angular/core';

import { createAuthFlowState } from '../create-auth-flow-state';
import { CurrentSessionService } from '../current-session/current-session.service';
import { CurrentUser } from '../current-session/current-user';
import { USER_GATEWAY } from '../user.gateway';

import { UpdateProfileInput } from './update-profile.input';

import { ApplicationError } from '@shared/errors';
import { Nullable } from '@shared/types';

const emptyInitialValues: UpdateProfileInput = {
  firstName: '',
  secondName: '',
  displayName: '',
  login: '',
  email: '',
  phone: '',
};

@Injectable({
  providedIn: 'root',
})
export class UpdateProfileService {
  private readonly _userGateway = inject(USER_GATEWAY);
  private readonly _currentSessionService = inject(CurrentSessionService);

  private readonly _flow = createAuthFlowState();

  readonly status = this._flow.status;
  readonly errorMessage = this._flow.errorMessage;

  readonly isSubmitting = this._flow.isSubmitting;

  private readonly _updatedUser = signal<Nullable<CurrentUser>>(null);
  readonly updatedUser = this._updatedUser.asReadonly();

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
        this._updatedUser.set(user);
        this._flow.markSuccess();
      },
      error: ({ message }: ApplicationError) => {
        this._flow.markError(message);
      },
    });
  }

  reset(): void {
    this._updatedUser.set(null);
    this._flow.reset();
  }
}
