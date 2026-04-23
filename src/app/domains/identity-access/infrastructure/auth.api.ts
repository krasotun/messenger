import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@app/core/tokens/api-base-url.token';
import {
  SignUpRequestDto,
  SignUpResponseDto,
} from '@domains/identity-access/infrastructure/sign-up.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private readonly _baseUrl = inject(API_BASE_URL);
  private readonly _httpClient = inject(HttpClient);

  signUp(request: SignUpRequestDto): Observable<SignUpResponseDto> {
    return this._httpClient.post<SignUpResponseDto>(`${this._baseUrl}/auth/signup`, request);
  }
}
