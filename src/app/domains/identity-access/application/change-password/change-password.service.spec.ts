import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';
import { CurrentSessionStatus } from '../current-session/current-session-status.type';
import { CurrentSessionService } from '../current-session/current-session.service';
import { USER_GATEWAY } from '../user.gateway';

import { ChangePasswordInput } from './change-password-input.type';
import { ChangePasswordResult } from './change-password-result.type';
import { ChangePasswordService } from './change-password.service';

import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const routerMock = {
  navigate: vi.fn(),
  navigateByUrl: vi.fn(),
};

const currentUserMock = IdentityMocks.currentUser();

const changePasswordInputMock: ChangePasswordInput = {
  oldPassword: 'oldPassword',
  newPassword: 'newPassword',
};

const authenticatedSessionMock = IdentityMocks.authenticatedSession(currentUserMock);

const changePasswordResultMock: ChangePasswordResult = {
  passwordChanged: true,
};

describe('ChangePasswordService', () => {
  let authGatewayMock: ReturnType<typeof IdentityMocks.authGateway>;
  let userGatewayMock: ReturnType<typeof IdentityMocks.userGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let service: ChangePasswordService;
  let currentSessionService: CurrentSessionService;

  beforeEach(() => {
    authGatewayMock = IdentityMocks.authGateway();
    userGatewayMock = IdentityMocks.userGateway();
    notifierMock = NotificationMocks.notifier();
    routerMock.navigate.mockReset();
    routerMock.navigateByUrl.mockReset();

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
        {
          provide: Router,
          useValue: routerMock,
        },
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

      it('should not navigate', () => {
        service.changePassword(changePasswordInputMock);

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
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

      it('should not navigate', () => {
        service.changePassword(changePasswordInputMock);

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
      });
    });
  });
});
