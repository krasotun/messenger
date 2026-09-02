import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ChangePasswordRequestDto } from './change-password/change-password.dto';
import { CurrentUserDto } from './current-session/current-user.dto';
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

      request.flush(currentUserDtoMock);

      expect(results).toEqual([currentUserDtoMock]);
    });
  });
});
