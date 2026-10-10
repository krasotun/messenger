import { outputBinding } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';

import { ChangePasswordService } from '../../application/change-password/change-password.service';

import { ChangePasswordForm } from './change-password-form';

import { IdentityMocks } from '@domains/identity-access/testing';

const requiredFieldError = 'This field is required';
const mismatchError = 'Values do not match';

describe('ChangePasswordForm', () => {
  let changePasswordServiceMock: ReturnType<typeof IdentityMocks.changePasswordService>;
  let user: UserEvent;

  const renderForm = async () => {
    const passwordChanged = vi.fn();

    const result = await render(ChangePasswordForm, {
      bindings: [outputBinding('passwordChanged', passwordChanged)],
      providers: [{ provide: ChangePasswordService, useValue: changePasswordServiceMock }],
      waitForStableOnRender: true,
    });

    return { ...result, passwordChanged };
  };

  const getOldPasswordField = (): HTMLElement => screen.getByLabelText('Old password');
  const getNewPasswordField = (): HTMLElement => screen.getByLabelText('New password');
  const getRepeatField = (): HTMLElement => screen.getByLabelText('Repeat new password');
  const getSubmitButton = (): HTMLElement => screen.getByRole('button', { name: 'Save' });

  const fillForm = async (oldPassword: string, newPassword: string, repeatNewPassword: string) => {
    await user.type(getOldPasswordField(), oldPassword);
    await user.type(getNewPasswordField(), newPassword);
    await user.type(getRepeatField(), repeatNewPassword);
  };

  const getRepeatFieldError = (): HTMLElement | null =>
    screen.queryByText(mismatchError)?.closest('.change-password-form__repeat-field') ?? null;

  beforeEach(() => {
    user = userEvent.setup();
    changePasswordServiceMock = IdentityMocks.changePasswordService();
  });

  it('should create', async () => {
    const { fixture } = await renderForm();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('opened form', () => {
    it('should show three empty fields', async () => {
      await renderForm();

      expect(getOldPasswordField()).toHaveValue('');
      expect(getNewPasswordField()).toHaveValue('');
      expect(getRepeatField()).toHaveValue('');
    });
  });

  describe('submit with empty fields', () => {
    // Кнопка выключена, пользовательского пути к submit нет: проверяем защиту.
    it('should not call changePassword', async () => {
      const { container } = await renderForm();

      fireEvent.submit(container.querySelector('form') as HTMLFormElement);

      expect(changePasswordServiceMock.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('repeat does not match the new password', () => {
    it('should not call changePassword', async () => {
      const { container } = await renderForm();

      await fillForm('oldPassword', 'newPassword', 'otherPassword');

      fireEvent.submit(container.querySelector('form') as HTMLFormElement);

      expect(changePasswordServiceMock.changePassword).not.toHaveBeenCalled();
    });

    it('should disable the submit button after the repeat field loses focus', async () => {
      await renderForm();

      await fillForm('oldPassword', 'newPassword', 'otherPassword');
      await user.tab();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should show a mismatch message under the repeat field', async () => {
      await renderForm();

      await fillForm('oldPassword', 'newPassword', 'otherPassword');
      await user.tab();

      expect(getRepeatFieldError()).not.toBeNull();
    });

    it('should hide the mismatch message once the repeat field is edited to match', async () => {
      await renderForm();

      await fillForm('oldPassword', 'newPassword', 'otherPassword');
      await user.tab();

      await user.clear(getRepeatField());
      await user.type(getRepeatField(), 'newPassword');

      expect(screen.queryByText(mismatchError)).not.toBeInTheDocument();
    });

    it('should hide the mismatch message once the new password field is edited to match', async () => {
      await renderForm();

      await fillForm('oldPassword', 'newPassword', 'otherPassword');
      await user.tab();

      await user.clear(getNewPasswordField());
      await user.type(getNewPasswordField(), 'otherPassword');

      expect(screen.queryByText(mismatchError)).not.toBeInTheDocument();
    });
  });

  describe('submit button availability', () => {
    it('should disable the submit button when fields are empty', async () => {
      await renderForm();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should not show field errors on an untouched form', async () => {
      await renderForm();

      expect(screen.queryByText(requiredFieldError)).not.toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should show a field error after the field loses focus while it stays empty', async () => {
      await renderForm();

      await user.click(getOldPasswordField());
      await user.tab();

      expect(screen.getByText(requiredFieldError)).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should enable the submit button once the form becomes valid', async () => {
      await renderForm();

      await fillForm('oldPassword', 'newPassword', 'newPassword');

      expect(getSubmitButton()).toBeEnabled();
    });
  });

  describe('valid submit', () => {
    it('should call changePassword with the old and the new password only', async () => {
      await renderForm();

      await fillForm('oldPassword', 'newPassword', 'newPassword');
      await user.click(getSubmitButton());

      expect(changePasswordServiceMock.changePassword).toHaveBeenCalledOnce();
      expect(changePasswordServiceMock.changePassword).toHaveBeenCalledWith({
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      });
    });
  });

  describe('submitting state', () => {
    it('should disable submit button', async () => {
      const { fixture } = await renderForm();

      changePasswordServiceMock.isSubmitting.set(true);
      await fixture.whenStable();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should disable all controls', async () => {
      const { fixture } = await renderForm();

      changePasswordServiceMock.isSubmitting.set(true);
      await fixture.whenStable();

      expect(getOldPasswordField()).toBeDisabled();
      expect(getNewPasswordField()).toBeDisabled();
      expect(getRepeatField()).toBeDisabled();
    });
  });

  describe('error state', () => {
    it('should not render a submit error in the form', async () => {
      const { container } = await renderForm();

      expect(container.querySelector('.change-password-form__error')).toBeNull();
    });
  });

  describe('success state', () => {
    it('should emit passwordChanged when the service reports success, without a manual application tick', async () => {
      const { passwordChanged } = await renderForm();

      changePasswordServiceMock.succeeded$.next();

      expect(passwordChanged).toHaveBeenCalledOnce();
    });
  });
});
