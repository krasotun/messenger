import { outputBinding, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { Subject } from 'rxjs';

import { SignUpForm } from './sign-up-form';

import { AUTH_GATEWAY } from '@domains/identity-access/application/auth.gateway';
import { SignUpInput } from '@domains/identity-access/application/sign-up/sign-up-input.type';
import { SignUpService } from '@domains/identity-access/application/sign-up/sign-up.service';
import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const requiredFieldError = 'This field is required';

const fieldLabels: Record<keyof SignUpInput, string> = {
  firstName: 'First name',
  secondName: 'Second name',
  login: 'Login',
  email: 'Email',
  password: 'Password',
  phone: 'Mobile phone',
};

let signUpServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  succeeded$: Subject<void>;
  signUp: ReturnType<typeof vi.fn>;
};

describe('SignUpForm', () => {
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  const validFormValue = {
    firstName: 'Mock',
    secondName: 'Mock',
    login: 'Mock',
    email: 'mock@mock.ru',
    password: 'qfndjkjnk&(YY',
    phone: '+79991234567',
  };

  // SignUpService живет в providers компонента: у zoneless-render нет
  // componentProviders, подмена идет через overrideComponent.
  const renderForm = async () => {
    const signUpSucceeded = vi.fn();

    const result = await render(SignUpForm, {
      bindings: [outputBinding('signUpSucceeded', signUpSucceeded)],
      configureTestBed: (testBed) =>
        testBed.overrideComponent(SignUpForm, {
          set: { providers: [{ provide: SignUpService, useValue: signUpServiceMock }] },
        }),
      waitForStableOnRender: true,
    });

    return { ...result, signUpSucceeded };
  };

  const fillForm = async (form: HTMLElement, value: SignUpInput): Promise<void> => {
    const user = userEvent.setup();

    for (const [field, label] of Object.entries(fieldLabels)) {
      await user.type(within(form).getByLabelText(label), value[field as keyof SignUpInput]);
    }
  };

  const getSubmitButton = (form: HTMLElement = document.body): HTMLElement =>
    within(form).getByRole('button', { name: 'Register' });

  beforeEach(() => {
    notifierMock = NotificationMocks.notifier();
    signUpServiceMock = {
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      signUp: vi.fn(),
    };
  });

  it('should create', async () => {
    const { fixture } = await renderForm();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('invalid submit', () => {
    // Кнопка выключена, пользовательского пути к submit нет: проверяем защиту.
    it('should not call signUp when form is invalid', async () => {
      const { container } = await renderForm();

      fireEvent.submit(container.querySelector('form') as HTMLFormElement);

      expect(signUpServiceMock.signUp).not.toHaveBeenCalled();
    });
  });

  describe('submit button availability', () => {
    it('should disable the submit button when the sign-up form has invalid fields', async () => {
      await renderForm();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should not show field errors on an untouched form', async () => {
      await renderForm();

      expect(screen.queryByText(requiredFieldError)).not.toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should show a field error after the field loses focus while it stays invalid', async () => {
      const user = userEvent.setup();
      await renderForm();

      await user.click(screen.getByLabelText('Email'));
      await user.tab();

      expect(screen.getByText(requiredFieldError)).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should enable the submit button once the form becomes valid', async () => {
      const { container } = await renderForm();

      await fillForm(container, validFormValue);

      expect(getSubmitButton()).toBeEnabled();
    });
  });

  it('should not render a submit error in the form', async () => {
    const { container } = await renderForm();

    expect(container.querySelector('.sign-up-form__error')).toBeNull();
  });

  describe('valid submit', () => {
    it('should call signUp with form value when submitted form is valid', async () => {
      const user = userEvent.setup();
      const { container } = await renderForm();

      await fillForm(container, validFormValue);
      await user.click(getSubmitButton());

      expect(signUpServiceMock.signUp).toHaveBeenCalledOnce();
      expect(signUpServiceMock.signUp).toHaveBeenCalledWith(validFormValue);
    });
  });

  describe('submitting state', () => {
    it('should disable submit button', async () => {
      const { fixture } = await renderForm();

      signUpServiceMock.isSubmitting.set(true);
      await fixture.whenStable();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should disable all controls', async () => {
      const { fixture } = await renderForm();

      signUpServiceMock.isSubmitting.set(true);
      await fixture.whenStable();

      for (const label of Object.values(fieldLabels)) {
        expect(screen.getByLabelText(label)).toBeDisabled();
      }
    });
  });

  describe('success state', () => {
    it('should emit signUpSucceeded when the service reports success, without a manual application tick', async () => {
      const { signUpSucceeded } = await renderForm();

      signUpServiceMock.succeeded$.next();

      expect(signUpSucceeded).toHaveBeenCalledOnce();
    });
  });

  describe('flow lifetime', () => {
    let authGatewayMock: ReturnType<typeof IdentityMocks.authGateway>;

    const mockSignUpValue: SignUpInput = validFormValue;

    const renderWithRealService = () =>
      render(SignUpForm, {
        providers: [
          { provide: AUTH_GATEWAY, useValue: authGatewayMock },
          { provide: NOTIFIER, useValue: notifierMock },
        ],
        waitForStableOnRender: true,
      });

    const submit = async (form: HTMLElement): Promise<void> => {
      await fillForm(form, mockSignUpValue);
      await userEvent.setup().click(getSubmitButton(form));
    };

    beforeEach(() => {
      authGatewayMock = IdentityMocks.authGateway();
    });

    // render настраивает TestBed и второй раз в одном тесте не вызывается:
    // повторное открытие формы идет через TestBed.createComponent.
    it('should keep the reopened form usable while the previous submit has not answered yet', async () => {
      authGatewayMock.signUp.mockReturnValue(new Subject());

      const { fixture: firstFixture, container } = await renderWithRealService();
      await submit(container);
      await firstFixture.whenStable();

      firstFixture.destroy();

      const reopenedFixture = TestBed.createComponent(SignUpForm);
      await reopenedFixture.whenStable();
      const reopenedForm: HTMLElement = reopenedFixture.nativeElement;

      await fillForm(reopenedForm, mockSignUpValue);

      expect(getSubmitButton(reopenedForm)).toBeEnabled();
      for (const label of Object.values(fieldLabels)) {
        expect(within(reopenedForm).getByLabelText(label)).toBeEnabled();
      }
    });

    it('should not cancel the submit when the form is closed before the gateway answers', async () => {
      const signUp$ = new Subject<{ userId: number }>();
      authGatewayMock.signUp.mockReturnValue(signUp$);

      const { fixture, container } = await renderWithRealService();
      await submit(container);
      await fixture.whenStable();

      fixture.destroy();

      signUp$.error(new ApplicationError('Mock error'));

      expect(notifierMock.error).toHaveBeenCalledWith('Sign-up failed', 'Mock error');
    });
  });
});
