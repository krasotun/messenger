import { Provider } from '@angular/core';

import { CHAT_GATEWAY } from './data/chat-gateway';
import { ChatListStore } from './data/chat-list-store';
import { HttpChatGateway } from './data/http-chat-gateway';

export const provideChats = (): Provider[] => {
  const chatGatewayProvider = {
    provide: CHAT_GATEWAY,
    useClass: HttpChatGateway,
  };

  return [chatGatewayProvider];
};

// Стор отдается провайдером, а не классом: страница решает, где он живет, но
// заинжектить его снаружи домена нельзя.
export const provideChatListStore = (): Provider[] => [ChatListStore];
