import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AuthFlowStatus } from '../auth-flow-status.type';
import { AUTH_GATEWAY } from '../auth.gateway';

import { SignUpInput } from './sign-up-input.type';
import { SignUpService } from './sign-up.service';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

const authGatewayMock = {
  signUp: vi.fn(),
};

const notifierMock = {
  success: vi.fn(),
  error: vi.fn(),
};

const signUpInputMock: SignUpInput = {
  firstName: 'mockFirstName',
  secondName: 'mockSecondName',
  login: 'mockLogin',
  email: 'mock@email.email',
  password: 'mockPassword',
  phone: '79999999999',
};

describe('SignUpService', () => {
  let service: SignUpService;

  beforeEach(() => {
    authGatewayMock.signUp.mockReset();

    notifierMock.success.mockReset();
    notifierMock.error.mockReset();

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
    service = TestBed.inject(SignUpService);
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

  describe('signUp', () => {
    it('calls authGateway with form values', () => {
      authGatewayMock.signUp.mockReturnValue(of({ userId: 1 }));

      service.signUp(signUpInputMock);

      expect(authGatewayMock.signUp).toHaveBeenCalledWith(signUpInputMock);
    });

    it('should set submitting state while request is pending', () => {
      const signUpResult$ = new Subject<{ userId: number }>();
      authGatewayMock.signUp.mockReturnValueOnce(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Submitting);
    });

    it('should set success state when request succeeds', () => {
      const signUpResult$ = of({ userId: 1 });
      authGatewayMock.signUp.mockReturnValue(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Success);
      expect(notifierMock.error).not.toHaveBeenCalled();
    });

    it('should set error state and notify with the reason from the backend', () => {
      const signUpResult$ = throwError(() => {
        return new ApplicationError('mockReason');
      });
      authGatewayMock.signUp.mockReturnValue(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(notifierMock.error).toHaveBeenCalledWith('Sign-up failed', 'mockReason');
    });
  });

  describe('reset', () => {
    it('should reset status', () => {
      authGatewayMock.signUp.mockReturnValueOnce(
        throwError(() => new ApplicationError('mockError')),
      );

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);

      service.reset();

      expect(service.status()).toBe(AuthFlowStatus.Idle);
    });
  });
});
