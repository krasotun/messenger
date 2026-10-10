import { outputBinding } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';

import { UpdateProfileInput } from '../../application/update-profile/update-profile-input.type';
import { UpdateProfileService } from '../../application/update-profile/update-profile.service';

import { UpdateProfileForm } from './update-profile-form';

import { IdentityMocks } from '@domains/identity-access/testing';

const initialValuesMock = IdentityMocks.updateProfileInput();

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
  let updateProfileServiceMock: ReturnType<typeof IdentityMocks.updateProfileService>;
  let user: UserEvent;

  const renderForm = async () => {
    const profileUpdated = vi.fn();

    const result = await render(UpdateProfileForm, {
      bindings: [outputBinding('profileUpdated', profileUpdated)],
      providers: [{ provide: UpdateProfileService, useValue: updateProfileServiceMock }],
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

  beforeEach(() => {
    user = userEvent.setup();
    updateProfileServiceMock = IdentityMocks.updateProfileService(initialValuesMock);
  });

  it('should create', async () => {
    const { fixture } = await renderForm();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('prefilled form', () => {
    it('should prefill form with initial values of the current user', async () => {
      await renderForm();

      for (const field of Object.keys(fieldLabels) as (keyof UpdateProfileInput)[]) {
        expect(getField(field)).toHaveValue(initialValuesMock[field]);
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

      expect(updateProfileServiceMock.updateProfile).not.toHaveBeenCalled();
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
      await renderForm();

      await replaceValue('firstName', 'changed');
      await user.click(getSubmitButton());

      expect(updateProfileServiceMock.updateProfile).toHaveBeenCalledOnce();
      expect(updateProfileServiceMock.updateProfile).toHaveBeenCalledWith({
        ...initialValuesMock,
        firstName: 'changed',
      });
    });
  });

  describe('submitting state', () => {
    it('should disable submit button', async () => {
      const { fixture } = await renderForm();

      updateProfileServiceMock.isSubmitting.set(true);
      await fixture.whenStable();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should disable all controls', async () => {
      const { fixture } = await renderForm();

      updateProfileServiceMock.isSubmitting.set(true);
      await fixture.whenStable();

      for (const field of Object.keys(fieldLabels) as (keyof UpdateProfileInput)[]) {
        expect(getField(field)).toBeDisabled();
      }
    });

    it('should not treat the lock while submitting as a form change', async () => {
      const { fixture } = await renderForm();

      updateProfileServiceMock.isSubmitting.set(true);
      await fixture.whenStable();
      updateProfileServiceMock.isSubmitting.set(false);
      await fixture.whenStable();

      expect(getSubmitButton()).toBeDisabled();
    });
  });

  describe('error state', () => {
    it('should not render a submit error in the form', async () => {
      const { container } = await renderForm();

      expect(container.querySelector('.update-profile-form__error')).toBeNull();
    });
  });

  describe('success state', () => {
    it('should emit profileUpdated when the service reports success, without a manual application tick', async () => {
      const { profileUpdated } = await renderForm();

      updateProfileServiceMock.succeeded$.next();

      expect(profileUpdated).toHaveBeenCalledOnce();
    });
  });
});
