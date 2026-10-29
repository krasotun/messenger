import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY, CurrentSessionResult, SignInInput, SignUpInput } from './auth-gateway';
import { CurrentSessionStatus } from './current-session-status';
import { CurrentSessionStore } from './current-session-store';
import { CurrentUser } from './current-user';

import { UserMocks } from '@domains/users/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { createFormSubmitFlowState, FormSubmitFlowState } from '@shared/submit-flow';

const currentUserMock = UserMocks.currentUser();

const successResponseMock = UserMocks.authenticatedSession(currentUserMock);

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
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let store: CurrentSessionStore;

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
