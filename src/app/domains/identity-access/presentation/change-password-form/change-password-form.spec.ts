import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFlowStatus } from '../../application/auth-flow-status.type';
import { ChangePasswordService } from '../../application/change-password/change-password.service';

import { ChangePasswordForm } from './change-password-form';

let changePasswordServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  errorMessage: WritableSignal<string | null>;
  status: WritableSignal<AuthFlowStatus>;
  changePassword: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
};

describe('ChangePasswordForm', () => {
  let component: ChangePasswordForm;
  let fixture: ComponentFixture<ChangePasswordForm>;

  const submitForm = () => {
    const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
    formElement.dispatchEvent(new Event('submit'));
  };

  const fillForm = (oldPassword: string, newPassword: string, repeatNewPassword: string) => {
    component.changePasswordForm.setValue({
      oldPassword,
      newPassword,
      repeatNewPassword,
    });
  };

  beforeEach(async () => {
    changePasswordServiceMock = {
      isSubmitting: signal(false),
      errorMessage: signal(null),
      status: signal(AuthFlowStatus.Idle),
      changePassword: vi.fn(),
      reset: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ChangePasswordForm],
      providers: [
        {
          provide: ChangePasswordService,
          useValue: changePasswordServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('opened form', () => {
    it('should show three empty fields', () => {
      fixture.detectChanges();

      expect(component.changePasswordForm.getRawValue()).toEqual({
        oldPassword: '',
        newPassword: '',
        repeatNewPassword: '',
      });

      const inputEls: HTMLInputElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('input'),
      );

      expect(inputEls).toHaveLength(3);

      inputEls.forEach((inputEl) => {
        expect(inputEl.value).toBe('');
      });
    });
  });

  describe('submit with empty fields', () => {
    it('should not call changePassword', () => {
      fixture.detectChanges();

      submitForm();

      expect(changePasswordServiceMock.changePassword).not.toHaveBeenCalled();
    });

    it('should mark all controls as touched and show field errors', () => {
      fixture.detectChanges();

      submitForm();

      fixture.detectChanges();

      const formControls = Object.values(component.changePasswordForm.controls);

      for (const { touched } of formControls) {
        expect(touched).toBe(true);
      }

      const fieldErrors: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.form-field__error'),
      );

      expect(fieldErrors.length).toBeGreaterThan(0);
      expect(fieldErrors.some((error) => error.textContent?.trim())).toBe(true);
    });
  });

  describe('repeat does not match the new password', () => {
    it('should not call changePassword', () => {
      fixture.detectChanges();

      fillForm('oldPassword', 'newPassword', 'otherPassword');

      submitForm();

      expect(changePasswordServiceMock.changePassword).not.toHaveBeenCalled();
    });

    it('should show the error on the repeat field', () => {
      fixture.detectChanges();

      fillForm('oldPassword', 'newPassword', 'otherPassword');

      submitForm();

      fixture.detectChanges();

      const repeatField: HTMLElement = fixture.nativeElement.querySelector(
        '.change-password-form__repeat-field',
      );
      const repeatFieldError: HTMLElement | null = repeatField.querySelector('.form-field__error');

      expect(repeatFieldError).not.toBeNull();
      expect(repeatFieldError?.textContent?.trim()).toBeTruthy();
    });
  });

  describe('valid submit', () => {
    it('should call changePassword with the old and the new password only', () => {
      fixture.detectChanges();

      fillForm('oldPassword', 'newPassword', 'newPassword');

      submitForm();

      expect(changePasswordServiceMock.changePassword).toHaveBeenCalledOnce();
      expect(changePasswordServiceMock.changePassword).toHaveBeenCalledWith({
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      });
    });
  });

  describe('submitting state', () => {
    it('should disable submit button', () => {
      changePasswordServiceMock.isSubmitting.set(true);
      fixture.detectChanges();

      const submitButton: HTMLButtonElement =
        fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton.disabled).toBe(true);
    });

    it('should disable all controls', () => {
      changePasswordServiceMock.isSubmitting.set(true);
      fixture.detectChanges();

      const inputEls: HTMLInputElement[] = fixture.nativeElement.querySelectorAll('input');

      inputEls.forEach((inputEl) => {
        expect(inputEl.disabled).toBe(true);
      });
    });
  });

  describe('error state', () => {
    it('should render submit error', () => {
      changePasswordServiceMock.errorMessage.set('Mock error');

      fixture.detectChanges();

      const errorElement: HTMLElement | null = fixture.nativeElement.querySelector(
        '.change-password-form__error',
      );

      expect(errorElement).not.toBeNull();
      expect(errorElement?.textContent).toContain('Mock error');
    });

    it('should keep entered values in the form', () => {
      fixture.detectChanges();

      fillForm('typedOldPassword', 'typedNewPassword', 'typedNewPassword');

      changePasswordServiceMock.errorMessage.set('Mock error');
      fixture.detectChanges();

      expect(component.changePasswordForm.getRawValue()).toEqual({
        oldPassword: 'typedOldPassword',
        newPassword: 'typedNewPassword',
        repeatNewPassword: 'typedNewPassword',
      });
    });
  });

  describe('success state', () => {
    it('should emit passwordChanged', () => {
      const passwordChangedSpy = vi.fn();
      component.passwordChanged.subscribe(passwordChangedSpy);

      changePasswordServiceMock.status.set(AuthFlowStatus.Success);

      fixture.detectChanges();

      expect(passwordChangedSpy).toHaveBeenCalledOnce();
    });

    it('should reset submitting status', () => {
      changePasswordServiceMock.status.set(AuthFlowStatus.Success);

      fixture.detectChanges();

      expect(changePasswordServiceMock.reset).toHaveBeenCalledOnce();
    });
  });
});
