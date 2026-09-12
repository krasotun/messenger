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
  createdBy: number;
  lastMessage: Nullable<ChatLastMessage>;
}
