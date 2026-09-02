import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { ChangePasswordInput } from '../application/change-password/change-password.input';
import { ChangePasswordResult } from '../application/change-password/change-password.result';
import { UpdateProfileInput } from '../application/update-profile/update-profile.input';
import { UpdateProfileResult } from '../application/update-profile/update-profile.result';
import { UserGateway } from '../application/user.gateway';

import { mapAuthError } from './auth-error.mapper';
import { changePasswordRequestMapper } from './change-password/change-password-request.mapper';
import { currentUserMapper } from './current-session/current-user.mapper';
import { updateProfileRequestMapper } from './update-profile/update-profile-request.mapper';
import { UserApi } from './user.api';

import { RESOURCES_BASE_URL } from '@core/tokens';

@Injectable()
export class HttpUserGateway implements UserGateway {
  private readonly _userApi = inject(UserApi);
  private readonly _resourcesBaseUrl = inject(RESOURCES_BASE_URL);

  updateProfile(updateProfileInput: UpdateProfileInput): Observable<UpdateProfileResult> {
    const updateProfileRequest = updateProfileRequestMapper(updateProfileInput);

    return this._userApi.updateProfile(updateProfileRequest).pipe(
      map((response) => {
        return {
          user: currentUserMapper(response, this._resourcesBaseUrl),
        };
      }),
      catchError((error) => {
        return throwError(() => mapAuthError(error, 'Failed to update profile. Please try again.'));
      }),
    );
  }

  changePassword(changePasswordInput: ChangePasswordInput): Observable<ChangePasswordResult> {
    const changePasswordRequest = changePasswordRequestMapper(changePasswordInput);

    return this._userApi.changePassword(changePasswordRequest).pipe(
      map(() => {
        return {
          passwordChanged: true,
        };
      }),
      catchError((error) => {
        return throwError(() =>
          mapAuthError(error, 'Failed to change password. Please try again.'),
        );
      }),
    );
  }
}
