import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { AuthFlowStatus } from '../auth-flow-status.type';
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
    it('status should be idle', () => {
      expect(service.status()).toBe(AuthFlowStatus.Idle);
    });

    it('errorMessage should be null', () => {
      expect(service.errorMessage()).toBeNull();
    });

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

    it('should set submitting state and clear error message while request is pending', () => {
      userGatewayMock.changePassword.mockReturnValueOnce(
        throwError(() => new ApplicationError('mockError')),
      );

      service.changePassword(changePasswordInputMock);

      expect(service.errorMessage()).toBe('mockError');

      const changePasswordResult$ = new Subject<ChangePasswordResult>();
      userGatewayMock.changePassword.mockReturnValueOnce(changePasswordResult$);

      service.changePassword(changePasswordInputMock);

      expect(service.errorMessage()).toBeNull();
      expect(service.status()).toBe(AuthFlowStatus.Submitting);
      expect(service.isSubmitting()).toBe(true);
    });

    describe('on success', () => {
      beforeEach(() => {
        userGatewayMock.changePassword.mockReturnValue(of(changePasswordResultMock));
      });

      it('should set success state', () => {
        service.changePassword(changePasswordInputMock);

        expect(service.status()).toBe(AuthFlowStatus.Success);
        expect(service.errorMessage()).toBeNull();
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

      it('should expose the error message', () => {
        service.changePassword(changePasswordInputMock);

        expect(service.status()).toBe(AuthFlowStatus.Error);
        expect(service.errorMessage()).toBe('mockReason');
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

  describe('reset', () => {
    it('should reset status and error message', () => {
      userGatewayMock.changePassword.mockReturnValue(
        throwError(() => new ApplicationError('mockError')),
      );

      service.changePassword(changePasswordInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe('mockError');

      service.reset();

      expect(service.status()).toBe(AuthFlowStatus.Idle);
      expect(service.errorMessage()).toBeNull();
    });
  });
});
