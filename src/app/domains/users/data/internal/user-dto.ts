import { Nullable } from '@shared/types';

export interface UserDto {
  id: number;
  first_name: string;
  second_name: string;
  display_name: Nullable<string>;
  phone: string;
  login: string;
  avatar: Nullable<string>;
  email: string;
}
