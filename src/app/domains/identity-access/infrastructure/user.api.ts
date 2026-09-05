import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ChangeAvatarRequestDto } from './change-avatar/change-avatar.dto';
import { ChangePasswordRequestDto } from './change-password/change-password.dto';
import { CurrentUserDto } from './current-session/current-user.dto';
import { FindUserRequestDto, UserDto } from './search-users/search-users.dto';
import { UpdateProfileRequestDto } from './update-profile/update-profile.dto';

const avatarUploadTimeoutMs = 60_000;

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private readonly _httpClient = inject(HttpClient);

  updateProfile(request: UpdateProfileRequestDto): Observable<CurrentUserDto> {
    return this._httpClient.put<CurrentUserDto>('/user/profile', request);
  }

  changeAvatar(request: ChangeAvatarRequestDto): Observable<CurrentUserDto> {
    return this._httpClient.put<CurrentUserDto>('/user/profile/avatar', request, {
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
