import { inputBinding, outputBinding } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { of, Subject } from 'rxjs';

import { AUTH_GATEWAY } from '../../data/auth-gateway';
import { CurrentSessionStore } from '../../data/current-session-store';
import { UpdateProfileInput, UpdateProfileResult, USER_GATEWAY } from '../../data/user-gateway';

import { UpdateProfileForm } from './update-profile-form';

import { UserMocks } from '@domains/users/testing';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const profileMock = UserMocks.updateProfileInput();

const fieldLabels: Record<keyof UpdateProfileInput, string> = {
  firstName: 'First name',
  secondName: 'Second name',
  displayName: 'Display name',
  login: 'Login',
  email: 'Email',
  phone: 'Mobile phone',
};

const invalidFormatError = 'Value has an invalid format';

describe('UpdateProfileForm', () => {
  let userGatewayMock: ReturnType<typeof UserMocks.userGateway>;
  let authGatewayMock: ReturnType<typeof UserMocks.authGateway>;
  let user: UserEvent;

  // Сохранение профиля обновляет Текущего пользователя, поэтому сессия
  // восстанавливается: иначе Стор откажется ее менять.
  const renderForm = async (profile: UpdateProfileInput = profileMock) => {
    const profileUpdated = vi.fn();

    const result = await render(UpdateProfileForm, {
      bindings: [
        inputBinding('profile', () => profile),
        outputBinding('profileUpdated', profileUpdated),
      ],
      providers: [
        { provide: AUTH_GATEWAY, useValue: authGatewayMock },
        { provide: USER_GATEWAY, useValue: userGatewayMock },
        { provide: NOTIFIER, useValue: NotificationMocks.notifier() },
      ],
      configureTestBed: (testBed) => {
        testBed.inject(CurrentSessionStore).restoreCurrentSession().subscribe();
      },
      waitForStableOnRender: true,
    });

    return { ...result, profileUpdated };
  };

  const getField = (field: keyof UpdateProfileInput): HTMLElement =>
    screen.getByLabelText(fieldLabels[field]);

  const getSubmitButton = (): HTMLElement => screen.getByRole('button', { name: 'Save' });

  const replaceValue = async (field: keyof UpdateProfileInput, value: string): Promise<void> => {
    await user.clear(getField(field));
    await user.type(getField(field), value);
  };

  const submitChangedForm = async (): Promise<void> => {
    await replaceValue('firstName', 'changed');
    await user.click(getSubmitButton());
  };

  beforeEach(() => {
    user = userEvent.setup();
    userGatewayMock = UserMocks.userGateway();
    authGatewayMock = UserMocks.authGateway();
    authGatewayMock.currentSession.mockReturnValue(of(UserMocks.authenticatedSession()));
  });

  it('should create', async () => {
    const { fixture } = await renderForm();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('prefilled form', () => {
    it('should prefill the form with the profile input', async () => {
      await renderForm();

      for (const field of Object.keys(fieldLabels) as (keyof UpdateProfileInput)[]) {
        expect(getField(field)).toHaveValue(profileMock[field]);
      }
    });
  });

  describe('submit availability', () => {
    it('should disable the submit button until the form is changed', async () => {
      await renderForm();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should not show field errors on an untouched prefilled form', async () => {
      await renderForm();

      expect(screen.queryByText(invalidFormatError)).not.toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should enable the submit button once a field changes and the form stays valid', async () => {
      await renderForm();

      await replaceValue('firstName', 'changed');

      expect(getSubmitButton()).toBeEnabled();
    });
  });

  describe('invalid submit', () => {
    // Кнопка выключена, пользовательского пути к submit нет: проверяем защиту.
    it('should not call updateProfile when form is invalid', async () => {
      const { container } = await renderForm();

      await replaceValue('email', 'not-an-email');

      fireEvent.submit(container.querySelector('form') as HTMLFormElement);

      expect(userGatewayMock.updateProfile).not.toHaveBeenCalled();
    });

    it('should disable the submit button when a changed field becomes invalid', async () => {
      await renderForm();

      await replaceValue('email', 'not-an-email');

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should show a field error after the field loses focus while it stays invalid', async () => {
      await renderForm();

      await replaceValue('email', 'not-an-email');
      await user.tab();

      expect(screen.getByText(invalidFormatError)).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });
  });

  describe('valid submit', () => {
    it('should call updateProfile with form value when a changed valid form is submitted', async () => {
      userGatewayMock.updateProfile.mockReturnValue(new Subject<UpdateProfileResult>());
      await renderForm();

      await submitChangedForm();

      expect(userGatewayMock.updateProfile).toHaveBeenCalledOnce();
      expect(userGatewayMock.updateProfile).toHaveBeenCalledWith({
        ...profileMock,
        firstName: 'changed',
      });
    });
  });

  describe('submitting state', () => {
    beforeEach(() => {
      userGatewayMock.updateProfile.mockReturnValue(new Subject<UpdateProfileResult>());
    });

    it('should disable submit button', async () => {
      await renderForm();

      await submitChangedForm();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should disable all controls', async () => {
      await renderForm();

      await submitChangedForm();

      for (const field of Object.keys(fieldLabels) as (keyof UpdateProfileInput)[]) {
        expect(getField(field)).toBeDisabled();
      }
    });
  });

  describe('error state', () => {
    it('should not render a submit error in the form', async () => {
      const { container } = await renderForm();

      expect(container.querySelector('.update-profile-form__error')).toBeNull();
    });
  });

  describe('success state', () => {
    it('should emit profileUpdated when the store reports success, without a manual application tick', async () => {
      userGatewayMock.updateProfile.mockReturnValue(
        of({ user: UserMocks.currentUser({ firstName: 'changed' }) }),
      );
      const { profileUpdated } = await renderForm();

      await submitChangedForm();

      expect(profileUpdated).toHaveBeenCalledOnce();
    });
  });
});
