import { Nullable } from '@shared/types';

export interface ChatLastMessageUserDto {
  first_name: string;
  second_name: string;
  display_name: Nullable<string>;
  login: string;
  avatar: Nullable<string>;
  email: string;
  phone: string;
}

export interface ChatLastMessageDto {
  user: ChatLastMessageUserDto;
  time: string;
  content: string;
}

export interface ChatDto {
  id: number;
  title: string;
  avatar: Nullable<string>;
  unread_count: number;
  last_message: Nullable<ChatLastMessageDto>;
}

export interface CreateChatRequestDto {
  title: string;
}

export interface CreateChatResponseDto {
  id: number;
}
