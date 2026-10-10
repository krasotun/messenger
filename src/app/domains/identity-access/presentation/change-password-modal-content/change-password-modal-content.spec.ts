import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { throwError } from 'rxjs';

import { ChangePasswordService } from '../../application/change-password/change-password.service';
import { USER_GATEWAY } from '../../application/user.gateway';
import { ChangePasswordForm } from '../change-password-form/change-password-form';

import { ChangePasswordModalContent } from './change-password-modal-content';

import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { ModalRef } from '@shared/ui/modal/modal-ref';
import { ModalMocks } from '@shared/ui/modal/testing';

describe('ChangePasswordModalContent', () => {
  let changePasswordServiceMock: ReturnType<typeof IdentityMocks.changePasswordService>;
  let modalRefMock: ReturnType<typeof ModalMocks.modalRef>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let fixture: ComponentFixture<ChangePasswordModalContent>;

  beforeEach(async () => {
    changePasswordServiceMock = IdentityMocks.changePasswordService();
    modalRefMock = ModalMocks.modalRef();
    notifierMock = NotificationMocks.notifier();

    TestBed.configureTestingModule({
      imports: [ChangePasswordModalContent],
      providers: [
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

    TestBed.overrideComponent(ChangePasswordModalContent, {
      set: {
        providers: [
          {
            provide: ChangePasswordService,
            useValue: changePasswordServiceMock,
          },
        ],
      },
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(ChangePasswordModalContent);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('successful change', () => {
    it('should close the modal without a manual application tick', () => {
      fixture.detectChanges();

      changePasswordServiceMock.succeeded$.next();

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without submitting', () => {
    it('should not call changePassword', () => {
      fixture.detectChanges();

      expect(changePasswordServiceMock.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('flow lifetime', () => {
    let userGatewayMock: ReturnType<typeof IdentityMocks.userGateway>;

    const openModal = async (): Promise<ComponentFixture<ChangePasswordModalContent>> => {
      const openedFixture = TestBed.createComponent(ChangePasswordModalContent);
      await openedFixture.whenStable();
      openedFixture.detectChanges();

      return openedFixture;
    };

    const submitWithError = async (
      openedFixture: ComponentFixture<ChangePasswordModalContent>,
    ): Promise<void> => {
      const form: ChangePasswordForm = openedFixture.debugElement.query(
        By.directive(ChangePasswordForm),
      ).componentInstance;

      form.changePasswordForm.setValue({
        oldPassword: 'typedOldPassword',
        newPassword: 'typedNewPassword',
        repeatNewPassword: 'typedNewPassword',
      });

      openedFixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

      await openedFixture.whenStable();
      openedFixture.detectChanges();
    };

    beforeEach(async () => {
      TestBed.resetTestingModule();

      userGatewayMock = IdentityMocks.userGateway();
      userGatewayMock.changePassword.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );

      TestBed.configureTestingModule({
        imports: [ChangePasswordModalContent],
        providers: [
          {
            provide: USER_GATEWAY,
            useValue: userGatewayMock,
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
    });

    it('should show an empty form without an error when reopened after a failed change', async () => {
      const failedFixture = await openModal();

      await submitWithError(failedFixture);

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to change password', 'Mock error');
      expect(failedFixture.nativeElement.querySelector('.change-password-form__error')).toBeNull();

      failedFixture.destroy();

      const reopenedFixture = await openModal();

      const reopenedInputEls: HTMLInputElement[] = Array.from(
        reopenedFixture.nativeElement.querySelectorAll('input'),
      );

      expect(reopenedInputEls).toHaveLength(3);

      reopenedInputEls.forEach((inputEl) => {
        expect(inputEl.value).toBe('');
      });

      expect(
        reopenedFixture.nativeElement.querySelector('.change-password-form__error'),
      ).toBeNull();
    });
  });
});
