import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError, toArray } from 'rxjs';

import { AUTH_GATEWAY, CurrentSessionResult, SignInInput, SignUpInput } from './auth-gateway';
import { CurrentSessionStatus } from './current-session-status';
import { CurrentSessionStore } from './current-session-store';
import { CurrentUser } from './current-user';
import {
  ChangeAvatarInput,
  ChangeAvatarResult,
  ChangePasswordInput,
  ChangePasswordResult,
  USER_GATEWAY,
} from './user-gateway';

import { UserMocks } from '@domains/users/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { createFormSubmitFlowState, FormSubmitFlowState } from '@shared/submit-flow';

const currentUserMock = UserMocks.currentUser();

const successResponseMock = UserMocks.authenticatedSession(currentUserMock);

const userWithNewAvatarMock: CurrentUser = {
  ...currentUserMock,
  avatar: 'https://mock.host/resources/path/to/avatar.png',
};

const changeAvatarInputMock: ChangeAvatarInput = {
  file: new File(['mockContent'], 'avatar.png', { type: 'image/png' }),
};

const changePasswordInputMock: ChangePasswordInput = {
  oldPassword: 'oldPassword',
  newPassword: 'newPassword',
};

const changePasswordResultMock: ChangePasswordResult = {
  passwordChanged: true,
};

const anonymousResponseMock: CurrentSessionResult = {
  status: CurrentSessionStatus.Anonymous,
};

const signInInputMock: SignInInput = {
  login: 'mockLogin',
  password: 'mockPassword',
};

const signUpInputMock: SignUpInput = {
  firstName: 'mockFirstName',
  secondName: 'mockSecondName',
  login: 'mockLogin',
  email: 'mock@email.email',
  password: 'mockPassword',
  phone: '79999999999',
};

