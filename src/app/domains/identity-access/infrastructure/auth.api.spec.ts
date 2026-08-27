import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthApi } from './auth.api';
import { CurrentUserDto } from './current-session/current-user.dto';
import { SignInRequestDto } from './sign-in/sign-in.dto';
import { SignUpRequestDto } from './sign-up/sign-up.dto';

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
      service.signUp(signUpRequestMock).subscribe((response) => {
        expect(response).toEqual({ id: 1 });
      });

      const request = httpTestingController.expectOne('/auth/signup');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(signUpRequestMock);

      request.flush({ id: 1 });
    });
  });

  describe('signIn', () => {
    it('should send POST request to correct url with correct data', () => {
      service.signIn(signInRequestMock).subscribe((response) => {
        expect(response).toBe('OK');
      });

      const request = httpTestingController.expectOne('/auth/signin');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(signInRequestMock);
      expect(request.request.responseType).toBe('text');

      request.flush('OK');
    });
  });

  describe('currentSession', () => {
    it('should send GET request to correct URL', () => {
      service.currentSession().subscribe((response) => {
        expect(response).toEqual(currentSessionResponseMock);
      });

      const request = httpTestingController.expectOne('/auth/user');

      expect(request.request.method).toBe('GET');

      request.flush(currentSessionResponseMock);
    });
  });

  describe('logout', () => {
    it('should send POST request to correct URL', () => {
      service.logout().subscribe((response) => {
        expect(response).toBeNull();
      });

      const request = httpTestingController.expectOne('/auth/logout');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toBeNull();

      request.flush(null);
    });
  });
});
