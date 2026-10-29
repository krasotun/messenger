import { outputBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { of, Subject } from 'rxjs';

import { SignUpForm } from './sign-up-form';

import { AUTH_GATEWAY, SignUpInput } from '@domains/users/data/auth-gateway';
import { USER_GATEWAY } from '@domains/users/data/user-gateway';
import { UserMocks } from '@domains/users/testing';
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

describe('SignUpForm', () => {
  let authGatewayMock: ReturnType<typeof UserMocks.authGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  const validFormValue = {
    firstName: 'Mock',
    secondName: 'Mock',
    login: 'Mock',
    email: 'mock@mock.ru',
    password: 'qfndjkjnk&(YY',
    phone: '+79991234567',
  };

  const renderForm = async () => {
    const signUpSucceeded = vi.fn();

    const result = await render(SignUpForm, {
      bindings: [outputBinding('signUpSucceeded', signUpSucceeded)],
      providers: [
        { provide: AUTH_GATEWAY, useValue: authGatewayMock },
        { provide: USER_GATEWAY, useValue: UserMocks.userGateway() },
        { provide: NOTIFIER, useValue: notifierMock },
      ],
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

  const submit = async (form: HTMLElement): Promise<void> => {
    await fillForm(form, validFormValue);
    await userEvent.setup().click(getSubmitButton(form));
  };

  beforeEach(() => {
    authGatewayMock = UserMocks.authGateway();
    notifierMock = NotificationMocks.notifier();
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

      expect(authGatewayMock.signUp).not.toHaveBeenCalled();
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
      authGatewayMock.signUp.mockReturnValue(new Subject());
      const { container } = await renderForm();

      await submit(container);

      expect(authGatewayMock.signUp).toHaveBeenCalledOnce();
      expect(authGatewayMock.signUp).toHaveBeenCalledWith(validFormValue);
    });
  });

  describe('submitting state', () => {
    it('should disable submit button', async () => {
      authGatewayMock.signUp.mockReturnValue(new Subject());
      const { container } = await renderForm();

      await submit(container);

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should disable all controls', async () => {
      authGatewayMock.signUp.mockReturnValue(new Subject());
      const { container } = await renderForm();

      await submit(container);

      for (const label of Object.values(fieldLabels)) {
        expect(screen.getByLabelText(label)).toBeDisabled();
      }
    });
  });

  describe('success state', () => {
    it('should emit signUpSucceeded when the store reports success, without a manual application tick', async () => {
      authGatewayMock.signUp.mockReturnValue(of({ userId: 1 }));
      const { container, signUpSucceeded } = await renderForm();

      await submit(container);

      expect(signUpSucceeded).toHaveBeenCalledOnce();
    });
  });

  describe('flow lifetime', () => {
    // render настраивает TestBed и второй раз в одном тесте не вызывается:
    // повторное открытие формы идет через TestBed.createComponent.
    it('should keep the reopened form usable while the previous submit has not answered yet', async () => {
      authGatewayMock.signUp.mockReturnValue(new Subject());

      const { fixture: firstFixture, container } = await renderForm();
      await submit(container);
      await firstFixture.whenStable();

      firstFixture.destroy();

      const reopenedFixture = TestBed.createComponent(SignUpForm);
      await reopenedFixture.whenStable();
      const reopenedForm: HTMLElement = reopenedFixture.nativeElement;

      await fillForm(reopenedForm, validFormValue);

      expect(getSubmitButton(reopenedForm)).toBeEnabled();
      for (const label of Object.values(fieldLabels)) {
        expect(within(reopenedForm).getByLabelText(label)).toBeEnabled();
      }
    });

    it('should not cancel the submit when the form is closed before the gateway answers', async () => {
      const signUp$ = new Subject<{ userId: number }>();
      authGatewayMock.signUp.mockReturnValue(signUp$);

      const { fixture, container } = await renderForm();
      await submit(container);
      await fixture.whenStable();

      fixture.destroy();

      signUp$.error(new ApplicationError('Mock error'));

      expect(notifierMock.error).toHaveBeenCalledWith('Sign-up failed', 'Mock error');
    });
  });
});
