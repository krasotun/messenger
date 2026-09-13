import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { SignUpForm } from './sign-up-form';

import { SignUpService } from '@domains/identity-access/application/sign-up/sign-up.service';

let signUpServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  succeeded$: Subject<void>;
  signUp: ReturnType<typeof vi.fn>;
};

describe('SignUpForm', () => {
  let component: SignUpForm;
  let fixture: ComponentFixture<SignUpForm>;

  const validFormValue = {
    firstName: 'Mock',
    secondName: 'Mock',
    login: 'Mock',
    email: 'mock@mock.ru',
    password: 'qfndjkjnk&(YY',
    phone: '+79991234567',
  };

  const getSubmitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');

  const getFieldErrors = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.form-field__error'));

  beforeEach(async () => {
    signUpServiceMock = {
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      signUp: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SignUpForm],
      providers: [
        {
          provide: SignUpService,
          useValue: signUpServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('invalid submit', () => {
    it('should not call signUp when form is invalid', () => {
      fixture.detectChanges();

      const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      expect(signUpServiceMock.signUp).not.toHaveBeenCalled();
    });
  });

  describe('submit button availability', () => {
    it('should disable the submit button when the sign-up form has invalid fields', () => {
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should not show field errors on an untouched form', () => {
      fixture.detectChanges();

      expect(getFieldErrors()).toHaveLength(0);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should show a field error after the field loses focus while it stays invalid', () => {
      fixture.detectChanges();

      component.signUpForm.controls.email.markAsTouched();
      fixture.detectChanges();

      const fieldErrors = getFieldErrors();

      expect(fieldErrors.length).toBeGreaterThan(0);
      expect(fieldErrors.some((error) => error.textContent?.trim())).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should enable the submit button once the form becomes valid', () => {
      fixture.detectChanges();

      component.signUpForm.setValue(validFormValue);
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(false);
    });
  });

  it('should not render a submit error in the form', () => {
    fixture.detectChanges();

    const errorElement: HTMLElement | null =
      fixture.nativeElement.querySelector('.sign-up-form__error');

    expect(errorElement).toBeNull();
  });

  describe('valid submit', () => {
    it('should call signUp with form value when submitted form is valid', () => {
      fixture.detectChanges();

      component.signUpForm.setValue(validFormValue);

      const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      expect(signUpServiceMock.signUp).toHaveBeenCalledOnce();
      expect(signUpServiceMock.signUp).toHaveBeenCalledWith(validFormValue);
    });
  });

  describe('submitting state', () => {
    it('should disable submit button', () => {
      signUpServiceMock.isSubmitting.set(true);
      fixture.detectChanges();

      const submitButton: HTMLButtonElement =
        fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton.disabled).toBe(true);
    });

    it('should disable all controls', () => {
      signUpServiceMock.isSubmitting.set(true);
      fixture.detectChanges();

      const inputEls: HTMLInputElement[] = fixture.nativeElement.querySelectorAll('input');

      inputEls.forEach((inputEl) => {
        expect(inputEl.disabled).toBe(true);
      });
    });
  });

  describe('success state', () => {
    it('should emit signUpSucceeded when the service reports success, without a manual application tick', () => {
      const signUpSucceededSpy = vi.fn();
      component.signUpSucceeded.subscribe(signUpSucceededSpy);

      signUpServiceMock.succeeded$.next();

      expect(signUpSucceededSpy).toHaveBeenCalledOnce();
    });
  });
});
