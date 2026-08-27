import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { ChangePasswordInput } from './change-password/change-password.input';
import { ChangePasswordResult } from './change-password/change-password.result';
import { UpdateProfileInput } from './update-profile/update-profile.input';
import { UpdateProfileResult } from './update-profile/update-profile.result';

export interface UserGateway {
  updateProfile(input: UpdateProfileInput): Observable<UpdateProfileResult>;
  changePassword(input: ChangePasswordInput): Observable<ChangePasswordResult>;
}

export const USER_GATEWAY = new InjectionToken<UserGateway>('USER_GATEWAY');
