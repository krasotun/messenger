import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SignInRequestDto } from './sign-in-dto';
import { SignUpRequestDto, SignUpResponseDto } from './sign-up-dto';
import { UserDto } from './user-dto';

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

  currentSession(): Observable<UserDto> {
    return this._httpClient.get<UserDto>('/auth/user');
  }

  logout(): Observable<void> {
    return this._httpClient.post<void>('/auth/logout', null);
  }
}
