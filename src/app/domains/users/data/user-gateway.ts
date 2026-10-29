import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { CurrentUser } from './current-user';
import { User } from './user';

export interface UpdateProfileInput {
  firstName: string;
  secondName: string;
  displayName: string;
  login: string;
  email: string;
  phone: string;
}

export interface UpdateProfileResult {
  user: CurrentUser;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResult {
  passwordChanged: boolean;
}

export interface ChangeAvatarInput {
  file: File;
}

export interface ChangeAvatarResult {
  user: CurrentUser;
}

export interface SearchUsersInput {
  login: string;
}

export interface SearchUsersResult {
  users: User[];
}

export interface UserGateway {
  updateProfile(input: UpdateProfileInput): Observable<UpdateProfileResult>;
  changePassword(input: ChangePasswordInput): Observable<ChangePasswordResult>;
  changeAvatar(input: ChangeAvatarInput): Observable<ChangeAvatarResult>;
  searchUsers(input: SearchUsersInput): Observable<SearchUsersResult>;
}

export const USER_GATEWAY = new InjectionToken<UserGateway>('USER_GATEWAY');
