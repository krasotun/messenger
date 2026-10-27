import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';
import { CurrentSessionStatus } from '../current-session/current-session-status.type';
import { CurrentSessionService } from '../current-session/current-session.service';

import { SignInInput } from './sign-in-input.type';
import { SignInService } from './sign-in.service';

import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const currentSessionServiceMock = {
  restoreCurrentSession: vi.fn(),
  logout: vi.fn(),
};

const signInInputMock: SignInInput = {
  login: 'mockLogin',
  password: 'mockPassword',
};

const currentUserMock = IdentityMocks.currentUser();

const successResponseMock = IdentityMocks.authenticatedSession(currentUserMock);

describe('SignIn', () => {
  let authGatewayMock: ReturnType<typeof IdentityMocks.authGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let service: SignInService;

  beforeEach(() => {
    authGatewayMock = IdentityMocks.authGateway();
    notifierMock = NotificationMocks.notifier();

    currentSessionServiceMock.restoreCurrentSession.mockReset();
    currentSessionServiceMock.logout.mockReset();

    TestBed.configureTestingModule({
      providers: [
        SignInService,

        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
        },

        {
          provide: CurrentSessionService,
          useValue: currentSessionServiceMock,
        },

        {
          provide: NOTIFIER,
          useValue: notifierMock,
        },
      ],
    });
    service = TestBed.inject(SignInService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('isSubmitting should be false', () => {
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('signIn', () => {
    it('calls authGateway with form values', () => {
      authGatewayMock.signIn.mockImplementation(() => of({ authenticated: true }));

      service.signIn(signInInputMock);

      expect(authGatewayMock.signIn).toHaveBeenCalledOnce();
      expect(authGatewayMock.signIn).toHaveBeenCalledWith(signInInputMock);
    });

    it('should set submitting state while request is pending', () => {
      const signInResult$ = new Subject<{ authenticated: true }>();
      authGatewayMock.signIn.mockReturnValueOnce(signInResult$);

      service.signIn(signInInputMock);

      expect(service.isSubmitting()).toBe(true);
    });

    it('should emit succeeded$ once when request succeeds and current session is authenticated', () => {
      const signInResult$ = of({ authenticated: true });
      authGatewayMock.signIn.mockReturnValue(signInResult$);
      currentSessionServiceMock.restoreCurrentSession.mockReturnValue(of(successResponseMock));
      const succeededSpy = vi.fn();
      service.succeeded$.subscribe(succeededSpy);

      service.signIn(signInInputMock);

      expect(succeededSpy).toHaveBeenCalledOnce();
      expect(service.isSubmitting()).toBe(false);
      expect(notifierMock.error).not.toHaveBeenCalled();
    });

    it('should not emit succeeded$ when request succeeds but current session is anonymous', () => {
      authGatewayMock.signIn.mockReturnValue(of({ authenticated: true }));
      currentSessionServiceMock.restoreCurrentSession.mockReturnValue(
        of({
          status: CurrentSessionStatus.Anonymous,
        }),
      );
      const succeededSpy = vi.fn();
      service.succeeded$.subscribe(succeededSpy);

      service.signIn(signInInputMock);

      expect(succeededSpy).not.toHaveBeenCalled();
      expect(service.isSubmitting()).toBe(false);
      expect(notifierMock.error).toHaveBeenCalledWith(
        'Sign-in failed',
        'Login failed. Please try again later',
      );
    });

    it('should notify when request succeeds but current session restore fails', () => {
      authGatewayMock.signIn.mockReturnValue(of({ authenticated: true }));
      currentSessionServiceMock.restoreCurrentSession.mockReturnValue(
        throwError(() => new ApplicationError('mockError')),
      );

      service.signIn(signInInputMock);

      expect(service.isSubmitting()).toBe(false);
      expect(notifierMock.error).toHaveBeenCalledWith('Sign-in failed', 'mockError');
    });

    it('should notify with the reason from the backend', () => {
      const signInResult$ = throwError(() => {
        return new ApplicationError('mockReason');
      });
      authGatewayMock.signIn.mockReturnValue(signInResult$);

      service.signIn(signInInputMock);

      expect(service.isSubmitting()).toBe(false);
      expect(notifierMock.error).toHaveBeenCalledWith('Sign-in failed', 'mockReason');
    });

    it('should restore current session after successful sign in even without a succeeded$ subscriber', () => {
      authGatewayMock.signIn.mockReturnValue(of({ authenticated: true }));
      currentSessionServiceMock.restoreCurrentSession.mockReturnValue(of(successResponseMock));

      service.signIn(signInInputMock);

      expect(currentSessionServiceMock.restoreCurrentSession).toHaveBeenCalledOnce();
    });
  });
});
