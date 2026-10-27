import { TestBed } from '@angular/core/testing';

import { AuthApi } from './api/auth/auth.api';
import { HttpAuthGateway } from './api/auth/http-auth-gateway';
import { HttpUserGateway } from './api/user/http-user-gateway';
import { UserApi } from './api/user/user.api';
import { AUTH_GATEWAY } from './auth.gateway';
import { provideIdentityAccess } from './identity-access.providers';
import { USER_GATEWAY } from './user.gateway';

import { RESOURCES_BASE_URL } from '@core/tokens';

const authApiMock = {
  signUp: vi.fn(),
  signIn: vi.fn(),
  currentSession: vi.fn(),
  logout: vi.fn(),
};

const userApiMock = {
  updateProfile: vi.fn(),
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
        {
          provide: UserApi,
          useValue: userApiMock,
        },
        {
          provide: RESOURCES_BASE_URL,
          useValue: 'https://mock.host/resources',
        },
      ],
    });
  });

  it('should provide auth gateway through http implementation', () => {
    const authGateway = TestBed.inject(AUTH_GATEWAY);

    expect(authGateway).toBeInstanceOf(HttpAuthGateway);
  });

  it('should provide user gateway through http implementation', () => {
    const userGateway = TestBed.inject(USER_GATEWAY);

    expect(userGateway).toBeInstanceOf(HttpUserGateway);
  });
});
