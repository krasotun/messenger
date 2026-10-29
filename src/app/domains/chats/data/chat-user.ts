import { UserId } from '@domains/users';
import { Nullable } from '@shared/types';

export interface ChatUser {
  id: UserId;
  name: string;
  avatar: Nullable<string>;
}
