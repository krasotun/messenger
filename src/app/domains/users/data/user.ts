import { UserId } from './user-id';

import { Nullable } from '@shared/types';

export interface User {
  id: UserId;
  login: string;
  name: string;
  avatar: Nullable<string>;
}
