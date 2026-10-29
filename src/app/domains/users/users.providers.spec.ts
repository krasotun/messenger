import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { AUTH_GATEWAY } from './data/auth-gateway';
import { HttpAuthGateway } from './data/http-auth-gateway';
import { HttpUserGateway } from './data/http-user-gateway';
import { USER_GATEWAY } from './data/user-gateway';
import { provideUsers } from './users.providers';

import { RESOURCES_BASE_URL } from '@core/tokens';

describe('provideUsers', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideUsers(),
        provideHttpClient(),
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
