import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ChangePasswordService } from '../../application/change-password/change-password.service';

import { ChangePasswordForm } from './change-password-form';

let changePasswordServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  succeeded$: Subject<void>;
  changePassword: ReturnType<typeof vi.fn>;
};

describe('ChangePasswordForm', () => {
  let component: ChangePasswordForm;
  let fixture: ComponentFixture<ChangePasswordForm>;

  const submitForm = () => {
    const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
    formElement.dispatchEvent(new Event('submit'));
  };

  const getSubmitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');

  const getFieldErrors = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.form-field__error'));

  const getRepeatFieldError = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.change-password-form__repeat-field .form-field__error');

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
      succeeded$: new Subject<void>(),
      changePassword: vi.fn(),
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
  });

  describe('repeat does not match the new password', () => {
    it('should not call changePassword', () => {
      fixture.detectChanges();

      fillForm('oldPassword', 'newPassword', 'otherPassword');

      submitForm();

      expect(changePasswordServiceMock.changePassword).not.toHaveBeenCalled();
    });

    it('should disable the submit button after the repeat field loses focus', () => {
      fixture.detectChanges();

      fillForm('oldPassword', 'newPassword', 'otherPassword');
      component.changePasswordForm.controls.repeatNewPassword.markAsTouched();
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should show a mismatch message under the repeat field', () => {
      fixture.detectChanges();

      fillForm('oldPassword', 'newPassword', 'otherPassword');
      component.changePasswordForm.controls.repeatNewPassword.markAsTouched();
      fixture.detectChanges();

      expect(getRepeatFieldError()?.textContent?.trim()).toBe('Values do not match');
    });

    it('should hide the mismatch message once the repeat field is edited to match', () => {
      fixture.detectChanges();

      fillForm('oldPassword', 'newPassword', 'otherPassword');
      component.changePasswordForm.controls.repeatNewPassword.markAsTouched();
      fixture.detectChanges();

      component.changePasswordForm.controls.repeatNewPassword.setValue('newPassword');
      fixture.detectChanges();

      expect(getRepeatFieldError()).toBeNull();
    });

    it('should hide the mismatch message once the new password field is edited to match', () => {
      fixture.detectChanges();

      fillForm('oldPassword', 'newPassword', 'otherPassword');
      component.changePasswordForm.controls.repeatNewPassword.markAsTouched();
      fixture.detectChanges();

      component.changePasswordForm.controls.newPassword.setValue('otherPassword');
      fixture.detectChanges();

      expect(getRepeatFieldError()).toBeNull();
    });
  });

  describe('submit button availability', () => {
    it('should disable the submit button when fields are empty', () => {
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should not show field errors on an untouched form', () => {
      fixture.detectChanges();

      expect(getFieldErrors()).toHaveLength(0);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should show a field error after the field loses focus while it stays empty', () => {
      fixture.detectChanges();

      component.changePasswordForm.controls.oldPassword.markAsTouched();
      fixture.detectChanges();

      const fieldErrors = getFieldErrors();

      expect(fieldErrors.length).toBeGreaterThan(0);
      expect(fieldErrors.some((error) => error.textContent?.trim())).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should enable the submit button once the form becomes valid', () => {
      fixture.detectChanges();

      fillForm('oldPassword', 'newPassword', 'newPassword');
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(false);
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
    it('should not render a submit error in the form', () => {
      fixture.detectChanges();

      const errorElement: HTMLElement | null = fixture.nativeElement.querySelector(
        '.change-password-form__error',
      );

      expect(errorElement).toBeNull();
    });
  });

  describe('success state', () => {
    it('should emit passwordChanged when the service reports success, without a manual application tick', () => {
      const passwordChangedSpy = vi.fn();
      component.passwordChanged.subscribe(passwordChangedSpy);

      changePasswordServiceMock.succeeded$.next();

      expect(passwordChangedSpy).toHaveBeenCalledOnce();
    });
  });
});
