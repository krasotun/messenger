import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY, CurrentSessionResult } from './auth-gateway';
import { CurrentSessionStatus } from './current-session-status';
import { CurrentSessionStore } from './current-session-store';
import { CurrentUser } from './current-user';

import { UserMocks } from '@domains/users/testing';

const currentUserMock = UserMocks.currentUser();

const successResponseMock = UserMocks.authenticatedSession(currentUserMock);

const anonymousResponseMock: CurrentSessionResult = {
  status: CurrentSessionStatus.Anonymous,
};

describe('CurrentSessionStore', () => {
  let authGatewayMock: ReturnType<typeof UserMocks.authGateway>;
  let store: CurrentSessionStore;

  beforeEach(() => {
    authGatewayMock = UserMocks.authGateway();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
        },
      ],
    });
    store = TestBed.inject(CurrentSessionStore);
  });

  describe('initial', () => {
    it('status should be unknown', () => {
      expect(store.status()).toBe(CurrentSessionStatus.Unknown);
    });

    it('current user should be null', () => {
      expect(store.currentUser()).toBeNull();
    });
  });

  describe('current session', () => {
    it('should call auth gateway', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      store.restoreCurrentSession().subscribe();

      expect(authGatewayMock.currentSession).toHaveBeenCalledOnce();
    });

    it('should set status to loading after calls', () => {
      const currentSession$ = new Subject<CurrentSessionResult>();
      authGatewayMock.currentSession.mockReturnValue(currentSession$);

      store.restoreCurrentSession().subscribe();

      expect(store.status()).toBe(CurrentSessionStatus.Loading);

      currentSession$.complete();
    });

    it('should set status to authenticated and set current user after  success response', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      store.restoreCurrentSession().subscribe();

      expect(store.status()).toBe(CurrentSessionStatus.Authenticated);
      expect(store.currentUser()).toEqual(currentUserMock);
    });

    it('should set status to anonymous and clear current user after anonymous response', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      store.restoreCurrentSession().subscribe();

      expect(store.status()).toBe(CurrentSessionStatus.Authenticated);
      expect(store.currentUser()).toEqual(currentUserMock);

      authGatewayMock.currentSession.mockReturnValue(of(anonymousResponseMock));

      store.restoreCurrentSession().subscribe();

      expect(store.status()).toBe(CurrentSessionStatus.Anonymous);
      expect(store.currentUser()).toBeNull();
    });

    it('should set status to anonymous and clear current user after current session error', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      store.restoreCurrentSession().subscribe();

      expect(store.status()).toBe(CurrentSessionStatus.Authenticated);
      expect(store.currentUser()).toEqual(currentUserMock);

      authGatewayMock.currentSession.mockReturnValue(throwError(() => 'mockError'));

      const errors: unknown[] = [];

      store.restoreCurrentSession().subscribe({
        error: (error: unknown) => {
          errors.push(error);
        },
      });

      expect(errors).toHaveLength(1);
      expect(store.status()).toBe(CurrentSessionStatus.Anonymous);
      expect(store.currentUser()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should call auth gateway', () => {
      authGatewayMock.logout.mockReturnValue(of(undefined));

      store.logout().subscribe();

      expect(authGatewayMock.logout).toHaveBeenCalledOnce();
    });

    it('should set status to anonymous and clear current user after success response', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      store.restoreCurrentSession().subscribe();

      expect(store.status()).toBe(CurrentSessionStatus.Authenticated);
      expect(store.currentUser()).toEqual(currentUserMock);

      authGatewayMock.logout.mockReturnValue(of(undefined));

      store.logout().subscribe();

      expect(store.status()).toBe(CurrentSessionStatus.Anonymous);
      expect(store.currentUser()).toBeNull();
    });

    it('should set status to anonymous and clear current user after logout error', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      store.restoreCurrentSession().subscribe();

      expect(store.status()).toBe(CurrentSessionStatus.Authenticated);
      expect(store.currentUser()).toEqual(currentUserMock);

      authGatewayMock.logout.mockReturnValue(throwError(() => 'mockError'));

      const errors: unknown[] = [];

      store.logout().subscribe({
        error: (error: unknown) => {
          errors.push(error);
        },
      });

      expect(errors).toHaveLength(1);
      expect(store.status()).toBe(CurrentSessionStatus.Anonymous);
      expect(store.currentUser()).toBeNull();
    });
  });

  describe('updateCurrentUser', () => {
    it('should replace the current user', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));
      store.restoreCurrentSession().subscribe();

      const updatedUserMock: CurrentUser = {
        ...currentUserMock,
        firstName: 'updatedFirstName',
      };

      store.updateCurrentUser(updatedUserMock);

      expect(store.currentUser()).toEqual(updatedUserMock);
    });

    it('should keep the session authenticated', () => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));
      store.restoreCurrentSession().subscribe();

      store.updateCurrentUser({ ...currentUserMock, firstName: 'updatedFirstName' });

      expect(store.status()).toBe(CurrentSessionStatus.Authenticated);
    });

    it('should throw when the session is not authenticated', () => {
      expect(() => store.updateCurrentUser(currentUserMock)).toThrow();
    });
  });
});
