import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AuthFlowStatus } from '../auth-flow-status';
import { AUTH_GATEWAY } from '../auth.gateway';
import { CurrentSessionResult } from '../current-session/current-session-result';
import { CurrentSessionStatus } from '../current-session/current-session-status';
import { CurrentSessionService } from '../current-session/current-session.service';
import { CurrentUser } from '../current-session/current-user';

import { SignInInput } from './sign-in.input';
import { SignInService } from './sign-in.service';

import { ApplicationError, mapHttpError, REQUEST_TIMED_OUT_MESSAGE } from '@shared/errors';

const authGatewayMock = {
  signIn: vi.fn(),
};

const currentSessionServiceMock = {
  restoreCurrentSession: vi.fn(),
  logout: vi.fn(),
};

const signInInputMock: SignInInput = {
  login: 'mockLogin',
  password: 'mockPassword',
};

const currentUserMock: CurrentUser = {
  id: 1,
  avatar: null,
  displayName: 'displayName',
  email: 'email',
  firstName: 'firstName',
  login: 'login',
  phone: 'phone',
  secondName: 'secondName',
};

const successResponseMock: CurrentSessionResult = {
  status: CurrentSessionStatus.Authenticated,
  user: currentUserMock,
};

describe('SignIn', () => {
  let service: SignInService;

  beforeEach(() => {
    authGatewayMock.signIn.mockReset();

    currentSessionServiceMock.restoreCurrentSession.mockReset();
    currentSessionServiceMock.logout.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
        },

        {
          provide: CurrentSessionService,
          useValue: currentSessionServiceMock,
        },
      ],
    });
    service = TestBed.inject(SignInService);
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

  describe('signIn', () => {
    it('calls authGateway with form values', () => {
      authGatewayMock.signIn.mockImplementation(() => of({ authenticated: true }));

      service.signIn(signInInputMock);

      expect(authGatewayMock.signIn).toHaveBeenCalledOnce();
      expect(authGatewayMock.signIn).toHaveBeenCalledWith(signInInputMock);
    });

    it('should set submitting state and clear error message while request is pending', () => {
      authGatewayMock.signIn.mockReturnValueOnce(
        throwError(() => new ApplicationError('mockError')),
      );

      service.signIn(signInInputMock);

      expect(service.errorMessage()).toBe('mockError');

      const signInResult$ = new Subject<{ authenticated: true }>();
      authGatewayMock.signIn.mockReturnValueOnce(signInResult$);

      service.signIn(signInInputMock);

      expect(service.errorMessage()).toBeNull();
      expect(service.status()).toBe(AuthFlowStatus.Submitting);
    });

    it('should set success state when request succeeds and current session is authenticated', () => {
      const signInResult$ = of({ authenticated: true });
      authGatewayMock.signIn.mockReturnValue(signInResult$);
      currentSessionServiceMock.restoreCurrentSession.mockReturnValue(of(successResponseMock));

      service.signIn(signInInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Success);
      expect(service.errorMessage()).toBeNull();
    });

    it('should set error state when request succeeds but current session is anonymous', () => {
      authGatewayMock.signIn.mockReturnValue(of({ authenticated: true }));
      currentSessionServiceMock.restoreCurrentSession.mockReturnValue(
        of({
          status: CurrentSessionStatus.Anonymous,
        }),
      );

      service.signIn(signInInputMock);
      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe('Login failed. Please try again later');
    });

    it('should set error state when request succeeds but current session restore fails', () => {
      authGatewayMock.signIn.mockReturnValue(of({ authenticated: true }));
      currentSessionServiceMock.restoreCurrentSession.mockReturnValue(
        throwError(() => new ApplicationError('mockError')),
      );

      service.signIn(signInInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe('mockError');
    });

    it('should show application error message', () => {
      const signInResult$ = throwError(() => {
        return new ApplicationError('mockReason');
      });
      authGatewayMock.signIn.mockReturnValue(signInResult$);

      service.signIn(signInInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe('mockReason');
    });

    it('should show the timeout message when the request does not fit the time limit', () => {
      const timedOutResponse = new HttpErrorResponse({
        error: new DOMException('Request timed out', 'TimeoutError'),
        status: 0,
        statusText: 'Request timeout',
      });
      authGatewayMock.signIn.mockReturnValue(
        throwError(() => mapHttpError(timedOutResponse, 'Failed to sign in. Please try again.')),
      );

      service.signIn(signInInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe(REQUEST_TIMED_OUT_MESSAGE);
    });

    it('should restore current session after successful sign in', () => {
      authGatewayMock.signIn.mockReturnValue(of({ authenticated: true }));
      currentSessionServiceMock.restoreCurrentSession.mockReturnValue(of(successResponseMock));

      service.signIn(signInInputMock);

      expect(currentSessionServiceMock.restoreCurrentSession).toHaveBeenCalledOnce();
    });
  });

  describe('reset', () => {
    it('should reset status and error message', () => {
      authGatewayMock.signIn.mockReturnValueOnce(
        throwError(() => new ApplicationError('mockError')),
      );

      service.signIn(signInInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe('mockError');

      service.reset();

      expect(service.status()).toBe(AuthFlowStatus.Idle);
      expect(service.errorMessage()).toBeNull();
    });
  });
});
