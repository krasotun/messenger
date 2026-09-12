import { UserId } from '@domains/identity-access';
import { Nullable } from '@shared/types';

export interface ChatUser {
  id: UserId;
  name: string;
  avatar: Nullable<string>;
}
