import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { AuthFlowStatus } from '../auth-flow-status';
import { AUTH_GATEWAY } from '../auth.gateway';
import { CurrentSessionResult } from '../current-session/current-session-result';
import { CurrentSessionStatus } from '../current-session/current-session-status';
import { CurrentSessionService } from '../current-session/current-session.service';
import { CurrentUser } from '../current-session/current-user';
import { USER_GATEWAY } from '../user.gateway';

import { UpdateProfileInput } from './update-profile.input';
import { UpdateProfileResult } from './update-profile.result';
import { UpdateProfileService } from './update-profile.service';

import { ApplicationError } from '@shared/errors';

const authGatewayMock = {
  currentSession: vi.fn(),
  logout: vi.fn(),
};

const userGatewayMock = {
  updateProfile: vi.fn(),
};

const routerMock = {
  navigate: vi.fn(),
  navigateByUrl: vi.fn(),
};

const currentUserMock: CurrentUser = {
  id: 1,
  firstName: 'firstName',
  secondName: 'secondName',
  displayName: 'displayName',
  login: 'login',
  email: 'email',
  phone: 'phone',
  avatar: null,
};

const updatedUserMock: CurrentUser = {
  ...currentUserMock,
  firstName: 'updatedFirstName',
  displayName: 'updatedDisplayName',
  email: 'updated@email.email',
};

const updateProfileInputMock: UpdateProfileInput = {
  firstName: 'updatedFirstName',
  secondName: 'secondName',
  displayName: 'updatedDisplayName',
  login: 'login',
  email: 'updated@email.email',
  phone: 'phone',
};

const authenticatedSessionMock: CurrentSessionResult = {
  status: CurrentSessionStatus.Authenticated,
  user: currentUserMock,
};

describe('UpdateProfileService', () => {
  let service: UpdateProfileService;
  let currentSessionService: CurrentSessionService;

  beforeEach(() => {
    authGatewayMock.currentSession.mockReset();
    authGatewayMock.logout.mockReset();
    userGatewayMock.updateProfile.mockReset();
    routerMock.navigate.mockReset();
    routerMock.navigateByUrl.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
        },
        {
          provide: USER_GATEWAY,
          useValue: userGatewayMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
        UpdateProfileService,
      ],
    });

    currentSessionService = TestBed.inject(CurrentSessionService);
    service = TestBed.inject(UpdateProfileService);

    authGatewayMock.currentSession.mockReturnValue(of(authenticatedSessionMock));
    currentSessionService.restoreCurrentSession().subscribe();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('status should be idle', () => {
      expect(service.status()).toBe(AuthFlowStatus.Idle);
    });

    it('errorMessage should be null', () => {
      expect(service.errorMessage()).toBeNull();
    });

    it('isSubmitting should be false', () => {
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('initialValues', () => {
    it('should expose editable fields of the current user', () => {
      expect(service.initialValues()).toEqual({
        firstName: 'firstName',
        secondName: 'secondName',
        displayName: 'displayName',
        login: 'login',
        email: 'email',
        phone: 'phone',
      });
    });

    it('should expose empty display name when the current user has none', () => {
      authGatewayMock.currentSession.mockReturnValue(
        of({
          status: CurrentSessionStatus.Authenticated,
          user: { ...currentUserMock, displayName: null },
        }),
      );
      currentSessionService.restoreCurrentSession().subscribe();

      expect(service.initialValues().displayName).toBe('');
    });
  });

  describe('updateProfile', () => {
    it('should call user gateway with form values', () => {
      userGatewayMock.updateProfile.mockReturnValue(of({ user: updatedUserMock }));

      service.updateProfile(updateProfileInputMock);

      expect(userGatewayMock.updateProfile).toHaveBeenCalledOnce();
      expect(userGatewayMock.updateProfile).toHaveBeenCalledWith(updateProfileInputMock);
    });

    it('should set submitting state and clear error message while request is pending', () => {
      userGatewayMock.updateProfile.mockReturnValueOnce(
        throwError(() => new ApplicationError('mockError')),
      );

      service.updateProfile(updateProfileInputMock);

      expect(service.errorMessage()).toBe('mockError');

      const updateProfileResult$ = new Subject<UpdateProfileResult>();
      userGatewayMock.updateProfile.mockReturnValueOnce(updateProfileResult$);

      service.updateProfile(updateProfileInputMock);

      expect(service.errorMessage()).toBeNull();
      expect(service.status()).toBe(AuthFlowStatus.Submitting);
    });

    describe('on success', () => {
      beforeEach(() => {
        userGatewayMock.updateProfile.mockReturnValue(of({ user: updatedUserMock }));
      });

      it('should set success state', () => {
        service.updateProfile(updateProfileInputMock);

        expect(service.status()).toBe(AuthFlowStatus.Success);
        expect(service.errorMessage()).toBeNull();
      });

      it('should update the current session from the backend response', () => {
        service.updateProfile(updateProfileInputMock);

        expect(currentSessionService.currentUser()).toEqual(updatedUserMock);
      });

      it('should keep the session authenticated', () => {
        service.updateProfile(updateProfileInputMock);

        expect(currentSessionService.status()).toBe(CurrentSessionStatus.Authenticated);
      });

      it('should refresh initial values from the updated current user', () => {
        service.updateProfile(updateProfileInputMock);

        expect(service.initialValues().firstName).toBe('updatedFirstName');
      });

      it('should not navigate', () => {
        service.updateProfile(updateProfileInputMock);

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
      });
    });

    describe('on error', () => {
      beforeEach(() => {
        userGatewayMock.updateProfile.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );
      });

      it('should expose the error message', () => {
        service.updateProfile(updateProfileInputMock);

        expect(service.status()).toBe(AuthFlowStatus.Error);
        expect(service.errorMessage()).toBe('mockReason');
      });

      it('should keep the current session unchanged', () => {
        service.updateProfile(updateProfileInputMock);

        expect(currentSessionService.currentUser()).toEqual(currentUserMock);
      });

      it('should not navigate', () => {
        service.updateProfile(updateProfileInputMock);

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
      });
    });
  });

  describe('reset', () => {
    it('should reset status and error message', () => {
      userGatewayMock.updateProfile.mockReturnValue(
        throwError(() => new ApplicationError('mockError')),
      );

      service.updateProfile(updateProfileInputMock);

      expect(service.status()).toBe(AuthFlowStatus.Error);
      expect(service.errorMessage()).toBe('mockError');

      service.reset();

      expect(service.status()).toBe(AuthFlowStatus.Idle);
      expect(service.errorMessage()).toBeNull();
    });
  });
});
