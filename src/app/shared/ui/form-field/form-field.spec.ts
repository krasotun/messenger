import { Component, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { form, FormField as FormFieldDirective, required } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { FormField } from './form-field';

@Component({
  imports: [FormField, FormFieldDirective],
  template: `
    <app-form-field [label]="'Login'" [field]="field">
      <input [formField]="field" type="text" />
    </app-form-field>
  `,
})
class TestHost {
  readonly field = form(signal(''), (path) => {
    required(path);
  });
}

const requiredFieldError = 'This field is required';

describe('FormField', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    ({ fixture } = await render(TestHost, { waitForStableOnRender: true }));
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the label text', () => {
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should not show a message on an untouched invalid field', () => {
    expect(screen.queryByText(requiredFieldError)).not.toBeInTheDocument();
  });

  it('should show the message resolved from the violation once the field is touched', async () => {
    fixture.componentInstance.field().markAsTouched();

    await fixture.whenStable();

    expect(screen.getByText(requiredFieldError)).toBeInTheDocument();
  });

  it('should hide the message once the violation is fixed', async () => {
    fixture.componentInstance.field().markAsTouched();
    await fixture.whenStable();

    fixture.componentInstance.field().value.set('a value');
    await fixture.whenStable();

    expect(screen.queryByText(requiredFieldError)).not.toBeInTheDocument();
  });

  it('should wrap the projected field inside the label so a click on it reaches the field', async () => {
    await userEvent.setup().click(screen.getByText('Login'));

    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('should announce the field by its label without a manual for/id pair', () => {
    const field = screen.getByLabelText('Login');

    expect(field).toBe(screen.getByRole('textbox'));
    expect(field).not.toHaveAttribute('id');
  });
});
