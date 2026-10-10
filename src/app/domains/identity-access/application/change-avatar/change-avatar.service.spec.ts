import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';
import { CurrentSessionStatus } from '../current-session/current-session-status.type';
import { CurrentSessionService } from '../current-session/current-session.service';
import { CurrentUser } from '../current-session/current-user.type';
import { USER_GATEWAY } from '../user.gateway';

import { ChangeAvatarInput } from './change-avatar-input.type';
import { ChangeAvatarResult } from './change-avatar-result.type';
import { ChangeAvatarService } from './change-avatar.service';

import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const routerMock = {
  navigate: vi.fn(),
  navigateByUrl: vi.fn(),
};

const currentUserMock = IdentityMocks.currentUser();

const updatedUserMock: CurrentUser = {
  ...currentUserMock,
  avatar: 'https://mock.host/resources/path/to/avatar.png',
};

const changeAvatarInputMock: ChangeAvatarInput = {
  file: new File(['mockContent'], 'avatar.png', { type: 'image/png' }),
};

const authenticatedSessionMock = IdentityMocks.authenticatedSession(currentUserMock);

describe('ChangeAvatarService', () => {
  let authGatewayMock: ReturnType<typeof IdentityMocks.authGateway>;
  let userGatewayMock: ReturnType<typeof IdentityMocks.userGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let service: ChangeAvatarService;
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

      expect(service.isSubmitting()).toBe(true);
    });

    describe('on success', () => {
      beforeEach(() => {
        userGatewayMock.changeAvatar.mockReturnValue(of({ user: updatedUserMock }));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        service.succeeded$.subscribe(succeededSpy);

        service.changeAvatar(changeAvatarInputMock);

        expect(succeededSpy).toHaveBeenCalledOnce();
        expect(service.isSubmitting()).toBe(false);
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

      it('should notify with the reason and not emit succeeded$', () => {
        const succeededSpy = vi.fn();
        service.succeeded$.subscribe(succeededSpy);

        service.changeAvatar(changeAvatarInputMock);

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(service.isSubmitting()).toBe(false);
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
});
