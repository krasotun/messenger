import { TestBed } from '@angular/core/testing';
import { of, throwError, toArray } from 'rxjs';

import { AUTH_GATEWAY } from './auth-gateway';
import { CurrentSessionStore } from './current-session-store';
import { CurrentUser } from './current-user';
import { RefreshCurrentUserService } from './refresh-current-user-service';

import { UserMocks } from '@domains/users/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

describe('RefreshCurrentUserService', () => {
  let service: RefreshCurrentUserService;
  let authGatewayMock: ReturnType<typeof UserMocks.authGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  let currentSessionStore: CurrentSessionStore;

  beforeEach(() => {
    authGatewayMock = UserMocks.authGateway();
    notifierMock = NotificationMocks.notifier();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
        },
        {
          provide: NOTIFIER,
          useValue: notifierMock,
        },
      ],
    });

    service = TestBed.inject(RefreshCurrentUserService);

    currentSessionStore = TestBed.inject(CurrentSessionStore);
  });

  describe('when the gateway answers Authenticated', () => {
    const refreshedUser = UserMocks.currentUser({ firstName: 'Refreshed' });

    // Обновлять можно только признанную сессию: страница Настроек открыта
    // после Входа, поэтому сессия восстанавливается с прежними данными.
    beforeEach(() => {
      authGatewayMock.currentSession.mockReturnValueOnce(of(UserMocks.authenticatedSession()));
      currentSessionStore.restoreCurrentSession().subscribe();

      authGatewayMock.currentSession.mockReturnValue(
        of(UserMocks.authenticatedSession(refreshedUser)),
      );
    });

    it('should update the current session', () => {
      service.refreshCurrentUser().subscribe();

      expect(currentSessionStore.currentUser()).toEqual(refreshedUser);
    });

    it('should emit the current user', () => {
      let received: CurrentUser | undefined;

      service.refreshCurrentUser().subscribe((currentUser) => {
        received = currentUser;
      });
      expect(received).toEqual(refreshedUser);
    });
  });

  describe('when the gateway answers Anonymous', () => {
    beforeEach(() => {
      authGatewayMock.currentSession.mockReturnValue(of(UserMocks.anonymousSession()));
    });

    it('should not notify', () => {
      service.refreshCurrentUser().subscribe();

      expect(notifierMock.error).not.toHaveBeenCalled();
      expect(notifierMock.success).not.toHaveBeenCalled();
    });

    it('should complete without a value', () => {
      let values: CurrentUser[] | undefined;

      service
        .refreshCurrentUser()
        .pipe(toArray())
        .subscribe((v) => (values = v));

      expect(values).toEqual([]);
    });
  });

  describe('when the gateway fails', () => {
    beforeEach(() => {
      authGatewayMock.currentSession.mockReturnValue(
        throwError(() => new ApplicationError('mockReason')),
      );
    });

    it('should notify about the error with the reason when it has one', () => {
      service.refreshCurrentUser().subscribe();

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to load profile', 'mockReason');
    });

    it('should complete without a value', () => {
      let values: CurrentUser[] | undefined;

      service
        .refreshCurrentUser()
        .pipe(toArray())
        .subscribe((v) => (values = v));

      expect(values).toEqual([]);
    });

    it('should keep the current session unchanged', () => {
      authGatewayMock.currentSession.mockReturnValueOnce(of(UserMocks.authenticatedSession()));
      currentSessionStore.restoreCurrentSession().subscribe();

      service.refreshCurrentUser().subscribe();

      expect(currentSessionStore.currentUser()).toEqual(UserMocks.currentUser());
    });

    it('should keep the session status unchanged', () => {
      const statusBefore = currentSessionStore.status();

      service.refreshCurrentUser().subscribe();

      expect(currentSessionStore.status()).toBe(statusBefore);
    });
  });
});
