import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { SignInService } from '../../application/sign-in/sign-in.service';

import { SignInForm } from './sign-in-form';

let signInServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  succeeded$: Subject<void>;
  signIn: ReturnType<typeof vi.fn>;
};

describe('SignInForm', () => {
  let component: SignInForm;
  let fixture: ComponentFixture<SignInForm>;

  beforeEach(async () => {
    signInServiceMock = {
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      signIn: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [SignInForm],

      providers: [
        {
          provide: SignInService,
          useValue: signInServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('invalid submit', () => {
    it('should not call signIn when form is invalid', () => {
      fixture.detectChanges();

      const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      expect(signInServiceMock.signIn).not.toHaveBeenCalled();
    });

    it('all controls should be touched', () => {
      fixture.detectChanges();

      const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      const formControls = Object.values(component.signInForm.controls);

      for (const { touched } of formControls) {
        expect(touched).toBe(true);
      }
    });

    it('should not render a submit error in the form', () => {
      fixture.detectChanges();

      const errorElement: HTMLElement | null =
        fixture.nativeElement.querySelector('.sign-in-form__error');

      expect(errorElement).toBeNull();
    });
  });

  describe('valid submit', () => {
    it('should call signIn with form value when submitted form is valid', () => {
      fixture.detectChanges();

      const mockFormValue = {
        login: 'Mock',
        password: 'qfndjkjnk&(YY',
      };

      component.signInForm.setValue(mockFormValue);

      const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      expect(signInServiceMock.signIn).toHaveBeenCalledOnce();
      expect(signInServiceMock.signIn).toHaveBeenCalledWith(mockFormValue);
    });
  });

  describe('submitting state', () => {
    it('should disable submit button', () => {
      signInServiceMock.isSubmitting.set(true);
      fixture.detectChanges();

      const submitButton: HTMLButtonElement =
        fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton.disabled).toBe(true);
    });

    it('should disable all controls', () => {
      signInServiceMock.isSubmitting.set(true);
      fixture.detectChanges();

      const inputEls: HTMLInputElement[] = fixture.nativeElement.querySelectorAll('input');

      inputEls.forEach((inputEl) => {
        expect(inputEl.disabled).toBe(true);
      });
    });
  });

  describe('success state', () => {
    it('should emit signInSucceeded when the service reports success, without a manual application tick', () => {
      const signInSucceededSpy = vi.fn();
      component.signInSucceeded.subscribe(signInSucceededSpy);

      signInServiceMock.succeeded$.next();

      expect(signInSucceededSpy).toHaveBeenCalledOnce();
    });
  });
});
