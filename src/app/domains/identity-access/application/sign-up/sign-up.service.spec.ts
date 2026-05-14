import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AuthFlowStatus } from '../auth-flow-status';
import { AUTH_GATEWAY } from '../auth.gateway';

import { SignUpInput } from './sign-up.input';
import { SignUpService } from './sign-up.service';

import { ApplicationError } from '@app/shared/errors';

const authGatewayMock = {
  signUp: vi.fn(),
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

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
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

    it('errorMessage should be null', () => {
      expect(service.errorMessage()).toBeNull();
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

    it('should set submitting state and clear error message while request is pending', () => {
      const signUpResult$ = new Subject<{ userId: number }>();
      authGatewayMock.signUp.mockReturnValue(signUpResult$);

      service.errorMessage.set('mockError');

      service.signUp(signUpInputMock);

      expect(service.errorMessage()).toBe(null);
      expect(service.isSubmitting()).toBe(true);
      expect(service.status()).toBe(AuthFlowStatus.Submitting);
    });

    it('should set success state when request succeeds', () => {
      const signUpResult$ = of({ userId: 1 });
      authGatewayMock.signUp.mockReturnValue(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Success);
      expect(service.errorMessage()).toBeNull();
      expect(service.isSubmitting()).toBe(false);
    });

    it('should show application error message', () => {
      const signUpResult$ = throwError(() => {
        return new ApplicationError('mockReason');
      });
      authGatewayMock.signUp.mockReturnValue(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe('mockReason');
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('resetSignUpStatus', () => {
    it('should reset status', () => {
      service.status.set(AuthFlowStatus.Submitting);
      service.resetSignUpStatus();
      expect(service.status()).toBe(AuthFlowStatus.Idle);
    });

    it('should reset error message', () => {
      service.errorMessage.set('mockError');
      service.resetSignUpStatus();
      expect(service.errorMessage()).toBeNull();
    });
  });
});
