import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CurrentSessionStatus } from '../application/current-session/current-session-status';
import { CurrentUser } from '../application/current-session/current-user';
import { SignInInput } from '../application/sign-in/sign-in.input';
import { SignUpInput } from '../application/sign-up/sign-up.input';

import { AuthApi } from './auth.api';
import { CurrentUserDto } from './current-session/current-user.dto';
import { HttpAuthGateway } from './http-auth-gateway';
import { SignInRequestDto } from './sign-in/sign-in.dto';
import { SignUpRequestDto } from './sign-up/sign-up.dto';

import { ApplicationError } from '@app/shared/errors';

const authApiMock = {
  signUp: vi.fn(),
  signIn: vi.fn(),
  currentSession: vi.fn(),
  logout: vi.fn(),
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

const signInInputMock: SignInInput = {
  login: 'mockLogin',
  password: 'mockPassword',
};

const signInRequestMock: SignInRequestDto = {
  login: 'mockLogin',
  password: 'mockPassword',
};

const currentUserDtoMock: CurrentUserDto = {
  id: 1,
  first_name: 'first',
  second_name: 'second',
  display_name: null,
  avatar: null,
  email: 'email',
  login: 'login',
  phone: 'phone',
};

const currentUserMock: CurrentUser = {
  id: 1,
  firstName: 'first',
  secondName: 'second',
  displayName: null,
  avatar: null,
  email: 'email',
  login: 'login',
  phone: 'phone',
};

describe('HttpAuthGateway', () => {
  let service: HttpAuthGateway;

  beforeEach(() => {
    authApiMock.signUp.mockReset();
    authApiMock.signIn.mockReset();
    authApiMock.currentSession.mockReset();
    authApiMock.logout.mockReset();

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

  describe('signIn', () => {
    it('should call api with correct request', () => {
      authApiMock.signIn.mockImplementation(() => of({}));

      service.signIn(signInInputMock).subscribe();

      expect(authApiMock.signIn).toHaveBeenCalledOnce();
      expect(authApiMock.signIn).toHaveBeenCalledWith(signInRequestMock);
    });

    it('should transform successful response to sign-in result', () => {
      authApiMock.signIn.mockImplementation(() => of({}));

      service.signIn(signInInputMock).subscribe({
        next: (response) => {
          expect(response).toEqual({ authenticated: true });
        },
      });
    });

    it('should map generic error to ApplicationError', () => {
      const error = 'mockError';

      authApiMock.signIn.mockReturnValue(throwError(() => error));

      service.signIn(signInInputMock).subscribe({
        error: (applicationError) => {
          expect(applicationError).toBeInstanceOf(ApplicationError);
          expect(applicationError.message).toBe('Failed to sign in. Please try again.');
        },
      });
    });
  });

  describe('currentSession', () => {
    it('should call api', () => {
      authApiMock.currentSession.mockReturnValue(of(currentUserDtoMock));

      service.currentSession().subscribe();

      expect(authApiMock.currentSession).toHaveBeenCalledOnce();
    });

    it('should transform successful response to Authenticated', () => {
      authApiMock.currentSession.mockImplementation(() => of(currentUserDtoMock));

      service.currentSession().subscribe((response) => {
        expect(response).toEqual({
          status: CurrentSessionStatus.Authenticated,
          user: currentUserMock,
        });
      });
    });

    it('should transform 401 error to Anonymous', () => {
      const noSessionError = new HttpErrorResponse({
        status: 401,
      });

      authApiMock.currentSession.mockImplementation(() => throwError(() => noSessionError));

      service.currentSession().subscribe((response) => {
        expect(response).toEqual({
          status: CurrentSessionStatus.Anonymous,
        });
      });
    });

    it('should map generic error to ApplicationError', () => {
      const error = 'mockError';

      authApiMock.currentSession.mockReturnValue(throwError(() => error));

      service.currentSession().subscribe({
        error: (applicationError) => {
          expect(applicationError).toBeInstanceOf(ApplicationError);
          expect(applicationError.message).toBe('Failed to load session. Please try again.');
        },
      });
    });
  });

  describe('logout', () => {
    it('should call api', () => {
      authApiMock.logout.mockReturnValue(of(undefined));

      service.logout().subscribe();

      expect(authApiMock.logout).toHaveBeenCalledOnce();
    });

    it('should map generic error to ApplicationError', () => {
      const error = 'mockError';

      authApiMock.logout.mockReturnValue(throwError(() => error));

      service.logout().subscribe({
        error: (applicationError) => {
          expect(applicationError).toBeInstanceOf(ApplicationError);
          expect(applicationError.message).toBe('Failed to logout. Please try again.');
        },
      });
    });
  });
});
