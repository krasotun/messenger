import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';

import { CurrentSessionResult } from './current-session-result';
import { CurrentSessionStatus } from './current-session-status';
import { CurrentSessionService } from './current-session.service';
import { CurrentUser } from './current-user';

const authGatewayMock = {
  currentSession: vi.fn(),
  logout: vi.fn(),
};

const currentUserMock: CurrentUser = {
  id: 1,
  avatar: null,
  displayName: 'displayName',
  email: 'email',
  firstName: 'firstName',
  login: 'login',
  phone: 'phone',
  secondName: 'secondName',
};

const successResponseMock: CurrentSessionResult = {
  status: CurrentSessionStatus.Authenticated,
  user: currentUserMock,
};

const anonymousResponseMock: CurrentSessionResult = {
  status: CurrentSessionStatus.Anonymous,
};

describe('CurrentSessionService', () => {
  let service: CurrentSessionService;

  beforeEach(() => {
    authGatewayMock.currentSession.mockReset();
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

  describe('current session', () => {
    it('should call auth gateway', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      service.restoreCurrentSession().subscribe(() => {
        expect(authGatewayMock.currentSession).toHaveBeenCalledOnce();
      });
    });

    it('should set status to loading after calls', () => {
      const currentSession$ = new Subject<CurrentSessionResult>();
      authGatewayMock.currentSession.mockReturnValue(currentSession$);

      service.restoreCurrentSession().subscribe(() => {
        expect(service.status()).toBe(CurrentSessionStatus.Loading);
      });
    });

    it('should set status to authenticated and set current user after  success response', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      service.restoreCurrentSession().subscribe(() => {
        expect(service.status()).toBe(CurrentSessionStatus.Authenticated);
        expect(service.currentUser()).toEqual(currentUserMock);
      });
    });

    it('should set status to anonymous and clear current user after anonymous response', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      service.restoreCurrentSession().subscribe(() => {
        expect(service.status()).toBe(CurrentSessionStatus.Authenticated);
        expect(service.currentUser()).toEqual(currentUserMock);
      });

      authGatewayMock.currentSession.mockReturnValue(of(anonymousResponseMock));

      service.restoreCurrentSession().subscribe(() => {
        expect(service.status()).toBe(CurrentSessionStatus.Anonymous);
        expect(service.currentUser()).toBeNull();
      });
    });

    it('should set status to anonymous and clear current user after current session error', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      service.restoreCurrentSession().subscribe(() => {
        expect(service.status()).toBe(CurrentSessionStatus.Authenticated);
        expect(service.currentUser()).toEqual(currentUserMock);
      });

      authGatewayMock.currentSession.mockReturnValue(throwError(() => 'mockError'));

      service.restoreCurrentSession().subscribe({
        error: () => {
          expect(service.status()).toBe(CurrentSessionStatus.Anonymous);
          expect(service.currentUser()).toBeNull();
        },
      });
    });
  });

  describe('logout', () => {
    it('should call auth gateway', () => {
      authGatewayMock.logout.mockReturnValue(of(undefined));

      service.logout().subscribe(() => {
        expect(authGatewayMock.logout).toHaveBeenCalledOnce();
      });
    });

    it('should set status to anonymous and clear current user after success response', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      service.restoreCurrentSession().subscribe(() => {
        expect(service.status()).toBe(CurrentSessionStatus.Authenticated);
        expect(service.currentUser()).toEqual(currentUserMock);
      });

      authGatewayMock.logout.mockReturnValue(of(undefined));

      service.logout().subscribe(() => {
        expect(service.status()).toBe(CurrentSessionStatus.Anonymous);
        expect(service.currentUser()).toBeNull();
      });
    });

    it('should set status to anonymous and clear current user after logout error', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      service.restoreCurrentSession().subscribe(() => {
        expect(service.status()).toBe(CurrentSessionStatus.Authenticated);
        expect(service.currentUser()).toEqual(currentUserMock);
      });

      authGatewayMock.logout.mockReturnValue(throwError(() => 'mockError'));

      service.logout().subscribe({
        error: () => {
          expect(service.status()).toBe(CurrentSessionStatus.Anonymous);
          expect(service.currentUser()).toBeNull();
        },
      });
    });
  });
});
