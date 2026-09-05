import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ChangeAvatarInput } from '../application/change-avatar/change-avatar.input';
import { ChangeAvatarResult } from '../application/change-avatar/change-avatar.result';
import { ChangePasswordInput } from '../application/change-password/change-password.input';
import { ChangePasswordResult } from '../application/change-password/change-password.result';
import { SearchUsersInput } from '../application/search-users/search-users.input';
import { SearchUsersResult } from '../application/search-users/search-users.result';
import { UpdateProfileInput } from '../application/update-profile/update-profile.input';
import { UpdateProfileResult } from '../application/update-profile/update-profile.result';
import { UserGateway } from '../application/user.gateway';

import { changeAvatarRequestMapper } from './change-avatar/change-avatar-request.mapper';
import { changePasswordRequestMapper } from './change-password/change-password-request.mapper';
import { currentUserMapper } from './current-session/current-user.mapper';
import { USER_ERROR_MESSAGES } from './error-messages';
import { userMapper } from './search-users/user.mapper';
import { updateProfileRequestMapper } from './update-profile/update-profile-request.mapper';
import { UserApi } from './user.api';

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
