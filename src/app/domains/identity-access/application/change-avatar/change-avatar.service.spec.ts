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

import { ChangeAvatarInput } from './change-avatar-input.type';
import { ChangeAvatarResult } from './change-avatar-result.type';
import { ChangeAvatarService } from './change-avatar.service';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

const authGatewayMock = {
  currentSession: vi.fn(),
  logout: vi.fn(),
};

const userGatewayMock = {
  changeAvatar: vi.fn(),
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

const updatedUserMock: CurrentUser = {
  ...currentUserMock,
  avatar: 'https://mock.host/resources/path/to/avatar.png',
};

const changeAvatarInputMock: ChangeAvatarInput = {
  file: new File(['mockContent'], 'avatar.png', { type: 'image/png' }),
};

const authenticatedSessionMock: CurrentSessionResult = {
  status: CurrentSessionStatus.Authenticated,
  user: currentUserMock,
};

describe('ChangeAvatarService', () => {
  let service: ChangeAvatarService;
  let currentSessionService: CurrentSessionService;

  beforeEach(() => {
    authGatewayMock.currentSession.mockReset();
    authGatewayMock.logout.mockReset();
    userGatewayMock.changeAvatar.mockReset();
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
        ChangeAvatarService,
      ],
    });

    currentSessionService = TestBed.inject(CurrentSessionService);
    service = TestBed.inject(ChangeAvatarService);

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

    it('isSubmitting should be false', () => {
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('changeAvatar', () => {
    it('should call user gateway with the selected file', () => {
      userGatewayMock.changeAvatar.mockReturnValue(of({ user: updatedUserMock }));

      service.changeAvatar(changeAvatarInputMock);

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(userGatewayMock.changeAvatar).toHaveBeenCalledWith(changeAvatarInputMock);
    });

    it('should set submitting state while request is pending', () => {
      const changeAvatarResult$ = new Subject<ChangeAvatarResult>();
      userGatewayMock.changeAvatar.mockReturnValueOnce(changeAvatarResult$);

      service.changeAvatar(changeAvatarInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Submitting);
      expect(service.isSubmitting()).toBe(true);
    });

    describe('on success', () => {
      beforeEach(() => {
        userGatewayMock.changeAvatar.mockReturnValue(of({ user: updatedUserMock }));
      });

      it('should set success state', () => {
        service.changeAvatar(changeAvatarInputMock);

        expect(service.status()).toBe(AuthFlowStatus.Success);
      });

      it('should notify about success', () => {
        service.changeAvatar(changeAvatarInputMock);

        expect(notifierMock.success).toHaveBeenCalledWith(
          'Change avatar',
          'Avatar changed successfully',
        );
      });

      it('should update the current session from the backend response', () => {
        service.changeAvatar(changeAvatarInputMock);

        expect(currentSessionService.currentUser()).toEqual(updatedUserMock);
      });

      it('should keep the session authenticated', () => {
        service.changeAvatar(changeAvatarInputMock);

        expect(currentSessionService.status()).toBe(CurrentSessionStatus.Authenticated);
      });

      it('should not navigate', () => {
        service.changeAvatar(changeAvatarInputMock);

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
      });
    });

    describe('on error', () => {
      beforeEach(() => {
        userGatewayMock.changeAvatar.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );
      });

      it('should set error state and notify with the reason', () => {
        service.changeAvatar(changeAvatarInputMock);

        expect(service.status()).toBe(AuthFlowStatus.Error);
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to change avatar', 'mockReason');
      });

      it('should keep the current session unchanged', () => {
        service.changeAvatar(changeAvatarInputMock);

        expect(currentSessionService.currentUser()).toEqual(currentUserMock);
      });

      it('should not navigate', () => {
        service.changeAvatar(changeAvatarInputMock);

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
      });
    });
  });

  describe('reset', () => {
    it('should reset status', () => {
      userGatewayMock.changeAvatar.mockReturnValue(
        throwError(() => new ApplicationError('mockError')),
      );

      service.changeAvatar(changeAvatarInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);

      service.reset();

      expect(service.status()).toBe(AuthFlowStatus.Idle);
    });
  });
});
