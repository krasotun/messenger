import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SignInInput, SignUpInput } from './auth-gateway';
import { CurrentSessionStatus } from './current-session-status';
import { CurrentUser } from './current-user';
import { HttpAuthGateway } from './http-auth-gateway';
import { AUTH_ERROR_MESSAGES } from './internal/error-messages';
import { SignInRequestDto } from './internal/sign-in-dto';
import { SignUpRequestDto } from './internal/sign-up-dto';
import { UserDto } from './internal/user-dto';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { ApplicationError } from '@shared/errors';

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

const currentUserDtoMock: UserDto = {
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

const resourcesBaseUrlMock = 'https://mock.host/resources';

// Ответ с причиной - как отказ бэкенда; без причины - как сбой сервера,
// для которого Шлюз подставляет свой текст.
const flushRejection = (request: TestRequest): void => {
  request.flush({ reason: 'mockReason' }, { status: 400, statusText: 'Bad Request' });
};

const flushServerFailure = (request: TestRequest): void => {
  request.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
};

describe('HttpAuthGateway', () => {
  let service: HttpAuthGateway;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpAuthGateway,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: RESOURCES_BASE_URL,
          useValue: resourcesBaseUrlMock,
        },
      ],
    });

    service = TestBed.inject(HttpAuthGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signUp', () => {
    const signUp = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.signUp(signUpInputMock).subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send POST request with mapped snake_case body', () => {
      signUp();

      const request = httpTestingController.expectOne('/auth/signup');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(signUpRequestMock);

      request.flush({ id: 1 });
    });

    it('should transform id to userId', () => {
      const { results } = signUp();

      httpTestingController.expectOne('/auth/signup').flush({ id: 1 });

      expect(results).toEqual([{ userId: 1 }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const { errors } = signUp();

      flushRejection(httpTestingController.expectOne('/auth/signup'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = signUp();

      flushServerFailure(httpTestingController.expectOne('/auth/signup'));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(AUTH_ERROR_MESSAGES.signUp);
    });
  });

  describe('signIn', () => {
    const signIn = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.signIn(signInInputMock).subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send POST request with login and password and read response as text', () => {
      signIn();

      const request = httpTestingController.expectOne('/auth/signin');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(signInRequestMock);
      expect(request.request.responseType).toBe('text');

      request.flush('OK');
    });

    it('should transform successful response to sign-in result', () => {
      const { results } = signIn();

      httpTestingController.expectOne('/auth/signin').flush('OK');

      expect(results).toEqual([{ authenticated: true }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const { errors } = signIn();

      flushRejection(httpTestingController.expectOne('/auth/signin'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = signIn();

      flushServerFailure(httpTestingController.expectOne('/auth/signin'));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(AUTH_ERROR_MESSAGES.signIn);
    });
  });

  describe('currentSession', () => {
    const loadCurrentSession = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.currentSession().subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send GET request to the current user url', () => {
      loadCurrentSession();

      const request = httpTestingController.expectOne('/auth/user');

      expect(request.request.method).toBe('GET');

      request.flush(currentUserDtoMock);
    });

    it('should transform successful response to Authenticated', () => {
      const { results } = loadCurrentSession();

      httpTestingController.expectOne('/auth/user').flush(currentUserDtoMock);

      expect(results).toEqual([
        {
          status: CurrentSessionStatus.Authenticated,
          user: currentUserMock,
        },
      ]);
    });

    it('should transform 401 error to Anonymous', () => {
      const { results, errors } = loadCurrentSession();

      httpTestingController
        .expectOne('/auth/user')
        .flush({ reason: 'Cookie is not valid' }, { status: 401, statusText: 'Unauthorized' });

      expect(results).toEqual([
        {
          status: CurrentSessionStatus.Anonymous,
        },
      ]);
      expect(errors).toEqual([]);
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = loadCurrentSession();

      flushServerFailure(httpTestingController.expectOne('/auth/user'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe(AUTH_ERROR_MESSAGES.currentSession);
    });
  });

  describe('logout', () => {
    const logout = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.logout().subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send POST request without body', () => {
      logout();

      const request = httpTestingController.expectOne('/auth/logout');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toBeNull();

      request.flush(null);
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = logout();

      flushServerFailure(httpTestingController.expectOne('/auth/logout'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe(AUTH_ERROR_MESSAGES.logout);
    });
  });
});
