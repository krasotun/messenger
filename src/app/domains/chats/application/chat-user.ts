import { Nullable } from '@shared/types';

export interface ChatUser {
  id: number;
  name: string;
  avatar: Nullable<string>;
}
