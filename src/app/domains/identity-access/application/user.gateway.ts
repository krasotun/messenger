import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { ChangeAvatarInput } from './change-avatar/change-avatar-input.type';
import { ChangeAvatarResult } from './change-avatar/change-avatar-result.type';
import { ChangePasswordInput } from './change-password/change-password-input.type';
import { ChangePasswordResult } from './change-password/change-password-result.type';
import { SearchUsersInput } from './search-users/search-users-input.type';
import { SearchUsersResult } from './search-users/search-users-result.type';
import { UpdateProfileInput } from './update-profile/update-profile-input.type';
import { UpdateProfileResult } from './update-profile/update-profile-result.type';

export interface UserGateway {
  updateProfile(input: UpdateProfileInput): Observable<UpdateProfileResult>;
  changePassword(input: ChangePasswordInput): Observable<ChangePasswordResult>;
  changeAvatar(input: ChangeAvatarInput): Observable<ChangeAvatarResult>;
  searchUsers(input: SearchUsersInput): Observable<SearchUsersResult>;
}

export const USER_GATEWAY = new InjectionToken<UserGateway>('USER_GATEWAY');
