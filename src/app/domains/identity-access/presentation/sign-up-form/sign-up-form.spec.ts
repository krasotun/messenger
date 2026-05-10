import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { SignUpService, SignUpStatus } from '../../application/sign-up.service';

import { SignUpForm } from './sign-up-form';

let signUpServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  errorMessage: WritableSignal<string | null>;
  status: WritableSignal<SignUpStatus>;
  signUp: ReturnType<typeof vi.fn>;
  resetSignUpStatus: ReturnType<typeof vi.fn>;
};

let routerMock: {
  navigate: ReturnType<typeof vi.fn>;
};

describe('SignUpForm', () => {
  let component: SignUpForm;
  let fixture: ComponentFixture<SignUpForm>;

  beforeEach(async () => {
    signUpServiceMock = {
      isSubmitting: signal(false),
      errorMessage: signal(null),
      status: signal(SignUpStatus.Idle),
      signUp: vi.fn(),
      resetSignUpStatus: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SignUpForm],
      providers: [
        {
          provide: SignUpService,
          useValue: signUpServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
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

  it('should render submit error', () => {
    signUpServiceMock.errorMessage.set('Mock error');

    fixture.detectChanges();

    const errorElement: HTMLElement | null =
      fixture.nativeElement.querySelector('.sign-up-form__error');

    expect(errorElement).not.toBeNull();
    expect(errorElement?.textContent).toContain('Ошибка регистрации');
    expect(errorElement?.textContent).toContain('Mock error');
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
    it('should navigate to sign-in after success submit', () => {
      signUpServiceMock.status.set(SignUpStatus.Success);

      fixture.detectChanges();

      expect(routerMock.navigate).toHaveBeenCalledOnce();
      expect(routerMock.navigate).toHaveBeenCalledWith(['sign-in']);
    });

    it('should reset submitting status', () => {
      signUpServiceMock.status.set(SignUpStatus.Success);

      fixture.detectChanges();

      expect(signUpServiceMock.resetSignUpStatus).toHaveBeenCalledOnce();
    });
  });
});
