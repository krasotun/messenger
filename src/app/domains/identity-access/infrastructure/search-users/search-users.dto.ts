import { Nullable } from '@shared/types';

export interface FindUserRequestDto {
  login: string;
}

export interface UserDto {
  id: number;
  first_name: string;
  second_name: string;
  display_name: Nullable<string>;
  login: string;
  avatar: Nullable<string>;
  email: string;
  phone: string;
}
