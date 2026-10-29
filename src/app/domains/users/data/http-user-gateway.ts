import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ChangeAvatarInput } from './change-avatar-input';
import { ChangeAvatarResult } from './change-avatar-result';
import { ChangePasswordInput } from './change-password-input';
import { ChangePasswordResult } from './change-password-result';
import { changeAvatarRequestMapper } from './internal/change-avatar-request-mapper';
import { changePasswordRequestMapper } from './internal/change-password-request-mapper';
import { currentUserMapper } from './internal/current-user-mapper';
import { USER_ERROR_MESSAGES } from './internal/error-messages';
import { updateProfileRequestMapper } from './internal/update-profile-request-mapper';
import { UserApi } from './internal/user-api';
import { userMapper } from './internal/user-mapper';
import { SearchUsersInput } from './search-users-input';
import { SearchUsersResult } from './search-users-result';
import { UpdateProfileInput } from './update-profile-input';
import { UpdateProfileResult } from './update-profile-result';
import { UserGateway } from './user-gateway';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { toApplicationError } from '@shared/errors';

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
      toApplicationError(USER_ERROR_MESSAGES.updateProfile),
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
      toApplicationError(USER_ERROR_MESSAGES.changeAvatar),
    );
  }

  searchUsers({ login }: SearchUsersInput): Observable<SearchUsersResult> {
    return this._userApi.searchUsers({ login }).pipe(
      map((response) => {
        return {
          users: response.map((userDto) => userMapper(userDto, this._resourcesBaseUrl)),
        };
      }),
      toApplicationError(USER_ERROR_MESSAGES.searchUsers),
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
      toApplicationError(USER_ERROR_MESSAGES.changePassword),
    );
  }
}
