import { Provider } from '@angular/core';

import { AUTH_GATEWAY } from './application/auth.gateway';
import { USER_GATEWAY } from './application/user.gateway';
import { HttpAuthGateway } from './infrastructure/http-auth-gateway';
import { HttpUserGateway } from './infrastructure/http-user-gateway';

export const provideIdentityAccess = (): Provider[] => {
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
