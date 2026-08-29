import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { AuthFlowStatus } from '../../application/auth-flow-status';
import { AUTH_GATEWAY } from '../../application/auth.gateway';
import { CurrentSessionStatus } from '../../application/current-session/current-session-status';
import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { CurrentUser } from '../../application/current-session/current-user';
import { UpdateProfileInput } from '../../application/update-profile/update-profile.input';
import { UpdateProfileService } from '../../application/update-profile/update-profile.service';
import { USER_GATEWAY } from '../../application/user.gateway';
import { UpdateProfileForm } from '../update-profile-form/update-profile-form';

import { UpdateProfileModalContent } from './update-profile-modal-content';

import { ApplicationError } from '@shared/errors';
import { ModalRef } from '@shared/ui/modal/modal-ref';

const currentUserMock: CurrentUser = {
  id: 1,
  firstName: 'firstName',
  secondName: 'secondName',
  displayName: 'displayName',
  login: 'login',
  email: 'email@mock.ru',
  phone: '+79991234567',
  avatar: null,
};

const initialValuesMock: UpdateProfileInput = {
  firstName: 'firstName',
  secondName: 'secondName',
  displayName: 'displayName',
  login: 'login',
  email: 'email@mock.ru',
  phone: '+79991234567',
};

let updateProfileServiceMock: {
  initialValues: WritableSignal<UpdateProfileInput>;
  isSubmitting: WritableSignal<boolean>;
  errorMessage: WritableSignal<string | null>;
  status: WritableSignal<AuthFlowStatus>;
  updateProfile: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
};

let modalRefMock: {
  close: ReturnType<typeof vi.fn>;
};

describe('UpdateProfileModalContent', () => {
  let fixture: ComponentFixture<UpdateProfileModalContent>;

  beforeEach(async () => {
    updateProfileServiceMock = {
      initialValues: signal(initialValuesMock),
      isSubmitting: signal(false),
      errorMessage: signal(null),
      status: signal(AuthFlowStatus.Idle),
      updateProfile: vi.fn(),
      reset: vi.fn(),
    };

    modalRefMock = {
      close: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [UpdateProfileModalContent],
      providers: [
        {
          provide: ModalRef,
          useValue: modalRefMock,
        },
      ],
    });

    TestBed.overrideComponent(UpdateProfileModalContent, {
      set: {
        providers: [
          {
            provide: UpdateProfileService,
            useValue: updateProfileServiceMock,
          },
        ],
      },
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(UpdateProfileModalContent);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('successful save', () => {
    it('should close the modal', () => {
      fixture.detectChanges();

      updateProfileServiceMock.status.set(AuthFlowStatus.Success);

      fixture.detectChanges();

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without saving', () => {
    it('should not call updateProfile', () => {
      fixture.detectChanges();

      expect(updateProfileServiceMock.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('flow lifetime', () => {
    let userGatewayMock: {
      updateProfile: ReturnType<typeof vi.fn>;
      changePassword: ReturnType<typeof vi.fn>;
    };

    const openModal = async (): Promise<ComponentFixture<UpdateProfileModalContent>> => {
      const openedFixture = TestBed.createComponent(UpdateProfileModalContent);
      await openedFixture.whenStable();
      openedFixture.detectChanges();

      return openedFixture;
    };

    const submitWithError = async (
      openedFixture: ComponentFixture<UpdateProfileModalContent>,
    ): Promise<void> => {
      openedFixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

      await openedFixture.whenStable();
      openedFixture.detectChanges();
    };

    beforeEach(async () => {
      TestBed.resetTestingModule();

      userGatewayMock = {
        updateProfile: vi.fn(() => throwError(() => new ApplicationError('Mock error'))),
        changePassword: vi.fn(),
      };

      TestBed.configureTestingModule({
        imports: [UpdateProfileModalContent],
        providers: [
          {
            provide: USER_GATEWAY,
            useValue: userGatewayMock,
          },
          {
            provide: AUTH_GATEWAY,
            useValue: {
              currentSession: vi.fn(() =>
                of({ status: CurrentSessionStatus.Authenticated, user: currentUserMock }),
              ),
            },
          },
          {
            provide: ModalRef,
            useValue: modalRefMock,
          },
        ],
      });

      await TestBed.compileComponents();

      TestBed.inject(CurrentSessionService).updateCurrentUser(currentUserMock);
    });

    it('should show a form without an error when reopened after a failed save', async () => {
      const failedFixture = await openModal();

      await submitWithError(failedFixture);

      expect(
        failedFixture.nativeElement.querySelector('.update-profile-form__error'),
      ).not.toBeNull();

      failedFixture.destroy();

      const reopenedFixture = await openModal();

      const reopenedForm: UpdateProfileForm = reopenedFixture.debugElement.query(
        By.directive(UpdateProfileForm),
      ).componentInstance;

      expect(reopenedForm.updateProfileForm.getRawValue().firstName).toBe(
        currentUserMock.firstName,
      );

      expect(reopenedFixture.nativeElement.querySelector('.update-profile-form__error')).toBeNull();
    });
  });
});
