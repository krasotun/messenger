import { ChatDto } from './chat-dto.type';
import { chatMapper } from './chat.mapper';

const RESOURCES_BASE_URL = 'https://resources.test';

const CHAT_DTO: ChatDto = {
  id: 1,
  title: 'Analytics Q3',
  avatar: null,
  unread_count: 0,
  created_by: 42,
  last_message: null,
};

describe('chatMapper', () => {
  it('should keep the id of the user who created the chat', () => {
    const chat = chatMapper(CHAT_DTO, RESOURCES_BASE_URL);

    expect(chat.createdBy).toBe(42);
  });
});
