import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../../application/auth.gateway';
import { ChangeAvatarService } from '../../application/change-avatar/change-avatar.service';
import { CurrentSessionStatus } from '../../application/current-session/current-session-status.type';
import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { CurrentUser } from '../../application/current-session/current-user.type';
import { UpdateProfileInput } from '../../application/update-profile/update-profile-input.type';
import { UpdateProfileService } from '../../application/update-profile/update-profile.service';
import { USER_GATEWAY } from '../../application/user.gateway';
import { ChangeAvatarForm } from '../change-avatar-form/change-avatar-form';
import { UpdateProfileForm } from '../update-profile-form/update-profile-form';

import { UpdateProfileModalContent } from './update-profile-modal-content';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
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
  succeeded$: Subject<void>;
  updateProfile: ReturnType<typeof vi.fn>;
};

let changeAvatarServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  succeeded$: Subject<void>;
  changeAvatar: ReturnType<typeof vi.fn>;
};

let modalRefMock: {
  close: ReturnType<typeof vi.fn>;
};

const notifierMock = {
  success: vi.fn(),
  error: vi.fn(),
};

const pngFileMock = new File(['mockContent'], 'avatar.png', { type: 'image/png' });

const getChangeAvatarFormElement = (
  fixture: ComponentFixture<UpdateProfileModalContent>,
): HTMLFormElement => fixture.nativeElement.querySelector('.change-avatar-form');

const getUpdateProfileFormElement = (
  fixture: ComponentFixture<UpdateProfileModalContent>,
): HTMLFormElement => fixture.nativeElement.querySelector('app-update-profile-form form');

const selectAvatarFile = (fixture: ComponentFixture<UpdateProfileModalContent>): void => {
  const fileInput: HTMLInputElement = fixture.nativeElement.querySelector(
    '.change-avatar-form__file-input',
  );

  Object.defineProperty(fileInput, 'files', { value: [pngFileMock], configurable: true });
  fileInput.dispatchEvent(new Event('change'));

  fixture.detectChanges();
};

const submitChangeAvatarForm = (fixture: ComponentFixture<UpdateProfileModalContent>): void => {
  getChangeAvatarFormElement(fixture).dispatchEvent(new Event('submit', { cancelable: true }));

  fixture.detectChanges();
};

const submitUpdateProfileForm = (fixture: ComponentFixture<UpdateProfileModalContent>): void => {
  getUpdateProfileFormElement(fixture).dispatchEvent(new Event('submit'));

  fixture.detectChanges();
};

describe('UpdateProfileModalContent', () => {
  let fixture: ComponentFixture<UpdateProfileModalContent>;

  beforeEach(async () => {
    updateProfileServiceMock = {
      initialValues: signal(initialValuesMock),
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      updateProfile: vi.fn(),
    };

    changeAvatarServiceMock = {
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      changeAvatar: vi.fn(),
    };

    modalRefMock = {
      close: vi.fn(),
    };

    notifierMock.success.mockReset();
    notifierMock.error.mockReset();

    TestBed.configureTestingModule({
      imports: [UpdateProfileModalContent],
      providers: [
        {
          provide: ModalRef,
          useValue: modalRefMock,
        },
        {
          provide: CurrentSessionService,
          useValue: { currentUser: signal(currentUserMock) },
        },
        {
          provide: NOTIFIER,
          useValue: notifierMock,
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
          {
            provide: ChangeAvatarService,
            useValue: changeAvatarServiceMock,
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
    it('should close the modal without a manual application tick', () => {
      fixture.detectChanges();

      updateProfileServiceMock.succeeded$.next();

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without saving', () => {
    it('should not call updateProfile', () => {
      fixture.detectChanges();

      expect(updateProfileServiceMock.updateProfile).not.toHaveBeenCalled();
    });

    it('should not call changeAvatar even when a file has been selected', () => {
      fixture.detectChanges();

      selectAvatarFile(fixture);

      fixture.destroy();

      expect(changeAvatarServiceMock.changeAvatar).not.toHaveBeenCalled();
    });
  });

  describe('both forms', () => {
    it('should be shown together', () => {
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(ChangeAvatarForm))).not.toBeNull();
      expect(fixture.debugElement.query(By.directive(UpdateProfileForm))).not.toBeNull();
    });

    it('should keep the change avatar submit out of the update profile use case', () => {
      fixture.detectChanges();

      selectAvatarFile(fixture);
      submitChangeAvatarForm(fixture);

      expect(changeAvatarServiceMock.changeAvatar).toHaveBeenCalledOnce();
      expect(updateProfileServiceMock.updateProfile).not.toHaveBeenCalled();
      expect(modalRefMock.close).not.toHaveBeenCalled();
    });

    it('should keep the update profile submit out of the change avatar use case', () => {
      fixture.detectChanges();

      submitUpdateProfileForm(fixture);

      expect(updateProfileServiceMock.updateProfile).toHaveBeenCalledOnce();
      expect(changeAvatarServiceMock.changeAvatar).not.toHaveBeenCalled();
    });
  });

  describe('flow lifetime', () => {
    let userGatewayMock: {
      updateProfile: ReturnType<typeof vi.fn>;
      changePassword: ReturnType<typeof vi.fn>;
      changeAvatar: ReturnType<typeof vi.fn>;
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
      getUpdateProfileFormElement(openedFixture).dispatchEvent(new Event('submit'));

      await openedFixture.whenStable();
      openedFixture.detectChanges();
    };

    beforeEach(async () => {
      TestBed.resetTestingModule();

      userGatewayMock = {
        updateProfile: vi.fn(() => throwError(() => new ApplicationError('Mock error'))),
        changePassword: vi.fn(),
        changeAvatar: vi.fn(() => throwError(() => new ApplicationError('Mock error'))),
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
          {
            provide: NOTIFIER,
            useValue: notifierMock,
          },
        ],
      });

      await TestBed.compileComponents();

      TestBed.inject(CurrentSessionService).updateCurrentUser(currentUserMock);
    });

    it('should show a form without an error when reopened after a failed save', async () => {
      const failedFixture = await openModal();

      await submitWithError(failedFixture);

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to update profile', 'Mock error');
      expect(failedFixture.nativeElement.querySelector('.update-profile-form__error')).toBeNull();

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

    it('should show the change avatar form without a file and without an error when reopened', async () => {
      const failedFixture = await openModal();

      selectAvatarFile(failedFixture);
      submitChangeAvatarForm(failedFixture);

      await failedFixture.whenStable();
      failedFixture.detectChanges();

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(notifierMock.error).toHaveBeenCalledWith('Failed to change avatar', 'Mock error');
      expect(failedFixture.nativeElement.querySelector('.change-avatar-form__error')).toBeNull();

      failedFixture.destroy();

      const reopenedFixture = await openModal();

      expect(reopenedFixture.nativeElement.querySelector('.change-avatar-form__error')).toBeNull();

      submitChangeAvatarForm(reopenedFixture);

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(
        reopenedFixture.nativeElement
          .querySelector('.change-avatar-form__error')
          ?.textContent?.trim(),
      ).toContain('Select a file');
    });
  });
});
