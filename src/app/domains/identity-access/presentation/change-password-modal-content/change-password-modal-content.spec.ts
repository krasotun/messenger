import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject, throwError } from 'rxjs';

import { ChangePasswordService } from '../../application/change-password/change-password.service';
import { USER_GATEWAY } from '../../application/user.gateway';
import { ChangePasswordForm } from '../change-password-form/change-password-form';

import { ChangePasswordModalContent } from './change-password-modal-content';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { ModalRef } from '@shared/ui/modal/modal-ref';

let changePasswordServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  succeeded$: Subject<void>;
  changePassword: ReturnType<typeof vi.fn>;
};

let modalRefMock: {
  close: ReturnType<typeof vi.fn>;
};

const notifierMock = {
  success: vi.fn(),
  error: vi.fn(),
};

describe('ChangePasswordModalContent', () => {
  let fixture: ComponentFixture<ChangePasswordModalContent>;

  beforeEach(async () => {
    changePasswordServiceMock = {
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      changePassword: vi.fn(),
    };

    modalRefMock = {
      close: vi.fn(),
    };

    notifierMock.success.mockReset();
    notifierMock.error.mockReset();

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
    let userGatewayMock: {
      updateProfile: ReturnType<typeof vi.fn>;
      changePassword: ReturnType<typeof vi.fn>;
    };

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

      userGatewayMock = {
        updateProfile: vi.fn(),
        changePassword: vi.fn(() => throwError(() => new ApplicationError('Mock error'))),
      };

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
