import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ChangePasswordRequestDto } from './change-password/change-password.dto';
import { CurrentUserDto } from './current-session/current-user.dto';
import { UserDto } from './search-users/search-users.dto';
import { UserApi } from './user.api';

const changePasswordRequestMock: ChangePasswordRequestDto = {
  oldPassword: 'mockOldPassword',
  newPassword: 'mockNewPassword',
};

const currentUserDtoMock: CurrentUserDto = {
  id: 1,
  first_name: 'John',
  second_name: 'Doe',
  display_name: 'Johnny',
  avatar: '/path/to/avatar.png',
  email: 'john.doe@example.com',
  login: 'john.doe',
  phone: '+79990000000',
};

const userDtoMock: UserDto = {
  id: 2,
  first_name: 'Jane',
  second_name: 'Roe',
  display_name: 'Janie',
  avatar: null,
  email: 'jane.roe@example.com',
  login: 'jane.roe',
  phone: '+79990000001',
};

describe('UserApi', () => {
  let service: UserApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('changePassword', () => {
    it('should send PUT request to relative url with camelCase body as text', () => {
      const results: unknown[] = [];

      service.changePassword(changePasswordRequestMock).subscribe((response) => {
        results.push(response);
      });

      const request = httpTestingController.expectOne('/user/password');

      expect(request.request.method).toBe('PUT');
      expect(request.request.body).toEqual(changePasswordRequestMock);
      expect(request.request.responseType).toBe('text');
      expect(request.request.withCredentials).toBe(false);
      expect(request.request.timeout).toBeUndefined();

      request.flush('OK');

      expect(results).toEqual(['OK']);
    });
  });

  describe('changeAvatar', () => {
    it('should send PUT request to relative url with form data body', () => {
      const formData = new FormData();
      formData.append('avatar', new File(['mockContent'], 'avatar.png', { type: 'image/png' }));

      const results: unknown[] = [];

      service.changeAvatar(formData).subscribe((response) => {
        results.push(response);
      });

      const request = httpTestingController.expectOne('/user/profile/avatar');

      expect(request.request.method).toBe('PUT');
      expect(request.request.body).toBe(formData);
      expect(request.request.headers.has('Content-Type')).toBe(false);
      expect(request.request.withCredentials).toBe(false);
      expect(request.request.timeout).toBe(60_000);

      request.flush(currentUserDtoMock);

      expect(results).toEqual([currentUserDtoMock]);
    });
  });
  describe('searchUsers', () => {
    it('should send POST request to relative url with the login to search by', () => {
      const results: unknown[] = [];

      service.searchUsers({ login: 'jane' }).subscribe((response) => {
        results.push(response);
      });

      const request = httpTestingController.expectOne('/user/search');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({ login: 'jane' });
      expect(request.request.timeout).toBeUndefined();

      request.flush([userDtoMock]);

      expect(results).toEqual([[userDtoMock]]);
    });
  });
});
