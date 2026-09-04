import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ChangePasswordInput } from '../application/change-password/change-password.input';
import { CurrentUser } from '../application/current-session/current-user';
import { UpdateProfileInput } from '../application/update-profile/update-profile.input';
import { User } from '../application/user';

import { ChangePasswordRequestDto } from './change-password/change-password.dto';
import { CurrentUserDto } from './current-session/current-user.dto';
import { HttpUserGateway } from './http-user-gateway';
import { UserDto } from './search-users/search-users.dto';
import { UpdateProfileRequestDto } from './update-profile/update-profile.dto';
import { UserApi } from './user.api';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { ApplicationError } from '@shared/errors';

const userApiMock = {
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  changeAvatar: vi.fn(),
  searchUsers: vi.fn(),
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

const userDtoMock: UserDto = {
  id: 2,
  first_name: 'Jane',
  second_name: 'Roe',
  display_name: 'Janie',
  avatar: '/path/to/avatar.png',
  email: 'jane.roe@example.com',
  login: 'jane.roe',
  phone: '+79990000001',
};

const userMock: User = {
  id: 2,
  login: 'jane.roe',
  name: 'Janie',
  avatar: 'https://mock.host/resources/path/to/avatar.png',
};

const resourcesBaseUrlMock = 'https://mock.host/resources';

const fileMock = new File(['mockContent'], 'avatar.png', { type: 'image/png' });

describe('HttpUserGateway', () => {
  let service: HttpUserGateway;

  beforeEach(() => {
    userApiMock.updateProfile.mockReset();
    userApiMock.changePassword.mockReset();
    userApiMock.changeAvatar.mockReset();
    userApiMock.searchUsers.mockReset();

    TestBed.configureTestingModule({
      providers: [
        HttpUserGateway,
        {
          provide: UserApi,
          useValue: userApiMock,
        },
        {
          provide: RESOURCES_BASE_URL,
          useValue: resourcesBaseUrlMock,
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

      const results: unknown[] = [];

      service.updateProfile(updateProfileInputMock).subscribe((response) => {
        results.push(response);
      });

      expect(results).toEqual([{ user: currentUserMock }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const error = new HttpErrorResponse({
        error: { reason: 'mockReason' },
      });

      userApiMock.updateProfile.mockReturnValue(throwError(() => error));

      const errors: ApplicationError[] = [];

      service.updateProfile(updateProfileInputMock).subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      userApiMock.updateProfile.mockReturnValue(throwError(() => 'mockError'));

      const errors: ApplicationError[] = [];

      service.updateProfile(updateProfileInputMock).subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('Failed to update profile. Please try again.');
    });
  });
  describe('changeAvatar', () => {
    it('should call api with form data holding the selected file', () => {
      userApiMock.changeAvatar.mockReturnValue(of(currentUserDtoMock));

      service.changeAvatar({ file: fileMock }).subscribe();

      expect(userApiMock.changeAvatar).toHaveBeenCalledOnce();

      const [formData] = userApiMock.changeAvatar.mock.calls[0] as [FormData];

      expect(formData.getAll('avatar')).toEqual([fileMock]);
    });

    it('should map successful response to current user with resolved avatar url', () => {
      userApiMock.changeAvatar.mockReturnValue(
        of({ ...currentUserDtoMock, avatar: '/path/to/avatar.png' }),
      );

      const results: unknown[] = [];

      service.changeAvatar({ file: fileMock }).subscribe((response) => {
        results.push(response);
      });

      expect(results).toEqual([
        {
          user: {
            ...currentUserMock,
            avatar: `${resourcesBaseUrlMock}/path/to/avatar.png`,
          },
        },
      ]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const error = new HttpErrorResponse({
        error: { reason: 'mockReason' },
      });

      userApiMock.changeAvatar.mockReturnValue(throwError(() => error));

      const errors: ApplicationError[] = [];

      service.changeAvatar({ file: fileMock }).subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      userApiMock.changeAvatar.mockReturnValue(throwError(() => 'mockError'));

      const errors: ApplicationError[] = [];

      service.changeAvatar({ file: fileMock }).subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('Failed to change avatar. Please try again.');
    });
  });

  describe('changePassword', () => {
    it('should call api with mapped camelCase request', () => {
      userApiMock.changePassword.mockReturnValue(of('OK'));

      service.changePassword(changePasswordInputMock).subscribe();

      expect(userApiMock.changePassword).toHaveBeenCalledOnce();
      expect(userApiMock.changePassword).toHaveBeenCalledWith(changePasswordRequestMock);
    });

    it('should map successful response to password changed result', () => {
      userApiMock.changePassword.mockReturnValue(of('OK'));

      const results: unknown[] = [];

      service.changePassword(changePasswordInputMock).subscribe((response) => {
        results.push(response);
      });

      expect(results).toEqual([{ passwordChanged: true }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const error = new HttpErrorResponse({
        error: { reason: 'mockReason' },
      });

      userApiMock.changePassword.mockReturnValue(throwError(() => error));

      const errors: ApplicationError[] = [];

      service.changePassword(changePasswordInputMock).subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      userApiMock.changePassword.mockReturnValue(throwError(() => 'mockError'));

      const errors: ApplicationError[] = [];

      service.changePassword(changePasswordInputMock).subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('Failed to change password. Please try again.');
    });
  });
  describe('searchUsers', () => {
    it('should call api with the login to search by', () => {
      userApiMock.searchUsers.mockReturnValue(of([userDtoMock]));

      service.searchUsers({ login: 'jane' }).subscribe();

      expect(userApiMock.searchUsers).toHaveBeenCalledOnce();
      expect(userApiMock.searchUsers).toHaveBeenCalledWith({ login: 'jane' });
    });

    it('should map found users with resolved avatar url', () => {
      userApiMock.searchUsers.mockReturnValue(of([userDtoMock]));

      const results: unknown[] = [];

      service.searchUsers({ login: 'jane' }).subscribe((response) => {
        results.push(response);
      });

      expect(results).toEqual([{ users: [userMock] }]);
    });

    it('should fall back to first name when display name is missing', () => {
      userApiMock.searchUsers.mockReturnValue(
        of([{ ...userDtoMock, display_name: null, avatar: null }]),
      );

      const results: unknown[] = [];

      service.searchUsers({ login: 'jane' }).subscribe((response) => {
        results.push(response);
      });

      expect(results).toEqual([{ users: [{ ...userMock, name: 'Jane', avatar: null }] }]);
    });

    it('should map an empty response to an empty result', () => {
      userApiMock.searchUsers.mockReturnValue(of([]));

      const results: unknown[] = [];

      service.searchUsers({ login: 'jane' }).subscribe((response) => {
        results.push(response);
      });

      expect(results).toEqual([{ users: [] }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const error = new HttpErrorResponse({
        error: { reason: 'mockReason' },
      });

      userApiMock.searchUsers.mockReturnValue(throwError(() => error));

      const errors: ApplicationError[] = [];

      service.searchUsers({ login: 'jane' }).subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      userApiMock.searchUsers.mockReturnValue(throwError(() => 'mockError'));

      const errors: ApplicationError[] = [];

      service.searchUsers({ login: 'jane' }).subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('Failed to search users. Please try again.');
    });
  });
});
