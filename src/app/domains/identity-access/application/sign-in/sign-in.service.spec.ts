import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AuthFlowStatus } from '../auth-flow-status';
import { AUTH_GATEWAY } from '../auth.gateway';

import { SignInInput } from './sign-in.input';
import { SignInService } from './sign-in.service';

import { ApplicationError } from '@app/shared/errors';

const authGatewayMock = {
  signIn: vi.fn(),
};

const signInInputMock: SignInInput = {
  login: 'mockLogin',
  password: 'mockPassword',
};

describe('SignIn', () => {
  let service: SignInService;

  beforeEach(() => {
    authGatewayMock.signIn.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
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
      const signInResult$ = new Subject<{ authenticated: true }>();
      authGatewayMock.signIn.mockReturnValue(signInResult$);

      service.errorMessage.set('mockError');

      service.signIn(signInInputMock);

      expect(service.errorMessage()).toBe(null);
      expect(service.isSubmitting()).toBe(true);
      expect(service.status()).toBe(AuthFlowStatus.Submitting);
    });

    it('should set success state when request succeeds', () => {
      const signInResult$ = of({ authenticated: true });
      authGatewayMock.signIn.mockReturnValue(signInResult$);

      service.signIn(signInInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Success);
      expect(service.errorMessage()).toBeNull();
      expect(service.isSubmitting()).toBe(false);
    });

    it('should show application error message', () => {
      const signInResult$ = throwError(() => {
        return new ApplicationError('mockReason');
      });
      authGatewayMock.signIn.mockReturnValue(signInResult$);

      service.signIn(signInInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe('mockReason');
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('resetSignInStatus', () => {
    it('should reset status', () => {
      service.status.set(AuthFlowStatus.Submitting);

      service.resetSignInStatus();
      expect(service.status()).toBe(AuthFlowStatus.Idle);
    });

    it('should reset error message', () => {
      service.errorMessage.set('mockError');

      service.resetSignInStatus();
      expect(service.errorMessage()).toBeNull();
    });
  });
});
