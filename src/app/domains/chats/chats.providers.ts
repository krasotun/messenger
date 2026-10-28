import { Provider } from '@angular/core';

import { CHAT_GATEWAY } from './data/chat-gateway';
import { HttpChatGateway } from './data/http-chat-gateway';

export const provideChats = (): Provider[] => {
  const chatGatewayProvider = {
    provide: CHAT_GATEWAY,
    useClass: HttpChatGateway,
  };

  return [chatGatewayProvider];
};