describe('CurrentSessionStore', () => {
  let authGatewayMock: ReturnType<typeof UserMocks.authGateway>;
  let userGatewayMock: ReturnType<typeof UserMocks.userGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let store: CurrentSessionStore;

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

  describe('expireCurrentSession', () => {
    beforeEach(() => {
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));
      store.restoreCurrentSession().subscribe();
    });

    it('should clear current user', () => {
      store.expireCurrentSession();

      expect(store.currentUser()).toBe(null);
    });

    it('should set Anonymous status', () => {
      store.expireCurrentSession();

      expect(store.status()).toBe(CurrentSessionStatus.Anonymous);
    });

    it('should not call auth gateway logout', () => {
      store.expireCurrentSession();

      expect(authGatewayMock.logout).not.toHaveBeenCalled();
    });
  });

  describe('refresh current user', () => {
    describe('when the gateway answers Authenticated', () => {
      const refreshedUser = UserMocks.currentUser({ firstName: 'Refreshed' });

      // Обновление идет на странице Настроек, куда пускают только после Входа,
      // поэтому сессия сначала восстанавливается с прежними данными.
      beforeEach(() => {
        authGatewayMock.currentSession.mockReturnValueOnce(of(UserMocks.authenticatedSession()));
        store.restoreCurrentSession().subscribe();

        authGatewayMock.currentSession.mockReturnValue(
          of(UserMocks.authenticatedSession(refreshedUser)),
        );
      });

      it('should update the current session', () => {
        store.refreshCurrentUser().subscribe();

        expect(store.currentUser()).toEqual(refreshedUser);
      });

      it('should emit the current user', () => {
        let received: CurrentUser | undefined;

        store.refreshCurrentUser().subscribe((currentUser) => {
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
        store.refreshCurrentUser().subscribe();

        expect(notifierMock.error).not.toHaveBeenCalled();
        expect(notifierMock.success).not.toHaveBeenCalled();
      });

      it('should complete without a value', () => {
        let values: CurrentUser[] | undefined;

        store
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
        store.refreshCurrentUser().subscribe();

        expect(notifierMock.error).toHaveBeenCalledWith('Failed to load profile', 'mockReason');
      });

      it('should complete without a value', () => {
        let values: CurrentUser[] | undefined;

        store
          .refreshCurrentUser()
          .pipe(toArray())
          .subscribe((v) => (values = v));

        expect(values).toEqual([]);
      });

      it('should keep the current session unchanged', () => {
        authGatewayMock.currentSession.mockReturnValueOnce(of(UserMocks.authenticatedSession()));
        store.restoreCurrentSession().subscribe();

        store.refreshCurrentUser().subscribe();

        expect(store.currentUser()).toEqual(UserMocks.currentUser());
      });

      it('should keep the session status unchanged', () => {
        const statusBefore = store.status();

        store.refreshCurrentUser().subscribe();

        expect(store.status()).toBe(statusBefore);
      });
    });
  });

  describe('change avatar', () => {
    let changeAvatarFlow: FormSubmitFlowState;

    beforeEach(() => {
      changeAvatarFlow = createFormSubmitFlowState();

      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));
      store.restoreCurrentSession().subscribe();
    });

    it('should call user gateway with the selected file', () => {
      userGatewayMock.changeAvatar.mockReturnValue(of({ user: userWithNewAvatarMock }));

      store.changeAvatar(changeAvatarInputMock, changeAvatarFlow);

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(userGatewayMock.changeAvatar).toHaveBeenCalledWith(changeAvatarInputMock);
    });

    it('should mark submitting while the request is pending', () => {
      const changeAvatarResult$ = new Subject<ChangeAvatarResult>();
      userGatewayMock.changeAvatar.mockReturnValueOnce(changeAvatarResult$);

      store.changeAvatar(changeAvatarInputMock, changeAvatarFlow);

      expect(changeAvatarFlow.isSubmitting()).toBe(true);
    });

    describe('on success', () => {
      beforeEach(() => {
        userGatewayMock.changeAvatar.mockReturnValue(of({ user: userWithNewAvatarMock }));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        changeAvatarFlow.succeeded$.subscribe(succeededSpy);

        store.changeAvatar(changeAvatarInputMock, changeAvatarFlow);

        expect(succeededSpy).toHaveBeenCalledOnce();
        expect(changeAvatarFlow.isSubmitting()).toBe(false);
      });

      it('should notify about success', () => {
        store.changeAvatar(changeAvatarInputMock, changeAvatarFlow);

        expect(notifierMock.success).toHaveBeenCalledWith(
          'Change avatar',
          'Avatar changed successfully',
        );
      });

      it('should update the current session from the backend response', () => {
        store.changeAvatar(changeAvatarInputMock, changeAvatarFlow);

        expect(store.currentUser()).toEqual(userWithNewAvatarMock);
      });

      it('should keep the session authenticated', () => {
        store.changeAvatar(changeAvatarInputMock, changeAvatarFlow);

        expect(store.status()).toBe(CurrentSessionStatus.Authenticated);
      });

      it('should not navigate', async () => {
        store.changeAvatar(changeAvatarInputMock, changeAvatarFlow);

        await TestBed.inject(ApplicationRef).whenStable();

        expect(TestBed.inject(Router).url).toBe('/');
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
        changeAvatarFlow.succeeded$.subscribe(succeededSpy);

        store.changeAvatar(changeAvatarInputMock, changeAvatarFlow);

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(changeAvatarFlow.isSubmitting()).toBe(false);
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to change avatar', 'mockReason');
      });

      it('should keep the current session unchanged', () => {
        store.changeAvatar(changeAvatarInputMock, changeAvatarFlow);

        expect(store.currentUser()).toEqual(currentUserMock);
      });

      it('should not navigate', async () => {
        store.changeAvatar(changeAvatarInputMock, changeAvatarFlow);

        await TestBed.inject(ApplicationRef).whenStable();

        expect(TestBed.inject(Router).url).toBe('/');
      });
    });
  });

  describe('change password', () => {
    let changePasswordFlow: FormSubmitFlowState;

    beforeEach(() => {
      changePasswordFlow = createFormSubmitFlowState();

      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));
      store.restoreCurrentSession().subscribe();
    });

    it('should call user gateway with form values', () => {
      userGatewayMock.changePassword.mockReturnValue(of(changePasswordResultMock));

      store.changePassword(changePasswordInputMock, changePasswordFlow);

      expect(userGatewayMock.changePassword).toHaveBeenCalledOnce();
      expect(userGatewayMock.changePassword).toHaveBeenCalledWith(changePasswordInputMock);
    });

    it('should mark submitting while the request is pending', () => {
      userGatewayMock.changePassword.mockReturnValue(new Subject<ChangePasswordResult>());

      store.changePassword(changePasswordInputMock, changePasswordFlow);

      expect(changePasswordFlow.isSubmitting()).toBe(true);
    });

    describe('on success', () => {
      beforeEach(() => {
        userGatewayMock.changePassword.mockReturnValue(of(changePasswordResultMock));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        changePasswordFlow.succeeded$.subscribe(succeededSpy);

        store.changePassword(changePasswordInputMock, changePasswordFlow);

        expect(succeededSpy).toHaveBeenCalledOnce();
        expect(changePasswordFlow.isSubmitting()).toBe(false);
      });

      it('should notify about success', () => {
        store.changePassword(changePasswordInputMock, changePasswordFlow);

        expect(notifierMock.success).toHaveBeenCalledWith(
          'Change password',
          'Password changed successfully',
        );
      });

      it('should keep the current user unchanged', () => {
        store.changePassword(changePasswordInputMock, changePasswordFlow);

        expect(store.currentUser()).toEqual(currentUserMock);
      });

      it('should keep the session authenticated', () => {
        store.changePassword(changePasswordInputMock, changePasswordFlow);

        expect(store.status()).toBe(CurrentSessionStatus.Authenticated);
      });

      it('should not navigate', async () => {
        store.changePassword(changePasswordInputMock, changePasswordFlow);

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
        changePasswordFlow.succeeded$.subscribe(succeededSpy);

        store.changePassword(changePasswordInputMock, changePasswordFlow);

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(changePasswordFlow.isSubmitting()).toBe(false);
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to change password', 'mockReason');
      });

      it('should keep the current user unchanged', () => {
        store.changePassword(changePasswordInputMock, changePasswordFlow);

        expect(store.currentUser()).toEqual(currentUserMock);
      });

      it('should keep the session authenticated', () => {
        store.changePassword(changePasswordInputMock, changePasswordFlow);

        expect(store.status()).toBe(CurrentSessionStatus.Authenticated);
      });

      it('should not navigate', async () => {
        store.changePassword(changePasswordInputMock, changePasswordFlow);

        await TestBed.inject(ApplicationRef).whenStable();

        expect(TestBed.inject(Router).url).toBe('/');
      });
    });
  });

  describe('sign in', () => {
    let signInFlow: FormSubmitFlowState;

    beforeEach(() => {
      signInFlow = createFormSubmitFlowState();
    });

    it('should expose the signed-in user once the session is restored', () => {
      authGatewayMock.signIn.mockReturnValue(of({ authenticated: true }));
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));

      store.signIn(signInInputMock, signInFlow);

      expect(store.status()).toBe(CurrentSessionStatus.Authenticated);
      expect(store.currentUser()).toEqual(currentUserMock);
    });

    it('should call auth gateway with form values', () => {
      authGatewayMock.signIn.mockReturnValue(new Subject<{ authenticated: true }>());

      store.signIn(signInInputMock, signInFlow);

      expect(authGatewayMock.signIn).toHaveBeenCalledOnce();
      expect(authGatewayMock.signIn).toHaveBeenCalledWith(signInInputMock);
    });

    it('should mark submitting while the request is pending', () => {
      authGatewayMock.signIn.mockReturnValue(new Subject<{ authenticated: true }>());

      store.signIn(signInInputMock, signInFlow);

      expect(signInFlow.isSubmitting()).toBe(true);
    });

    it('should emit succeeded$ once when the restored session is authenticated', () => {
      authGatewayMock.signIn.mockReturnValue(of({ authenticated: true }));
      authGatewayMock.currentSession.mockReturnValue(of(successResponseMock));
      const succeededSpy = vi.fn();
      signInFlow.succeeded$.subscribe(succeededSpy);

      store.signIn(signInInputMock, signInFlow);

      expect(succeededSpy).toHaveBeenCalledOnce();
      expect(signInFlow.isSubmitting()).toBe(false);
      expect(notifierMock.error).not.toHaveBeenCalled();
    });

    it('should not emit succeeded$ when the restored session is anonymous', () => {
      authGatewayMock.signIn.mockReturnValue(of({ authenticated: true }));
      authGatewayMock.currentSession.mockReturnValue(of(anonymousResponseMock));
      const succeededSpy = vi.fn();
      signInFlow.succeeded$.subscribe(succeededSpy);

      store.signIn(signInInputMock, signInFlow);

      expect(succeededSpy).not.toHaveBeenCalled();
      expect(signInFlow.isSubmitting()).toBe(false);
      expect(notifierMock.error).toHaveBeenCalledWith(
        'Sign-in failed',
        'Login failed. Please try again later',
      );
    });

    it('should notify when the session restore fails after sign-in', () => {
      authGatewayMock.signIn.mockReturnValue(of({ authenticated: true }));
      authGatewayMock.currentSession.mockReturnValue(
        throwError(() => new ApplicationError('mockError')),
      );

      store.signIn(signInInputMock, signInFlow);

      expect(signInFlow.isSubmitting()).toBe(false);
      expect(store.status()).toBe(CurrentSessionStatus.Anonymous);
      expect(notifierMock.error).toHaveBeenCalledWith('Sign-in failed', 'mockError');
    });

    it('should notify with the reason from the backend', () => {
      authGatewayMock.signIn.mockReturnValue(throwError(() => new ApplicationError('mockReason')));

      store.signIn(signInInputMock, signInFlow);

      expect(signInFlow.isSubmitting()).toBe(false);
      expect(authGatewayMock.currentSession).not.toHaveBeenCalled();
      expect(notifierMock.error).toHaveBeenCalledWith('Sign-in failed', 'mockReason');
    });
  });

  describe('sign up', () => {
    let signUpFlow: FormSubmitFlowState;

    beforeEach(() => {
      signUpFlow = createFormSubmitFlowState();
    });

    it('should call auth gateway with form values', () => {
      authGatewayMock.signUp.mockReturnValue(of({ userId: 1 }));

      store.signUp(signUpInputMock, signUpFlow);

      expect(authGatewayMock.signUp).toHaveBeenCalledWith(signUpInputMock);
    });

    it('should mark submitting while the request is pending', () => {
      authGatewayMock.signUp.mockReturnValue(new Subject<{ userId: number }>());

      store.signUp(signUpInputMock, signUpFlow);

      expect(signUpFlow.isSubmitting()).toBe(true);
    });

    it('should emit succeeded$ once when the request succeeds', () => {
      authGatewayMock.signUp.mockReturnValue(of({ userId: 1 }));
      const succeededSpy = vi.fn();
      signUpFlow.succeeded$.subscribe(succeededSpy);

      store.signUp(signUpInputMock, signUpFlow);

      expect(succeededSpy).toHaveBeenCalledOnce();
      expect(signUpFlow.isSubmitting()).toBe(false);
      expect(notifierMock.error).not.toHaveBeenCalled();
    });

    it('should notify with the reason from the backend', () => {
      authGatewayMock.signUp.mockReturnValue(throwError(() => new ApplicationError('mockReason')));
      const succeededSpy = vi.fn();
      signUpFlow.succeeded$.subscribe(succeededSpy);

      store.signUp(signUpInputMock, signUpFlow);

      expect(succeededSpy).not.toHaveBeenCalled();
      expect(signUpFlow.isSubmitting()).toBe(false);
      expect(notifierMock.error).toHaveBeenCalledWith('Sign-up failed', 'mockReason');
    });
  });
});
