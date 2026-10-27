import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UserDto } from '../user-dto.type';

import { ChangeAvatarRequestDto } from './change-avatar-dto.type';
import { ChangePasswordRequestDto } from './change-password-dto.type';
import { FindUserRequestDto } from './search-users-dto.type';
import { UpdateProfileRequestDto } from './update-profile-dto.type';

const avatarUploadTimeoutMs = 60_000;

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private readonly _httpClient = inject(HttpClient);

  updateProfile(request: UpdateProfileRequestDto): Observable<UserDto> {
    return this._httpClient.put<UserDto>('/user/profile', request);
  }

  changeAvatar(request: ChangeAvatarRequestDto): Observable<UserDto> {
    return this._httpClient.put<UserDto>('/user/profile/avatar', request, {
      timeout: avatarUploadTimeoutMs,
    });
  }

  searchUsers(request: FindUserRequestDto): Observable<UserDto[]> {
    return this._httpClient.post<UserDto[]>('/user/search', request);
  }

  changePassword(request: ChangePasswordRequestDto): Observable<string> {
    return this._httpClient.put('/user/password', request, {
      responseType: 'text',
    });
  }
}
