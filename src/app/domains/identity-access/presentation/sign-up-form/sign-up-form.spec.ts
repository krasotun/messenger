import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFlowStatus } from '../../application/auth-flow-status';
import { SignUpService } from '../../application/sign-up/sign-up.service';

import { SignUpForm } from './sign-up-form';

let signUpServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  errorMessage: WritableSignal<string | null>;
  status: WritableSignal<AuthFlowStatus>;
  signUp: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
};

describe('SignUpForm', () => {
  let component: SignUpForm;
  let fixture: ComponentFixture<SignUpForm>;

  beforeEach(async () => {
    signUpServiceMock = {
      isSubmitting: signal(false),
      errorMessage: signal(null),
      status: signal(AuthFlowStatus.Idle),
      signUp: vi.fn(),
      reset: vi.fn(),
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
    it('should emit signUpSucceeded', () => {
      const signUpSucceededSpy = vi.fn();
      component.signUpSucceeded.subscribe(signUpSucceededSpy);

      signUpServiceMock.status.set(AuthFlowStatus.Success);

      fixture.detectChanges();

      expect(signUpSucceededSpy).toHaveBeenCalledOnce();
    });

    it('should reset submitting status', () => {
      signUpServiceMock.status.set(AuthFlowStatus.Success);

      fixture.detectChanges();

      expect(signUpServiceMock.reset).toHaveBeenCalledOnce();
    });
  });
});
