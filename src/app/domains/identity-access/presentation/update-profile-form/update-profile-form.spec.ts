import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFlowStatus } from '../../application/auth-flow-status';
import { UpdateProfileInput } from '../../application/update-profile/update-profile.input';
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
  errorMessage: WritableSignal<string | null>;
  status: WritableSignal<AuthFlowStatus>;
  updateProfile: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
};

describe('UpdateProfileForm', () => {
  let component: UpdateProfileForm;
  let fixture: ComponentFixture<UpdateProfileForm>;

  beforeEach(async () => {
    updateProfileServiceMock = {
      initialValues: signal(initialValuesMock),
      isSubmitting: signal(false),
      errorMessage: signal(null),
      status: signal(AuthFlowStatus.Idle),
      updateProfile: vi.fn(),
      reset: vi.fn(),
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

  describe('invalid submit', () => {
    it('should not call updateProfile when form is invalid', () => {
      fixture.detectChanges();

      component.updateProfileForm.controls.email.setValue('not-an-email');

      const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      expect(updateProfileServiceMock.updateProfile).not.toHaveBeenCalled();
    });

    it('should mark all controls as touched and show field errors', () => {
      fixture.detectChanges();

      component.updateProfileForm.controls.email.setValue('not-an-email');

      const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      fixture.detectChanges();

      const formControls = Object.values(component.updateProfileForm.controls);

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

  describe('valid submit', () => {
    it('should call updateProfile with form value when submitted form is valid', () => {
      fixture.detectChanges();

      const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      expect(updateProfileServiceMock.updateProfile).toHaveBeenCalledOnce();
      expect(updateProfileServiceMock.updateProfile).toHaveBeenCalledWith(initialValuesMock);
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
  });

  describe('error state', () => {
    it('should render submit error', () => {
      updateProfileServiceMock.errorMessage.set('Mock error');

      fixture.detectChanges();

      const errorElement: HTMLElement | null = fixture.nativeElement.querySelector(
        '.update-profile-form__error',
      );

      expect(errorElement).not.toBeNull();
      expect(errorElement?.textContent).toContain('Mock error');
    });

    it('should keep entered values in the form', () => {
      fixture.detectChanges();

      component.updateProfileForm.controls.firstName.setValue('typedFirstName');

      updateProfileServiceMock.errorMessage.set('Mock error');
      fixture.detectChanges();

      expect(component.updateProfileForm.controls.firstName.value).toBe('typedFirstName');
    });
  });

  describe('success state', () => {
    it('should emit profileUpdated', () => {
      const profileUpdatedSpy = vi.fn();
      component.profileUpdated.subscribe(profileUpdatedSpy);

      updateProfileServiceMock.status.set(AuthFlowStatus.Success);

      fixture.detectChanges();

      expect(profileUpdatedSpy).toHaveBeenCalledOnce();
    });

    it('should reset submitting status', () => {
      updateProfileServiceMock.status.set(AuthFlowStatus.Success);

      fixture.detectChanges();

      expect(updateProfileServiceMock.reset).toHaveBeenCalledOnce();
    });
  });
});
