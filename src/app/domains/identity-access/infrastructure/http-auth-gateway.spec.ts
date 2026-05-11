import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SignUpInput } from '../application/sign-up/sign-up.input';

import { AuthApi } from './auth.api';
import { HttpAuthGateway } from './http-auth-gateway';
import { SignUpRequestDto } from './sign-up/sign-up.dto';

import { ApplicationError } from '@app/shared/errors';

const authApiMock = {
  signUp: vi.fn(),
};

const signUpInputMock: SignUpInput = {
  firstName: 'John',
  secondName: 'Doe',
  login: 'john.doe',
  email: 'john.doe@example.com',
  password: 'password123',
  phone: '+79990000000',
};

const signUpRequestMock: SignUpRequestDto = {
  first_name: 'John',
  second_name: 'Doe',
  login: 'john.doe',
  email: 'john.doe@example.com',
  password: 'password123',
  phone: '+79990000000',
};

describe('HttpAuthGateway', () => {
  let service: HttpAuthGateway;

  beforeEach(() => {
    authApiMock.signUp.mockReset();

    TestBed.configureTestingModule({
      providers: [
        HttpAuthGateway,
        {
          provide: AuthApi,
          useValue: authApiMock,
        },
      ],
    });
    service = TestBed.inject(HttpAuthGateway);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signUp', () => {
    it('should call api with correct request', () => {
      authApiMock.signUp.mockImplementation(() => of({ id: 1 }));

      service.signUp(signUpInputMock).subscribe();

      expect(authApiMock.signUp).toHaveBeenCalledOnce();
      expect(authApiMock.signUp).toHaveBeenCalledWith(signUpRequestMock);
    });

    it('should transform id to userId', () => {
      authApiMock.signUp.mockReturnValue(of({ id: 1 }));

      service.signUp(signUpInputMock).subscribe({
        next: (response) => {
          expect(response).toEqual({ userId: 1 });
        },
      });
    });

    it('should map backend error reason to ApplicationError', () => {
      const error = new HttpErrorResponse({
        error: { reason: 'Login already exists' },
        status: 400,
      });

      authApiMock.signUp.mockReturnValue(throwError(() => error));

      service.signUp(signUpInputMock).subscribe({
        error: (applicationError) => {
          expect(applicationError).toBeInstanceOf(ApplicationError);
          expect(applicationError.message).toBe('Login already exists');
        },
      });
    });

    it('should map generic error to ApplicationError', () => {
      const error = 'mockError';

      authApiMock.signUp.mockReturnValue(throwError(() => error));

      service.signUp(signUpInputMock).subscribe({
        error: (applicationError) => {
          expect(applicationError).toBeInstanceOf(ApplicationError);
          expect(applicationError.message).toBe('Failed to sign up. Please try again.');
        },
      });
    });
  });
});
