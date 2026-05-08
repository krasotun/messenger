import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AuthApi } from '../infrastructure/auth.api';
import { SignUpRequestDto } from '../infrastructure/sign-up.dto';

import { SignUpInput } from './sign-up.input';
import { SignUpService, SignUpStatus } from './sign-up.service';

const authApiMock = {
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

const signUpRequestMock: SignUpRequestDto = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockLogin',
  email: 'mock@email.email',
  password: 'mockPassword',
  phone: '79999999999',
};

describe('SignUpService', () => {
  let service: SignUpService;

  beforeEach(() => {
    authApiMock.signUp.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthApi,
          useValue: authApiMock,
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
      expect(service.status()).toBe(SignUpStatus.Idle);
    });

    it('errorMessage should be null', () => {
      expect(service.errorMessage()).toBeNull();
    });

    it('isSubmitting should be false', () => {
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('signUp', () => {
    it('calls authApi with mappedRequest', () => {
      authApiMock.signUp.mockReturnValue(of({ id: 1 }));

      service.signUp(signUpInputMock);

      expect(authApiMock.signUp).toHaveBeenCalledWith(signUpRequestMock);
    });

    it('should set submitting state and clear error message while request is pending', () => {
      const signUpResult$ = new Subject<{ id: number }>();
      authApiMock.signUp.mockReturnValue(signUpResult$);

      service.errorMessage.set('mockError');

      service.signUp(signUpInputMock);

      expect(service.errorMessage()).toBe(null);
      expect(service.isSubmitting()).toBe(true);
      expect(service.status()).toBe(SignUpStatus.Submitting);
    });

    it('should set success state when request succeeds', () => {
      const signUpResult$ = of({ id: 1 });
      authApiMock.signUp.mockReturnValue(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(SignUpStatus.Success);
      expect(service.errorMessage()).toBeNull();
      expect(service.isSubmitting()).toBe(false);
    });

    it('should show error reason from backend', () => {
      const signUpResult$ = throwError(() => {
        return new HttpErrorResponse({
          status: 400,
          error: {
            reason: 'mockReason',
          },
        });
      });
      authApiMock.signUp.mockReturnValue(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(SignUpStatus.Error);
      expect(service.errorMessage()).toBe('mockReason');
      expect(service.isSubmitting()).toBe(false);
    });

    it('should show generic error', () => {
      const signUpResult$ = throwError(() => {
        return new Error('mockError');
      });
      authApiMock.signUp.mockReturnValue(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.status()).toBe(SignUpStatus.Error);
      expect(service.errorMessage()).toBe('Failed to sign up. Please try again.');
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('resetSignUpStatus', () => {
    it('should reset status', () => {
      service.status.set(SignUpStatus.Submitting);
      service.resetSignUpStatus();
      expect(service.status()).toBe(SignUpStatus.Idle);
    });

    it('should reset error message', () => {
      service.errorMessage.set('mockError');
      service.resetSignUpStatus();
      expect(service.errorMessage()).toBeNull();
    });
  });
});
