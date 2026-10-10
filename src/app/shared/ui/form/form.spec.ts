import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { Form } from './form';

import { lockFormWhileSubmitting } from '@shared/forms';

interface TestFormModel {
  name: FormControl<string>;
}

@Component({
  imports: [Form, ReactiveFormsModule],
  template: `
    <app-form
      [group]="group"
      [submitLabel]="'Submit'"
      [requireChanges]="requireChanges"
      [isSubmitting]="isSubmitting()"
      (submitted)="submitted()"
    >
      <input [formControl]="group.controls.name" type="text" />
    </app-form>
  `,
})
class TestHost {
  readonly group = new FormGroup<TestFormModel>({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly requireChanges = false;
  readonly isSubmitting: WritableSignal<boolean> = signal(false);
  readonly submitted = vi.fn();

  constructor() {
    lockFormWhileSubmitting(this.group, this.isSubmitting);
  }
}

@Component({
  imports: [Form, ReactiveFormsModule],
  template: `
    <app-form
      [group]="group"
      [submitLabel]="'Save'"
      [requireChanges]="true"
      [isSubmitting]="false"
      (submitted)="submitted()"
    >
      <input [formControl]="group.controls.name" type="text" />
    </app-form>
  `,
})
class RequireChangesHost {
  readonly group = new FormGroup<TestFormModel>({
    name: new FormControl('a value', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly submitted = vi.fn();
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
});
