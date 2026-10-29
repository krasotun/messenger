import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { changeAvatarRequestMapper } from './internal/change-avatar-request-mapper';
import { changePasswordRequestMapper } from './internal/change-password-request-mapper';
import { currentUserMapper } from './internal/current-user-mapper';
import { USER_ERROR_MESSAGES } from './internal/error-messages';
import { FindUserRequestDto } from './internal/search-users-dto';
import { updateProfileRequestMapper } from './internal/update-profile-request-mapper';
import { UserDto } from './internal/user-dto';
import { userMapper } from './internal/user-mapper';
import {
  ChangePasswordResult,
  ChangePasswordInput,
  ChangeAvatarResult,
  ChangeAvatarInput,
  SearchUsersInput,
  SearchUsersResult,
  UpdateProfileInput,
  UpdateProfileResult,
  UserGateway,
} from './user-gateway';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { toApplicationError } from '@shared/errors';

const avatarUploadTimeoutMs = 60_000;

@Injectable()
export class HttpUserGateway implements UserGateway {
  private readonly _httpClient = inject(HttpClient);
  private readonly _resourcesBaseUrl = inject(RESOURCES_BASE_URL);

  updateProfile(updateProfileInput: UpdateProfileInput): Observable<UpdateProfileResult> {
    const updateProfileRequest = updateProfileRequestMapper(updateProfileInput);

    return this._httpClient.put<UserDto>('/user/profile', updateProfileRequest).pipe(
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

    return this._httpClient
      .put<UserDto>('/user/profile/avatar', changeAvatarRequest, {
        timeout: avatarUploadTimeoutMs,
      })
      .pipe(
        map((response) => {
          return {
            user: currentUserMapper(response, this._resourcesBaseUrl),
          };
        }),
        toApplicationError(USER_ERROR_MESSAGES.changeAvatar),
      );
  }

  searchUsers({ login }: SearchUsersInput): Observable<SearchUsersResult> {
    const request: FindUserRequestDto = { login };

    return this._httpClient.post<UserDto[]>('/user/search', request).pipe(
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

    return this._httpClient
      .put('/user/password', changePasswordRequest, { responseType: 'text' })
      .pipe(
        map(() => {
          return {
            passwordChanged: true,
          };
        }),
        toApplicationError(USER_ERROR_MESSAGES.changePassword),
      );
  }
}
