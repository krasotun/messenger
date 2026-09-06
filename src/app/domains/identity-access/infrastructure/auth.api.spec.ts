import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthApi } from './auth.api';
import { CurrentUserDto } from './current-session/current-user-dto.type';
import { SignInRequestDto } from './sign-in/sign-in-dto.type';
import { SignUpRequestDto } from './sign-up/sign-up-dto.type';

const signUpRequestMock: SignUpRequestDto = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockLogin',
  email: 'mock@email.email',
  password: 'mockPassword',
  phone: '79999999999',
};

const signInRequestMock: SignInRequestDto = {
  login: 'mockLogin',
  password: 'mockPassword',
};

const currentSessionResponseMock: CurrentUserDto = {
  id: 1,
  first_name: 'firstName',
  second_name: 'secondName',
  display_name: 'displayName',
  phone: 'phone',
  login: 'login',
  avatar: 'avatar',
  email: 'email',
};

describe('AuthApi', () => {
  let service: AuthApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signUp', () => {
    it('should send POST request to correct URL with correct data', () => {
      const results: unknown[] = [];

      service.signUp(signUpRequestMock).subscribe((response) => {
        results.push(response);
      });

      const request = httpTestingController.expectOne('/auth/signup');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(signUpRequestMock);

      request.flush({ id: 1 });

      expect(results).toEqual([{ id: 1 }]);
    });
  });

  describe('signIn', () => {
    it('should send POST request to correct url with correct data', () => {
      const results: unknown[] = [];

      service.signIn(signInRequestMock).subscribe((response) => {
        results.push(response);
      });

      const request = httpTestingController.expectOne('/auth/signin');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(signInRequestMock);
      expect(request.request.responseType).toBe('text');

      request.flush('OK');

      expect(results).toEqual(['OK']);
    });
  });

  describe('currentSession', () => {
    it('should send GET request to correct URL', () => {
      const results: unknown[] = [];

      service.currentSession().subscribe((response) => {
        results.push(response);
      });

      const request = httpTestingController.expectOne('/auth/user');

      expect(request.request.method).toBe('GET');

      request.flush(currentSessionResponseMock);

      expect(results).toEqual([currentSessionResponseMock]);
    });
  });

  describe('logout', () => {
    it('should send POST request to correct URL', () => {
      const results: unknown[] = [];

      service.logout().subscribe((response) => {
        results.push(response);
      });

      const request = httpTestingController.expectOne('/auth/logout');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toBeNull();

      request.flush(null);

      expect(results).toEqual([null]);
    });
  });
});
