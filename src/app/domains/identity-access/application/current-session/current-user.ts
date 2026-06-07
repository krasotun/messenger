import { Nullable } from '@shared/types';

export interface CurrentUser {
  id: number;
  firstName: string;
  secondName: string;
  displayName: Nullable<string>;
  phone: string;
  login: string;
  avatar: Nullable<string>;
  email: string;
}
