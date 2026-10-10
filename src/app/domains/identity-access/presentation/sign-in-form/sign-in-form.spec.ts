import { outputBinding, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { Subject } from 'rxjs';

import { AUTH_GATEWAY } from '../../application/auth.gateway';
import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { SignInInput } from '../../application/sign-in/sign-in-input.type';
import { SignInService } from '../../application/sign-in/sign-in.service';

import { SignInForm } from './sign-in-form';

import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const requiredFieldError = 'This field is required';

let signInServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  succeeded$: Subject<void>;
  signIn: ReturnType<typeof vi.fn>;
};

describe('SignInForm', () => {
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  // SignInService живет в providers компонента, поэтому подменяется через
  // overrideComponent: у zoneless-render нет опции componentProviders.
  const renderForm = async () => {
    const signInSucceeded = vi.fn();

    const result = await render(SignInForm, {
      bindings: [outputBinding('signInSucceeded', signInSucceeded)],
      configureTestBed: (testBed) =>
        testBed.overrideComponent(SignInForm, {
          set: { providers: [{ provide: SignInService, useValue: signInServiceMock }] },
        }),
      waitForStableOnRender: true,
    });

    return { ...result, signInSucceeded };
  };

  const getSubmitButton = (): HTMLElement => screen.getByRole('button', { name: 'Log in' });

  beforeEach(() => {
    notifierMock = NotificationMocks.notifier();
    signInServiceMock = {
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      signIn: vi.fn(),
    };
  });

  it('should create', async () => {
    const { fixture } = await renderForm();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('invalid submit', () => {
    // Кнопка отправки у невалидной формы выключена, пользовательского пути
    // к submit нет: событие отправляется напрямую, чтобы проверить защиту.
    it('should not call signIn when form is invalid', async () => {
      const { container } = await renderForm();

      fireEvent.submit(container.querySelector('form') as HTMLFormElement);

      expect(signInServiceMock.signIn).not.toHaveBeenCalled();
    });

    it('should not render a submit error in the form', async () => {
      const { container } = await renderForm();

      expect(container.querySelector('.sign-in-form__error')).toBeNull();
    });
  });

  describe('submit button availability', () => {
    it('should disable the submit button when the sign-in form is empty', async () => {
      await renderForm();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should not show field errors on an untouched form', async () => {
      await renderForm();

      expect(screen.queryByText(requiredFieldError)).not.toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should show a field error after the field loses focus while it stays empty', async () => {
      const user = userEvent.setup();
      await renderForm();

      await user.click(screen.getByLabelText('Login'));
      await user.tab();

      expect(screen.getByText(requiredFieldError)).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should enable the submit button once the form becomes valid', async () => {
      const user = userEvent.setup();
      await renderForm();

      await user.type(screen.getByLabelText('Login'), 'Mock');
      await user.type(screen.getByLabelText('Password'), 'secret');

      expect(getSubmitButton()).toBeEnabled();
    });
  });

  describe('valid submit', () => {
    it('should call signIn with form value when submitted form is valid', async () => {
      const user = userEvent.setup();
      await renderForm();

      const mockFormValue = {
        login: 'Mock',
        password: 'qfndjkjnk&(YY',
      };

      await user.type(screen.getByLabelText('Login'), mockFormValue.login);
      await user.type(screen.getByLabelText('Password'), mockFormValue.password);
      await user.click(getSubmitButton());

      expect(signInServiceMock.signIn).toHaveBeenCalledOnce();
      expect(signInServiceMock.signIn).toHaveBeenCalledWith(mockFormValue);
    });
  });

  describe('submitting state', () => {
    it('should disable submit button', async () => {
      const { fixture } = await renderForm();

      signInServiceMock.isSubmitting.set(true);
      await fixture.whenStable();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should disable all controls', async () => {
      const { fixture } = await renderForm();

      signInServiceMock.isSubmitting.set(true);
      await fixture.whenStable();

      expect(screen.getByLabelText('Login')).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();
    });
  });

  describe('success state', () => {
    it('should emit signInSucceeded when the service reports success, without a manual application tick', async () => {
      const { signInSucceeded } = await renderForm();

      signInServiceMock.succeeded$.next();

      expect(signInSucceeded).toHaveBeenCalledOnce();
    });
  });

  describe('flow lifetime', () => {
    let authGatewayMock: ReturnType<typeof IdentityMocks.authGateway>;

    let currentSessionServiceMock: {
      restoreCurrentSession: ReturnType<typeof vi.fn>;
    };

    const mockSignInValue: SignInInput = {
      login: 'Mock',
      password: 'secret',
    };

    const providers = () => [
      { provide: AUTH_GATEWAY, useValue: authGatewayMock },
      { provide: CurrentSessionService, useValue: currentSessionServiceMock },
      { provide: NOTIFIER, useValue: notifierMock },
    ];

    const fillAndSubmit = async (form: HTMLElement): Promise<void> => {
      const user = userEvent.setup();
      const formQueries = within(form);

      await user.type(formQueries.getByLabelText('Login'), mockSignInValue.login);
      await user.type(formQueries.getByLabelText('Password'), mockSignInValue.password);
      await user.click(formQueries.getByRole('button', { name: 'Log in' }));
    };

    beforeEach(() => {
      authGatewayMock = IdentityMocks.authGateway();
      currentSessionServiceMock = { restoreCurrentSession: vi.fn() };
    });

    // render настраивает TestBed и второй раз в одном тесте не вызывается:
    // повторное открытие формы идет через TestBed.createComponent.
    it('should keep the reopened form usable while the previous submit has not answered yet', async () => {
      authGatewayMock.signIn.mockReturnValue(new Subject());

      const { fixture: firstFixture, container } = await render(SignInForm, {
        providers: providers(),
      });
      await fillAndSubmit(container);
      await firstFixture.whenStable();

      firstFixture.destroy();

      const reopenedFixture = TestBed.createComponent(SignInForm);
      await reopenedFixture.whenStable();
      const reopenedForm = within(reopenedFixture.nativeElement);

      const user = userEvent.setup();
      await user.type(reopenedForm.getByLabelText('Login'), mockSignInValue.login);
      await user.type(reopenedForm.getByLabelText('Password'), mockSignInValue.password);

      expect(reopenedForm.getByRole('button', { name: 'Log in' })).toBeEnabled();
      expect(reopenedForm.getByLabelText('Login')).toBeEnabled();
      expect(reopenedForm.getByLabelText('Password')).toBeEnabled();
    });

    it('should not cancel the submit when the form is closed before the gateway answers', async () => {
      const signIn$ = new Subject<{ authenticated: true }>();
      authGatewayMock.signIn.mockReturnValue(signIn$);

      const { fixture, container } = await render(SignInForm, { providers: providers() });
      await fillAndSubmit(container);
      await fixture.whenStable();

      fixture.destroy();

      signIn$.error(new ApplicationError('Mock error'));

      expect(notifierMock.error).toHaveBeenCalledWith('Sign-in failed', 'Mock error');
    });
  });
});
