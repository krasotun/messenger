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

    it('all controls should be touched', () => {
      fixture.detectChanges();

      const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      const formControls = Object.values(component.signUpForm.controls);

      for (const { touched } of formControls) {
        expect(touched).toBe(true);
      }
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

      const mockFormValue = {
        firstName: 'Mock',
        secondName: 'Mock',
        login: 'Mock',
        email: 'mock@mock.ru',
        password: 'qfndjkjnk&(YY',
        phone: '+79991234567',
      };

      component.signUpForm.setValue(mockFormValue);

      const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      expect(signUpServiceMock.signUp).toHaveBeenCalledOnce();
      expect(signUpServiceMock.signUp).toHaveBeenCalledWith(mockFormValue);
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
