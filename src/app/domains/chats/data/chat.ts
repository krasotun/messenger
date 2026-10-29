import { UserId } from '@domains/users';
import { Nullable } from '@shared/types';

export interface ChatLastMessage {
  authorName: string;
  content: string;
}

export interface Chat {
  id: number;
  title: string;
  avatar: Nullable<string>;
  unreadCount: number;
  createdBy: UserId;
  lastMessage: Nullable<ChatLastMessage>;
}
