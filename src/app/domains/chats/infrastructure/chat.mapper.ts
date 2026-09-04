import { Chat, ChatLastMessage } from '../application/chat';

import { ChatDto, ChatLastMessageDto } from './chat.dto';

import { resolveAvatarUrl } from '@shared/resources';
import { Nullable } from '@shared/types';

const lastMessageMapper = ({ user, content }: ChatLastMessageDto): ChatLastMessage => {
  return {
    authorName: (user.display_name || user.first_name || user.login).trim(),
    content,
  };
};

export const chatMapper = (
  { id, title, avatar, unread_count, last_message }: ChatDto,
  resourcesBaseUrl: string,
): Chat => {
  const lastMessage: Nullable<ChatLastMessage> = last_message
    ? lastMessageMapper(last_message)
    : null;

  return {
    id,
    title,
    avatar: resolveAvatarUrl(avatar, resourcesBaseUrl),
    unreadCount: unread_count,
    lastMessage,
  };
};
