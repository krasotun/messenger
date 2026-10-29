import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CurrentUser } from './current-user';
import { HttpUserGateway } from './http-user-gateway';
import { ChangePasswordRequestDto } from './internal/change-password-dto';
import { USER_ERROR_MESSAGES } from './internal/error-messages';
import { UpdateProfileRequestDto } from './internal/update-profile-dto';
import { UserDto } from './internal/user-dto';
import { User } from './user';
import { UpdateProfileInput, ChangePasswordInput } from './user-gateway';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { ApplicationError } from '@shared/errors';

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

const currentUserDtoMock: UserDto = {
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

// Ответ с причиной - как отказ бэкенда; без причины - как сбой сервера,
// для которого Шлюз подставляет свой текст.
const flushRejection = (request: TestRequest): void => {
  request.flush({ reason: 'mockReason' }, { status: 400, statusText: 'Bad Request' });
};

const flushServerFailure = (request: TestRequest): void => {
  request.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
};

describe('HttpUserGateway', () => {
  let service: HttpUserGateway;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpUserGateway,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: RESOURCES_BASE_URL,
          useValue: resourcesBaseUrlMock,
        },
      ],
    });

    service = TestBed.inject(HttpUserGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateProfile', () => {
    const updateProfile = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.updateProfile(updateProfileInputMock).subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send PUT request with mapped snake_case body', () => {
      updateProfile();

      const request = httpTestingController.expectOne('/user/profile');

      expect(request.request.method).toBe('PUT');
      expect(request.request.body).toEqual(updateProfileRequestMock);

      request.flush(currentUserDtoMock);
    });

    it('should map successful response to current user', () => {
      const { results } = updateProfile();

      httpTestingController.expectOne('/user/profile').flush(currentUserDtoMock);

      expect(results).toEqual([{ user: currentUserMock }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const { errors } = updateProfile();

      flushRejection(httpTestingController.expectOne('/user/profile'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = updateProfile();

      flushServerFailure(httpTestingController.expectOne('/user/profile'));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(USER_ERROR_MESSAGES.updateProfile);
    });
  });

  describe('changeAvatar', () => {
    const changeAvatar = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.changeAvatar({ file: fileMock }).subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send PUT request with form data holding the selected file', () => {
      changeAvatar();

      const request = httpTestingController.expectOne('/user/profile/avatar');
      const formData = request.request.body as FormData;

      expect(request.request.method).toBe('PUT');
      expect(formData.getAll('avatar')).toEqual([fileMock]);
      expect(request.request.headers.has('Content-Type')).toBe(false);

      request.flush(currentUserDtoMock);
    });

    it('should give the upload a longer timeout', () => {
      changeAvatar();

      const request = httpTestingController.expectOne('/user/profile/avatar');

      expect(request.request.timeout).toBe(60_000);

      request.flush(currentUserDtoMock);
    });

    it('should map successful response to current user with resolved avatar url', () => {
      const { results } = changeAvatar();

      httpTestingController
        .expectOne('/user/profile/avatar')
        .flush({ ...currentUserDtoMock, avatar: '/path/to/avatar.png' });

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
      const { errors } = changeAvatar();

      flushRejection(httpTestingController.expectOne('/user/profile/avatar'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = changeAvatar();

      flushServerFailure(httpTestingController.expectOne('/user/profile/avatar'));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(USER_ERROR_MESSAGES.changeAvatar);
    });
  });

  describe('changePassword', () => {
    const changePassword = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.changePassword(changePasswordInputMock).subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send PUT request with camelCase body and read response as text', () => {
      changePassword();

      const request = httpTestingController.expectOne('/user/password');

      expect(request.request.method).toBe('PUT');
      expect(request.request.body).toEqual(changePasswordRequestMock);
      expect(request.request.responseType).toBe('text');
      expect(request.request.timeout).toBeUndefined();

      request.flush('OK');
    });

    it('should map successful response to password changed result', () => {
      const { results } = changePassword();

      httpTestingController.expectOne('/user/password').flush('OK');

      expect(results).toEqual([{ passwordChanged: true }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const { errors } = changePassword();

      flushRejection(httpTestingController.expectOne('/user/password'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = changePassword();

      flushServerFailure(httpTestingController.expectOne('/user/password'));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(USER_ERROR_MESSAGES.changePassword);
    });
  });

  describe('searchUsers', () => {
    const searchUsers = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.searchUsers({ login: 'jane' }).subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send POST request with the login to search by', () => {
      searchUsers();

      const request = httpTestingController.expectOne('/user/search');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({ login: 'jane' });
      expect(request.request.timeout).toBeUndefined();

      request.flush([userDtoMock]);
    });

    it('should map found users with resolved avatar url', () => {
      const { results } = searchUsers();

      httpTestingController.expectOne('/user/search').flush([userDtoMock]);

      expect(results).toEqual([{ users: [userMock] }]);
    });

    it('should fall back to first name when display name is missing', () => {
      const { results } = searchUsers();

      httpTestingController
        .expectOne('/user/search')
        .flush([{ ...userDtoMock, display_name: null, avatar: null }]);

      expect(results).toEqual([{ users: [{ ...userMock, name: 'Jane', avatar: null }] }]);
    });

    it('should map an empty response to an empty result', () => {
      const { results } = searchUsers();

      httpTestingController.expectOne('/user/search').flush([]);

      expect(results).toEqual([{ users: [] }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const { errors } = searchUsers();

      flushRejection(httpTestingController.expectOne('/user/search'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = searchUsers();

      flushServerFailure(httpTestingController.expectOne('/user/search'));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(USER_ERROR_MESSAGES.searchUsers);
    });
  });
});
