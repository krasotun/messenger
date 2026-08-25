import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CurrentUserDto } from './current-session/current-user.dto';
import { UpdateProfileRequestDto } from './update-profile/update-profile.dto';

import { API_BASE_URL } from '@core/tokens';

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private readonly _baseUrl = inject(API_BASE_URL);
  private readonly _httpClient = inject(HttpClient);

  updateProfile(request: UpdateProfileRequestDto): Observable<CurrentUserDto> {
    return this._httpClient.put<CurrentUserDto>(`${this._baseUrl}/user/profile`, request, {
      withCredentials: true,
    });
  }
}
