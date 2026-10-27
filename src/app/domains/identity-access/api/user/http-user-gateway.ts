import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ChangeAvatarInput } from '../../change-avatar/change-avatar-input.type';
import { ChangeAvatarResult } from '../../change-avatar/change-avatar-result.type';
import { ChangePasswordInput } from '../../change-password/change-password-input.type';
import { ChangePasswordResult } from '../../change-password/change-password-result.type';
import { SearchUsersInput } from '../../search-users/search-users-input.type';
import { SearchUsersResult } from '../../search-users/search-users-result.type';
import { UpdateProfileInput } from '../../update-profile/update-profile-input.type';
import { UpdateProfileResult } from '../../update-profile/update-profile-result.type';
import { UserGateway } from '../../user.gateway';
import { currentUserMapper } from '../current-user.mapper';
import { USER_ERROR_MESSAGES } from '../error-messages.constants';

import { changeAvatarRequestMapper } from './change-avatar-request.mapper';
import { changePasswordRequestMapper } from './change-password-request.mapper';
import { updateProfileRequestMapper } from './update-profile-request.mapper';
import { UserApi } from './user.api';
import { userMapper } from './user.mapper';

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
