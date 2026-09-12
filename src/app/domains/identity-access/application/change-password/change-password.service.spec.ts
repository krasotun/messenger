import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';
import { CurrentSessionResult } from '../current-session/current-session-result.type';
import { CurrentSessionStatus } from '../current-session/current-session-status.type';
import { CurrentSessionService } from '../current-session/current-session.service';
import { CurrentUser } from '../current-session/current-user.type';
import { USER_GATEWAY } from '../user.gateway';

import { ChangePasswordInput } from './change-password-input.type';
import { ChangePasswordResult } from './change-password-result.type';
import { ChangePasswordService } from './change-password.service';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

const authGatewayMock = {
  currentSession: vi.fn(),
  logout: vi.fn(),
};

const userGatewayMock = {
  changePassword: vi.fn(),
};

const routerMock = {
  navigate: vi.fn(),
  navigateByUrl: vi.fn(),
};

const notifierMock = {
  success: vi.fn(),
  error: vi.fn(),
};

const currentUserMock: CurrentUser = {
  id: 1,
  firstName: 'firstName',
  secondName: 'secondName',
  displayName: 'displayName',
  login: 'login',
  email: 'email',
  phone: 'phone',
  avatar: null,
};

const changePasswordInputMock: ChangePasswordInput = {
  oldPassword: 'oldPassword',
  newPassword: 'newPassword',
};

const authenticatedSessionMock: CurrentSessionResult = {
  status: CurrentSessionStatus.Authenticated,
  user: currentUserMock,
};

const changePasswordResultMock: ChangePasswordResult = {
  passwordChanged: true,
};

describe('ChangePasswordService', () => {
  let service: ChangePasswordService;
  let currentSessionService: CurrentSessionService;

  beforeEach(() => {
    authGatewayMock.currentSession.mockReset();
    authGatewayMock.logout.mockReset();
    userGatewayMock.changePassword.mockReset();
    routerMock.navigate.mockReset();
    routerMock.navigateByUrl.mockReset();
    notifierMock.success.mockReset();
    notifierMock.error.mockReset();

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
