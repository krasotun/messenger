import { Provider } from '@angular/core';

import { HttpAuthGateway } from './api/auth/http-auth-gateway';
import { HttpUserGateway } from './api/user/http-user-gateway';
import { AUTH_GATEWAY } from './auth.gateway';
import { USER_GATEWAY } from './user.gateway';

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
