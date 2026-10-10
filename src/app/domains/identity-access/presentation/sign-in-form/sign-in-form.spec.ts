import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { AUTH_GATEWAY } from '../../application/auth.gateway';
import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { SignInInput } from '../../application/sign-in/sign-in-input.type';
import { SignInService } from '../../application/sign-in/sign-in.service';

import { SignInForm } from './sign-in-form';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

let signInServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  succeeded$: Subject<void>;
  signIn: ReturnType<typeof vi.fn>;
};

const notifierMock = {
  success: vi.fn(),
  error: vi.fn(),
};

describe('SignInForm', () => {
  let component: SignInForm;
  let fixture: ComponentFixture<SignInForm>;

  const getSubmitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');

  const getFieldErrors = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.form-field__error'));

  beforeEach(async () => {
    signInServiceMock = {
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      signIn: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [SignInForm],
    });

    TestBed.overrideComponent(SignInForm, {
      set: {
        providers: [
          {
            provide: SignInService,
            useValue: signInServiceMock,
          },
        ],
      },
    });

    await TestBed.compileComponents();

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

    it('should not render a submit error in the form', () => {
      fixture.detectChanges();

      const errorElement: HTMLElement | null =
        fixture.nativeElement.querySelector('.sign-in-form__error');

      expect(errorElement).toBeNull();
    });
  });

  describe('submit button availability', () => {
    it('should disable the submit button when the sign-in form is empty', () => {
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

      component.signInForm.controls.login.markAsTouched();
      fixture.detectChanges();

      const fieldErrors = getFieldErrors();

      expect(fieldErrors.length).toBeGreaterThan(0);
      expect(fieldErrors.some((error) => error.textContent?.trim())).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should enable the submit button once the form becomes valid', () => {
      fixture.detectChanges();

      component.signInForm.setValue({ login: 'Mock', password: 'secret' });
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(false);
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

  describe('flow lifetime', () => {
    let authGatewayMock: {
      signIn: ReturnType<typeof vi.fn>;
    };

    let currentSessionServiceMock: {
      restoreCurrentSession: ReturnType<typeof vi.fn>;
    };

    const mockSignInValue: SignInInput = {
      login: 'Mock',
      password: 'secret',
    };

    const openForm = async (): Promise<ComponentFixture<SignInForm>> => {
      const openedFixture = TestBed.createComponent(SignInForm);
      await openedFixture.whenStable();
      openedFixture.detectChanges();

      return openedFixture;
    };

    const submit = (openedFixture: ComponentFixture<SignInForm>): void => {
      openedFixture.componentInstance.signInForm.setValue(mockSignInValue);
      openedFixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    };

    beforeEach(async () => {
      TestBed.resetTestingModule();

      authGatewayMock = { signIn: vi.fn() };
      currentSessionServiceMock = { restoreCurrentSession: vi.fn() };

      notifierMock.success.mockReset();
      notifierMock.error.mockReset();

      TestBed.configureTestingModule({
        imports: [SignInForm],
        providers: [
          { provide: AUTH_GATEWAY, useValue: authGatewayMock },
          { provide: CurrentSessionService, useValue: currentSessionServiceMock },
          { provide: NOTIFIER, useValue: notifierMock },
        ],
      });

      await TestBed.compileComponents();
    });

    it('should keep the reopened form usable while the previous submit has not answered yet', async () => {
      authGatewayMock.signIn.mockReturnValue(new Subject());

      const firstFixture = await openForm();
      submit(firstFixture);
      await firstFixture.whenStable();

      firstFixture.destroy();

      const reopenedFixture = await openForm();
      reopenedFixture.componentInstance.signInForm.setValue(mockSignInValue);
      reopenedFixture.detectChanges();

      const submitButton: HTMLButtonElement =
        reopenedFixture.nativeElement.querySelector('button[type="submit"]');
      const inputEls: HTMLInputElement[] = Array.from(
        reopenedFixture.nativeElement.querySelectorAll('input'),
      );

      expect(submitButton.disabled).toBe(false);
      inputEls.forEach((inputEl) => {
        expect(inputEl.disabled).toBe(false);
      });
    });

    it('should not cancel the submit when the form is closed before the gateway answers', async () => {
      const signIn$ = new Subject<{ authenticated: true }>();
      authGatewayMock.signIn.mockReturnValue(signIn$);

      const openedFixture = await openForm();
      submit(openedFixture);
      await openedFixture.whenStable();

      openedFixture.destroy();

      signIn$.error(new ApplicationError('Mock error'));

      expect(notifierMock.error).toHaveBeenCalledWith('Sign-in failed', 'Mock error');
    });
  });
});
