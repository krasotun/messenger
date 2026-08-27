import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ChangePasswordRequestDto } from './change-password/change-password.dto';
import { UserApi } from './user.api';

const changePasswordRequestMock: ChangePasswordRequestDto = {
  oldPassword: 'mockOldPassword',
  newPassword: 'mockNewPassword',
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
      service.changePassword(changePasswordRequestMock).subscribe((response) => {
        expect(response).toBe('OK');
      });

      const request = httpTestingController.expectOne('/user/password');

      expect(request.request.method).toBe('PUT');
      expect(request.request.body).toEqual(changePasswordRequestMock);
      expect(request.request.responseType).toBe('text');
      expect(request.request.withCredentials).toBe(false);

      request.flush('OK');
    });
  });
});
