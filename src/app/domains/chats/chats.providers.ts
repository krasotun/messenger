import { Provider } from '@angular/core';

import { HttpChatGateway } from './api/http-chat-gateway';
import { CHAT_GATEWAY } from './chat.gateway';

export const provideChats = (): Provider[] => {
  const chatGatewayProvider = {
    provide: CHAT_GATEWAY,
    useClass: HttpChatGateway,
  };

  return [chatGatewayProvider];
};
