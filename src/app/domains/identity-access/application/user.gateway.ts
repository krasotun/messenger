import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { ChangeAvatarInput } from './change-avatar/change-avatar.input';
import { ChangeAvatarResult } from './change-avatar/change-avatar.result';
import { ChangePasswordInput } from './change-password/change-password.input';
import { ChangePasswordResult } from './change-password/change-password.result';
import { SearchUsersInput } from './search-users/search-users.input';
import { SearchUsersResult } from './search-users/search-users.result';
import { UpdateProfileInput } from './update-profile/update-profile.input';
import { UpdateProfileResult } from './update-profile/update-profile.result';

export interface UserGateway {
  updateProfile(input: UpdateProfileInput): Observable<UpdateProfileResult>;
  changePassword(input: ChangePasswordInput): Observable<ChangePasswordResult>;
  changeAvatar(input: ChangeAvatarInput): Observable<ChangeAvatarResult>;
  searchUsers(input: SearchUsersInput): Observable<SearchUsersResult>;
}

export const USER_GATEWAY = new InjectionToken<UserGateway>('USER_GATEWAY');
