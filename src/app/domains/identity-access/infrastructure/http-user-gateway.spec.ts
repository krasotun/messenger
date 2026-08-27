import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ChangePasswordInput } from '../application/change-password/change-password.input';
import { CurrentUser } from '../application/current-session/current-user';
import { UpdateProfileInput } from '../application/update-profile/update-profile.input';

import { ChangePasswordRequestDto } from './change-password/change-password.dto';
import { CurrentUserDto } from './current-session/current-user.dto';
import { HttpUserGateway } from './http-user-gateway';
import { UpdateProfileRequestDto } from './update-profile/update-profile.dto';
import { UserApi } from './user.api';

import { ApplicationError } from '@shared/errors';

const userApiMock = {
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
};

const changePasswordInputMock: ChangePasswordInput = {
  oldPassword: 'mockOldPassword',
  newPassword: 'mockNewPassword',
};

const changePasswordRequestMock: ChangePasswordRequestDto = {
  oldPassword: 'mockOldPassword',
  newPassword: 'mockNewPassword',
};

const updateProfileInputMock: UpdateProfileInput = {
  firstName: 'John',
  secondName: 'Doe',
  displayName: 'Johnny',
  login: 'john.doe',
  email: 'john.doe@example.com',
  phone: '+79990000000',
};

const updateProfileRequestMock: UpdateProfileRequestDto = {
  first_name: 'John',
  second_name: 'Doe',
  display_name: 'Johnny',
  login: 'john.doe',
  email: 'john.doe@example.com',
  phone: '+79990000000',
};

const currentUserDtoMock: CurrentUserDto = {
  id: 1,
  first_name: 'John',
  second_name: 'Doe',
  display_name: 'Johnny',
  avatar: null,
  email: 'john.doe@example.com',
  login: 'john.doe',
  phone: '+79990000000',
};

const currentUserMock: CurrentUser = {
  id: 1,
  firstName: 'John',
  secondName: 'Doe',
  displayName: 'Johnny',
  avatar: null,
  email: 'john.doe@example.com',
  login: 'john.doe',
  phone: '+79990000000',
};

describe('HttpUserGateway', () => {
  let service: HttpUserGateway;

  beforeEach(() => {
    userApiMock.updateProfile.mockReset();
    userApiMock.changePassword.mockReset();

    TestBed.configureTestingModule({
      providers: [
        HttpUserGateway,
        {
          provide: UserApi,
          useValue: userApiMock,
        },
      ],
    });
    service = TestBed.inject(HttpUserGateway);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateProfile', () => {
    it('should call api with mapped snake_case request', () => {
      userApiMock.updateProfile.mockReturnValue(of(currentUserDtoMock));

      service.updateProfile(updateProfileInputMock).subscribe();

      expect(userApiMock.updateProfile).toHaveBeenCalledOnce();
      expect(userApiMock.updateProfile).toHaveBeenCalledWith(updateProfileRequestMock);
    });

    it('should map successful response to current user', () => {
      userApiMock.updateProfile.mockReturnValue(of(currentUserDtoMock));

      service.updateProfile(updateProfileInputMock).subscribe((response) => {
        expect(response).toEqual({ user: currentUserMock });
      });
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const error = new HttpErrorResponse({
        error: { reason: 'mockReason' },
      });

      userApiMock.updateProfile.mockReturnValue(throwError(() => error));

      service.updateProfile(updateProfileInputMock).subscribe({
        error: (applicationError) => {
          expect(applicationError).toBeInstanceOf(ApplicationError);
          expect(applicationError.message).toBe('mockReason');
        },
      });
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const error = 'mockError';

      userApiMock.updateProfile.mockReturnValue(throwError(() => error));

      service.updateProfile(updateProfileInputMock).subscribe({
        error: (applicationError) => {
          expect(applicationError).toBeInstanceOf(ApplicationError);
          expect(applicationError.message).toBe('Failed to update profile. Please try again.');
        },
      });
    });
  });
  describe('changePassword', () => {
    it('should call api with mapped camelCase request', () => {
      userApiMock.changePassword.mockReturnValue(of('OK'));

      service.changePassword(changePasswordInputMock).subscribe();

      expect(userApiMock.changePassword).toHaveBeenCalledOnce();
      expect(userApiMock.changePassword).toHaveBeenCalledWith(changePasswordRequestMock);
    });

    it('should map successful response to empty result', () => {
      userApiMock.changePassword.mockReturnValue(of('OK'));

      service.changePassword(changePasswordInputMock).subscribe((response) => {
        expect(response).toBeUndefined();
      });
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const error = new HttpErrorResponse({
        error: { reason: 'mockReason' },
      });

      userApiMock.changePassword.mockReturnValue(throwError(() => error));

      service.changePassword(changePasswordInputMock).subscribe({
        error: (applicationError) => {
          expect(applicationError).toBeInstanceOf(ApplicationError);
          expect(applicationError.message).toBe('mockReason');
        },
      });
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const error = 'mockError';

      userApiMock.changePassword.mockReturnValue(throwError(() => error));

      service.changePassword(changePasswordInputMock).subscribe({
        error: (applicationError) => {
          expect(applicationError).toBeInstanceOf(ApplicationError);
          expect(applicationError.message).toBe('Failed to change password. Please try again.');
        },
      });
    });
  });
});
