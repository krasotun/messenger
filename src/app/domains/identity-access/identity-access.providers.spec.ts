import { TestBed } from '@angular/core/testing';

import { AUTH_GATEWAY } from './application/auth.gateway';
import { provideIdentityAccess } from './identity-access.providers';
import { AuthApi } from './infrastructure/auth.api';
import { HttpAuthGateway } from './infrastructure/http-auth-gateway';

const authApiMock = {
  signUp: vi.fn(),
  signIn: vi.fn(),
  currentSession: vi.fn(),
  logout: vi.fn(),
};

describe('provideIdentityAccess', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideIdentityAccess(),
        {
          provide: AuthApi,
          useValue: authApiMock,
        },
      ],
    });
  });

  it('should provide auth gateway through http implementation', () => {
    const authGateway = TestBed.inject(AUTH_GATEWAY);

    expect(authGateway).toBeInstanceOf(HttpAuthGateway);
  });
});
