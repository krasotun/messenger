import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY } from './auth-gateway';
import { ChangePasswordInput } from './change-password-input';
import { ChangePasswordResult } from './change-password-result';
import { ChangePasswordService } from './change-password-service';
import { CurrentSessionService } from './current-session-service';
import { CurrentSessionStatus } from './current-session-status';
import { USER_GATEWAY } from './user-gateway';

import { UserMocks } from '@domains/users/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const currentUserMock = UserMocks.currentUser();

const changePasswordInputMock: ChangePasswordInput = {
  oldPassword: 'oldPassword',
  newPassword: 'newPassword',
};

const authenticatedSessionMock = UserMocks.authenticatedSession(currentUserMock);

const changePasswordResultMock: ChangePasswordResult = {
  passwordChanged: true,
};

describe('ChangePasswordService', () => {
  let authGatewayMock: ReturnType<typeof UserMocks.authGateway>;
  let userGatewayMock: ReturnType<typeof UserMocks.userGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let service: ChangePasswordService;
  let currentSessionService: CurrentSessionService;

  beforeEach(() => {
    authGatewayMock = UserMocks.authGateway();
    userGatewayMock = UserMocks.userGateway();
    notifierMock = NotificationMocks.notifier();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
        },
        {
          provide: USER_GATEWAY,
          useValue: userGatewayMock,
        },
        provideRouter([]),
        {
          provide: NOTIFIER,
          useValue: notifierMock,
        },
        ChangePasswordService,
      ],
    });

    currentSessionService = TestBed.inject(CurrentSessionService);
    service = TestBed.inject(ChangePasswordService);

    authGatewayMock.currentSession.mockReturnValue(of(authenticatedSessionMock));
    currentSessionService.restoreCurrentSession().subscribe();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('isSubmitting should be false', () => {
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should call user gateway with form values', () => {
      userGatewayMock.changePassword.mockReturnValue(of(changePasswordResultMock));

      service.changePassword(changePasswordInputMock);

      expect(userGatewayMock.changePassword).toHaveBeenCalledOnce();
      expect(userGatewayMock.changePassword).toHaveBeenCalledWith(changePasswordInputMock);
    });

    it('should set submitting state while request is pending', () => {
      const changePasswordResult$ = new Subject<ChangePasswordResult>();
      userGatewayMock.changePassword.mockReturnValueOnce(changePasswordResult$);

      service.changePassword(changePasswordInputMock);

      expect(service.isSubmitting()).toBe(true);
    });

    describe('on success', () => {
      beforeEach(() => {
        userGatewayMock.changePassword.mockReturnValue(of(changePasswordResultMock));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        service.succeeded$.subscribe(succeededSpy);

        service.changePassword(changePasswordInputMock);

        expect(succeededSpy).toHaveBeenCalledOnce();
        expect(service.isSubmitting()).toBe(false);
      });

      it('should notify about success', () => {
        service.changePassword(changePasswordInputMock);

        expect(notifierMock.success).toHaveBeenCalledWith(
          'Change password',
          'Password changed successfully',
        );
      });

      it('should keep the current user unchanged', () => {
        service.changePassword(changePasswordInputMock);

        expect(currentSessionService.currentUser()).toEqual(currentUserMock);
      });

      it('should keep the session authenticated', () => {
        service.changePassword(changePasswordInputMock);

        expect(currentSessionService.status()).toBe(CurrentSessionStatus.Authenticated);
      });

      it('should not navigate', async () => {
        service.changePassword(changePasswordInputMock);

        await TestBed.inject(ApplicationRef).whenStable();

        expect(TestBed.inject(Router).url).toBe('/');
      });
    });

    describe('on error', () => {
      beforeEach(() => {
        userGatewayMock.changePassword.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );
      });

      it('should notify with the reason and not emit succeeded$', () => {
        const succeededSpy = vi.fn();
        service.succeeded$.subscribe(succeededSpy);

        service.changePassword(changePasswordInputMock);

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(service.isSubmitting()).toBe(false);
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to change password', 'mockReason');
      });

      it('should keep the current user unchanged', () => {
        service.changePassword(changePasswordInputMock);

        expect(currentSessionService.currentUser()).toEqual(currentUserMock);
      });

      it('should keep the session authenticated', () => {
        service.changePassword(changePasswordInputMock);

        expect(currentSessionService.status()).toBe(CurrentSessionStatus.Authenticated);
      });

      it('should not navigate', async () => {
        service.changePassword(changePasswordInputMock);

        await TestBed.inject(ApplicationRef).whenStable();

        expect(TestBed.inject(Router).url).toBe('/');
      });
    });
  });
});
