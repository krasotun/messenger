import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { ChangeAvatarInput } from '../application/change-avatar/change-avatar.input';
import { ChangeAvatarResult } from '../application/change-avatar/change-avatar.result';
import { ChangePasswordInput } from '../application/change-password/change-password.input';
import { ChangePasswordResult } from '../application/change-password/change-password.result';
import { SearchUsersInput } from '../application/search-users/search-users.input';
import { SearchUsersResult } from '../application/search-users/search-users.result';
import { UpdateProfileInput } from '../application/update-profile/update-profile.input';
import { UpdateProfileResult } from '../application/update-profile/update-profile.result';
import { UserGateway } from '../application/user.gateway';

import { mapAuthError } from './auth-error.mapper';
import { changeAvatarRequestMapper } from './change-avatar/change-avatar-request.mapper';
import { changePasswordRequestMapper } from './change-password/change-password-request.mapper';
import { currentUserMapper } from './current-session/current-user.mapper';
import { userMapper } from './search-users/user.mapper';
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

  changeAvatar(changeAvatarInput: ChangeAvatarInput): Observable<ChangeAvatarResult> {
    const changeAvatarRequest = changeAvatarRequestMapper(changeAvatarInput);

    return this._userApi.changeAvatar(changeAvatarRequest).pipe(
      map((response) => {
        return {
          user: currentUserMapper(response, this._resourcesBaseUrl),
        };
      }),
      catchError((error) => {
        return throwError(() => mapAuthError(error, 'Failed to change avatar. Please try again.'));
      }),
    );
  }

  searchUsers({ login }: SearchUsersInput): Observable<SearchUsersResult> {
    return this._userApi.searchUsers({ login }).pipe(
      map((response) => {
        return {
          users: response.map((userDto) => userMapper(userDto, this._resourcesBaseUrl)),
        };
      }),
      catchError((error) => {
        return throwError(() => mapAuthError(error, 'Failed to search users. Please try again.'));
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
