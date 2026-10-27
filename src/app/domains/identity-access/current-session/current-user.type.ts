import { UserId } from '../user-id.type';

import { Nullable } from '@shared/types';

export interface CurrentUser {
  id: UserId;
  firstName: string;
  secondName: string;
  displayName: Nullable<string>;
  phone: string;
  login: string;
  avatar: Nullable<string>;
  email: string;
}
