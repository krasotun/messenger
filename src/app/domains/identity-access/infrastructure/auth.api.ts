import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CurrentUserDto } from './current-session/current-user-dto.type';
import { SignInRequestDto } from './sign-in/sign-in-dto.type';
import { SignUpRequestDto, SignUpResponseDto } from './sign-up/sign-up-dto.type';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private readonly _httpClient = inject(HttpClient);

  signUp(request: SignUpRequestDto): Observable<SignUpResponseDto> {
    return this._httpClient.post<SignUpResponseDto>('/auth/signup', request);
  }

  signIn(request: SignInRequestDto): Observable<string> {
    return this._httpClient.post('/auth/signin', request, {
      responseType: 'text',
    });
  }

  currentSession(): Observable<CurrentUserDto> {
    return this._httpClient.get<CurrentUserDto>('/auth/user');
  }

  logout(): Observable<void> {
    return this._httpClient.post<void>('/auth/logout', null);
  }
}
