import { Provider } from '@angular/core';

import { AUTH_GATEWAY } from './application/auth.gateway';
import { HttpAuthGateway } from './infrastructure/http-auth-gateway';

export const provideIdentityAccess = (): Provider[] => {
  const authGatewayProvider = {
    provide: AUTH_GATEWAY,
    useClass: HttpAuthGateway,
  };

  return [authGatewayProvider];
};
