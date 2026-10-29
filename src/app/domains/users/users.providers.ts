import { Provider } from '@angular/core';

import { AUTH_GATEWAY } from './data/auth-gateway';
import { HttpAuthGateway } from './data/http-auth-gateway';
import { HttpUserGateway } from './data/http-user-gateway';
import { USER_GATEWAY } from './data/user-gateway';

export const provideUsers = (): Provider[] => {
  const authGatewayProvider = {
    provide: AUTH_GATEWAY,
    useClass: HttpAuthGateway,
  };

  const userGatewayProvider = {
    provide: USER_GATEWAY,
    useClass: HttpUserGateway,
  };

  return [authGatewayProvider, userGatewayProvider];
};
