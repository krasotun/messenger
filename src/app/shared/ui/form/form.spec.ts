import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { fireEvent, render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { Form } from './form';
import { FormTextField } from './form-text-field';

import { lockFormWhileSubmitting } from '@shared/forms';

@Component({
  imports: [Form, FormField],
  template: `
    <app-form
      [form]="form"
      [submitLabel]="'Submit'"
      [requireChanges]="requireChanges"
      [isSubmitting]="isSubmitting()"
      (submitted)="submitted()"
    >
      <input [formField]="form.name" type="text" />
    </app-form>
  `,
})
class TestHost {
  readonly requireChanges = false;
  readonly isSubmitting: WritableSignal<boolean> = signal(false);
  readonly submitted = vi.fn();

  readonly form = form(signal({ name: '' }), (path) => {
    required(path.name);
    lockFormWhileSubmitting(path, this.isSubmitting);
  });
}

@Component({
  imports: [Form, FormField],
  template: `
    <app-form
      [form]="form"
      [submitLabel]="'Save'"
      [requireChanges]="true"
      [isSubmitting]="false"
      (submitted)="submitted()"
    >
      <input [formField]="form.name" type="text" />
    </app-form>
  `,
})
class RequireChangesHost {
  readonly form = form(signal({ name: 'a value' }), (path) => {
    required(path.name);
  });
  readonly submitted = vi.fn();
}

@Component({
  imports: [Form],
  template: `<app-form [form]="form" [fields]="fields" [submitLabel]="'Submit'"></app-form>`,
})
class FieldsHost {
  readonly form = form(signal({ login: '', password: '' }), (path) => {
    required(path.login);
  });

  readonly fields: FormTextField[] = [
    { label: 'Login', type: 'text', field: this.form.login },
    { label: 'Password', type: 'password', field: this.form.password },
  ];
}

describe('Form', () => {
  let fixture: ComponentFixture<TestHost>;
  let container: HTMLElement;
  let host: TestHost;

  const getSubmitButton = (): HTMLElement => screen.getByRole('button', { name: 'Submit' });
  const getFieldInput = (): HTMLElement => screen.getByRole('textbox');

  beforeEach(async () => {
    ({ fixture, container } = await render(TestHost, { waitForStableOnRender: true }));
    host = fixture.componentInstance;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the submit label', () => {
    expect(getSubmitButton()).toBeInTheDocument();
  });

  it('should disable the submit button while the form is invalid', () => {
    expect(getSubmitButton()).toBeDisabled();
  });

  it('should enable the submit button once the form becomes valid', async () => {
    await userEvent.setup().type(getFieldInput(), 'a value');

    expect(getSubmitButton()).toBeEnabled();
  });

  it('should disable the submit button again once a valid value turns invalid', async () => {
    const user = userEvent.setup();

    await user.type(getFieldInput(), 'a value');
    await user.clear(getFieldInput());

    expect(getSubmitButton()).toBeDisabled();
  });

  it('should reach the caller when a valid form is submitted', async () => {
    const user = userEvent.setup();

    await user.type(getFieldInput(), 'a value');
    await user.click(getSubmitButton());

    expect(host.submitted).toHaveBeenCalledOnce();
  });

  // Кнопка у невалидной формы выключена: событие отправки идет напрямую.
  it('should not reach the caller when an invalid form is submitted', () => {
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect(host.submitted).not.toHaveBeenCalled();
  });

  it('should disable the submit button while submitting', async () => {
    await userEvent.setup().type(getFieldInput(), 'a value');

    host.isSubmitting.set(true);
    await fixture.whenStable();

    expect(getSubmitButton()).toBeDisabled();
  });

  it('should disable projected fields while submitting', async () => {
    host.isSubmitting.set(true);
    await fixture.whenStable();

    expect(getFieldInput()).toBeDisabled();
  });

  it('should enable projected fields again once submitting ends', async () => {
    host.isSubmitting.set(true);
    await fixture.whenStable();

    host.isSubmitting.set(false);
    await fixture.whenStable();

    expect(getFieldInput()).toBeEnabled();
  });
});

describe('Form with requireChanges', () => {
  const getSubmitButton = (): HTMLElement => screen.getByRole('button', { name: 'Save' });

  beforeEach(async () => {
    await render(RequireChangesHost, { waitForStableOnRender: true });
  });

  it('should disable the submit button for an untouched valid form', () => {
    expect(getSubmitButton()).toBeDisabled();
  });

  it('should enable the submit button once the value changes', async () => {
    const user = userEvent.setup();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'another value');

    expect(getSubmitButton()).toBeEnabled();
  });

  it('should keep the submit button disabled when the field was focused and blurred without a value change', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole('textbox'));
    await user.tab();

    expect(getSubmitButton()).toBeDisabled();
  });
});

describe('Form with fields', () => {
  beforeEach(async () => {
    await render(FieldsHost, { waitForStableOnRender: true });
  });

  it('should render a labelled field of the given type for every entry', () => {
    expect(screen.getByLabelText('Login')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('should show the violation message under a field once it was visited', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Login'));
    await user.tab();

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Login')).toBeInvalid();
  });
});
