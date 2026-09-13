import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { UpdateProfileInput } from '../../application/update-profile/update-profile-input.type';
import { UpdateProfileService } from '../../application/update-profile/update-profile.service';

import { UpdateProfileForm } from './update-profile-form';

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

describe('UpdateProfileForm', () => {
  let component: UpdateProfileForm;
  let fixture: ComponentFixture<UpdateProfileForm>;

  const submitForm = () => {
    const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
    formElement.dispatchEvent(new Event('submit'));
  };

  const getSubmitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');

  const getFieldErrors = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.form-field__error'));

  beforeEach(async () => {
    updateProfileServiceMock = {
      initialValues: signal(initialValuesMock),
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      updateProfile: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UpdateProfileForm],
      providers: [
        {
          provide: UpdateProfileService,
          useValue: updateProfileServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateProfileForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('prefilled form', () => {
    it('should prefill form with initial values of the current user', () => {
      fixture.detectChanges();

      expect(component.updateProfileForm.getRawValue()).toEqual(initialValuesMock);
    });
  });

  describe('submit availability', () => {
    it('should disable the submit button until the form is changed', () => {
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should not show field errors on an untouched prefilled form', () => {
      fixture.detectChanges();

      expect(getFieldErrors()).toHaveLength(0);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should enable the submit button once a field changes and the form stays valid', () => {
      fixture.detectChanges();

      component.updateProfileForm.controls.firstName.markAsDirty();
      component.updateProfileForm.controls.firstName.setValue('changed');
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(false);
    });
  });

  describe('invalid submit', () => {
    it('should not call updateProfile when form is invalid', () => {
      fixture.detectChanges();

      component.updateProfileForm.controls.email.markAsDirty();
      component.updateProfileForm.controls.email.setValue('not-an-email');

      submitForm();

      expect(updateProfileServiceMock.updateProfile).not.toHaveBeenCalled();
    });

    it('should disable the submit button when a changed field becomes invalid', () => {
      fixture.detectChanges();

      component.updateProfileForm.controls.email.markAsDirty();
      component.updateProfileForm.controls.email.setValue('not-an-email');
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should show a field error after the field loses focus while it stays invalid', () => {
      fixture.detectChanges();

      component.updateProfileForm.controls.email.setValue('not-an-email');
      component.updateProfileForm.controls.email.markAsTouched();
      fixture.detectChanges();

      const fieldErrors = getFieldErrors();

      expect(fieldErrors.length).toBeGreaterThan(0);
      expect(fieldErrors.some((error) => error.textContent?.trim())).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });
  });

  describe('valid submit', () => {
    it('should call updateProfile with form value when a changed valid form is submitted', () => {
      fixture.detectChanges();

      component.updateProfileForm.controls.firstName.markAsDirty();
      component.updateProfileForm.controls.firstName.setValue('changed');

      submitForm();

      expect(updateProfileServiceMock.updateProfile).toHaveBeenCalledOnce();
      expect(updateProfileServiceMock.updateProfile).toHaveBeenCalledWith({
        ...initialValuesMock,
        firstName: 'changed',
      });
    });
  });

  describe('submitting state', () => {
    it('should disable submit button', () => {
      updateProfileServiceMock.isSubmitting.set(true);
      fixture.detectChanges();

      const submitButton: HTMLButtonElement =
        fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton.disabled).toBe(true);
    });

    it('should disable all controls', () => {
      updateProfileServiceMock.isSubmitting.set(true);
      fixture.detectChanges();

      const inputEls: HTMLInputElement[] = fixture.nativeElement.querySelectorAll('input');

      inputEls.forEach((inputEl) => {
        expect(inputEl.disabled).toBe(true);
      });
    });

    it('should not treat the lock while submitting as a form change', () => {
      fixture.detectChanges();

      updateProfileServiceMock.isSubmitting.set(true);
      fixture.detectChanges();
      updateProfileServiceMock.isSubmitting.set(false);
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(true);
    });
  });

  describe('error state', () => {
    it('should not render a submit error in the form', () => {
      fixture.detectChanges();

      const errorElement: HTMLElement | null = fixture.nativeElement.querySelector(
        '.update-profile-form__error',
      );

      expect(errorElement).toBeNull();
    });
  });

  describe('success state', () => {
    it('should emit profileUpdated when the service reports success, without a manual application tick', () => {
      const profileUpdatedSpy = vi.fn();
      component.profileUpdated.subscribe(profileUpdatedSpy);

      updateProfileServiceMock.succeeded$.next();

      expect(profileUpdatedSpy).toHaveBeenCalledOnce();
    });
  });
});
