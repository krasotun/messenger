import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthApi } from './auth.api';
import { SignUpRequestDto } from './sign-up.dto';

import { API_BASE_URL } from '@app/core/tokens';

const signUpRequestMock: SignUpRequestDto = {
  first_name: 'mockFirstName',
  second_name: 'mockSecondName',
  login: 'mockLogin',
  email: 'mock@email.email',
  password: 'mockPassword',
  phone: '79999999999',
};

const mockBaseUrl = 'https://api.example.test';

describe('AuthApi', () => {
  let service: AuthApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: API_BASE_URL,
          useValue: mockBaseUrl,
        },
      ],
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

      const request = httpTestingController.expectOne(`${mockBaseUrl}/auth/signup`);

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(signUpRequestMock);

      request.flush({ id: 1 });
    });
  });
});
