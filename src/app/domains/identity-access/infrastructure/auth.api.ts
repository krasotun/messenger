import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CurrentUserDto } from './current-session/current-user.dto';
import { SignInRequestDto } from './sign-in/sign-in.dto';

import { API_BASE_URL } from '@core/tokens';
import {
  SignUpRequestDto,
  SignUpResponseDto,
} from '@domains/identity-access/infrastructure/sign-up/sign-up.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private readonly _baseUrl = inject(API_BASE_URL);
  private readonly _httpClient = inject(HttpClient);

  signUp(request: SignUpRequestDto): Observable<SignUpResponseDto> {
    return this._httpClient.post<SignUpResponseDto>(`${this._baseUrl}/auth/signup`, request);
  }

  signIn(request: SignInRequestDto): Observable<string> {
    return this._httpClient.post(`${this._baseUrl}/auth/signin`, request, {
      withCredentials: true,
      responseType: 'text',
    });
  }

  currentSession(): Observable<CurrentUserDto> {
    return this._httpClient.get<CurrentUserDto>(`${this._baseUrl}/auth/user`, {
      withCredentials: true,
    });
  }

  logout(): Observable<void> {
    return this._httpClient.post<void>(`${this._baseUrl}/auth/logout`, null, {
      withCredentials: true,
    });
  }
}
