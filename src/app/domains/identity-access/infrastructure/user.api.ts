import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ChangePasswordRequestDto } from './change-password/change-password.dto';
import { CurrentUserDto } from './current-session/current-user.dto';
import { UpdateProfileRequestDto } from './update-profile/update-profile.dto';

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private readonly _httpClient = inject(HttpClient);

  updateProfile(request: UpdateProfileRequestDto): Observable<CurrentUserDto> {
    return this._httpClient.put<CurrentUserDto>('/user/profile', request);
  }

  changePassword(request: ChangePasswordRequestDto): Observable<string> {
    return this._httpClient.put('/user/password', request, {
      responseType: 'text',
    });
  }
}
