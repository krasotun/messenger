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
      authGatewayMock.signUp.mockReturnValueOnce(
        throwError(() => new ApplicationError('mockError')),
      );

      service.signUp(signUpInputMock);

      expect(service.errorMessage()).toBe('mockError');

      const signUpResult$ = new Subject<{ userId: number }>();
      authGatewayMock.signUp.mockReturnValueOnce(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.errorMessage()).toBeNull();
      expect(service.status()).toBe(AuthFlowStatus.Submitting);
    });

    it('should set success state when request succeeds', () => {
      const signUpResult$ = of({ userId: 1 });
      authGatewayMock.signUp.mockReturnValue(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Success);
      expect(service.errorMessage()).toBeNull();
    });

    it('should show application error message', () => {
      const signUpResult$ = throwError(() => {
        return new ApplicationError('mockReason');
      });
      authGatewayMock.signUp.mockReturnValue(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe('mockReason');
    });
  });

  describe('reset', () => {
    it('should reset status and error message', () => {
      authGatewayMock.signUp.mockReturnValueOnce(
        throwError(() => new ApplicationError('mockError')),
      );

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe('mockError');

      service.reset();

      expect(service.status()).toBe(AuthFlowStatus.Idle);
      expect(service.errorMessage()).toBeNull();
    });
  });
});
