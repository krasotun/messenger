import { TestBed } from '@angular/core/testing';
import { of, throwError, toArray } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';
import { CurrentSessionService } from '../current-session/current-session.service';
import { CurrentUser } from '../current-session/current-user.type';

import { RefreshCurrentUserService } from './refresh-current-user.service';

import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

describe('RefreshCurrentUserService', () => {
  let service: RefreshCurrentUserService;
  let authGatewayMock: ReturnType<typeof IdentityMocks.authGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  let currentSessionService: CurrentSessionService;

  beforeEach(() => {
    authGatewayMock = IdentityMocks.authGateway();
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

    currentSessionService = TestBed.inject(CurrentSessionService);
  });

  describe('when the gateway answers Authenticated', () => {
    beforeEach(() => {
      authGatewayMock.currentSession.mockReturnValue(of(IdentityMocks.authenticatedSession()));
    });

    it('should update the current session', () => {
      service.refreshCurrentUser().subscribe();

      expect(currentSessionService.currentUser()).toEqual(IdentityMocks.currentUser());
    });

    it('should emit the current user', () => {
      let received: CurrentUser | undefined;

      service.refreshCurrentUser().subscribe((currentUser) => {
        received = currentUser;
      });
      expect(received).toEqual(IdentityMocks.currentUser());
    });
  });

  describe('when the gateway answers Anonymous', () => {
    beforeEach(() => {
      authGatewayMock.currentSession.mockReturnValue(of(IdentityMocks.anonymousSession()));
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
      currentSessionService.updateCurrentUser(IdentityMocks.currentUser());

      service.refreshCurrentUser().subscribe();

      expect(currentSessionService.currentUser()).toEqual(IdentityMocks.currentUser());
    });

    it('should keep the session status unchanged', () => {
      const statusBefore = currentSessionService.status();

      service.refreshCurrentUser().subscribe();

      expect(currentSessionService.status()).toBe(statusBefore);
    });
  });
});
