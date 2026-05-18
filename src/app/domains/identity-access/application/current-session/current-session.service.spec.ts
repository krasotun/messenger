import { TestBed } from '@angular/core/testing';

import { AUTH_GATEWAY } from '../auth.gateway';

import { CurrentSessionStatus } from './current-session-status';
import { CurrentSessionService } from './current-session.service';

const authGatewayMock = {
  restoreCurrentSession: vi.fn(),
  logout: vi.fn(),
};

describe('CurrentSessionService', () => {
  let service: CurrentSessionService;

  beforeEach(() => {
    authGatewayMock.restoreCurrentSession.mockReset();
    authGatewayMock.logout.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
        },
      ],
    });
    service = TestBed.inject(CurrentSessionService);
  });

  describe('initial', () => {
    it('status should be unknown', () => {
      expect(service.status()).toBe(CurrentSessionStatus.Unknown);
    });

    it('current user should be null', () => {
      expect(service.currentUser()).toBeNull();
    });
  });
});
