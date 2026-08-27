import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AuthFlowStatus } from '../../application/auth-flow-status';
import { ChangePasswordService } from '../../application/change-password/change-password.service';
import { ChangePasswordForm } from '../change-password-form/change-password-form';

import { ChangePasswordModalContent } from './change-password-modal-content';

import { ModalRef } from '@shared/ui/modal/modal-ref';

let changePasswordServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  errorMessage: WritableSignal<string | null>;
  status: WritableSignal<AuthFlowStatus>;
  changePassword: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
};

let modalRefMock: {
  close: ReturnType<typeof vi.fn>;
};

describe('ChangePasswordModalContent', () => {
  let fixture: ComponentFixture<ChangePasswordModalContent>;

  beforeEach(async () => {
    changePasswordServiceMock = {
      isSubmitting: signal(false),
      errorMessage: signal(null),
      status: signal(AuthFlowStatus.Idle),
      changePassword: vi.fn(),
      reset: vi.fn(),
    };

    modalRefMock = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ChangePasswordModalContent],
      providers: [
        {
          provide: ChangePasswordService,
          useValue: changePasswordServiceMock,
        },
        {
          provide: ModalRef,
          useValue: modalRefMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordModalContent);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('successful change', () => {
    it('should close the modal', () => {
      fixture.detectChanges();

      changePasswordServiceMock.status.set(AuthFlowStatus.Success);

      fixture.detectChanges();

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without submitting', () => {
    it('should not call changePassword', () => {
      fixture.detectChanges();

      expect(changePasswordServiceMock.changePassword).not.toHaveBeenCalled();
    });

    it('should reset the flow when the form is closed after an error', () => {
      fixture.detectChanges();

      changePasswordServiceMock.errorMessage.set('Mock error');
      changePasswordServiceMock.status.set(AuthFlowStatus.Error);
      fixture.detectChanges();

      fixture.destroy();

      expect(changePasswordServiceMock.reset).toHaveBeenCalledOnce();
    });

    it('should show an empty form without an error when reopened', async () => {
      fixture.detectChanges();

      const form: ChangePasswordForm = fixture.debugElement.query(
        By.directive(ChangePasswordForm),
      ).componentInstance;

      form.changePasswordForm.setValue({
        oldPassword: 'typedOldPassword',
        newPassword: 'typedNewPassword',
        repeatNewPassword: 'typedNewPassword',
      });

      changePasswordServiceMock.errorMessage.set('Mock error');
      changePasswordServiceMock.status.set(AuthFlowStatus.Error);
      fixture.detectChanges();

      fixture.destroy();

      changePasswordServiceMock.errorMessage.set(null);
      changePasswordServiceMock.status.set(AuthFlowStatus.Idle);

      const reopenedFixture = TestBed.createComponent(ChangePasswordModalContent);
      await reopenedFixture.whenStable();
      reopenedFixture.detectChanges();

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
