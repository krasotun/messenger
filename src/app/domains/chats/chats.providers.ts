import { Provider } from '@angular/core';

import { CHAT_GATEWAY } from './application/chat.gateway';
import { HttpChatGateway } from './infrastructure/http-chat-gateway';

export const provideChats = (): Provider[] => {
  const chatGatewayProvider = {
    provide: CHAT_GATEWAY,
    useClass: HttpChatGateway,
  };

  return [chatGatewayProvider];
};
