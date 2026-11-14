import { Component, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { TextField } from './text-field';

@Component({
  imports: [TextField],
  template: `<app-text-field label="Password" type="password" [field]="field"></app-text-field>`,
})
class TestHost {
  readonly value = signal('');

  readonly field = form(this.value, (path) => {
    required(path);
  });
}

describe('TextField', () => {
  const getField = (): HTMLElement => screen.getByLabelText('Password');

  const renderHost = async (): Promise<TestHost> => {
    const { fixture } = await render(TestHost, { waitForStableOnRender: true });

    return fixture.componentInstance;
  };

  it('should render a labelled field of the given type', async () => {
    await renderHost();

    expect(getField()).toHaveAttribute('type', 'password');
  });

  it('should write the entered text into the field value', async () => {
    const host = await renderHost();

    await userEvent.setup().type(getField(), 'secret');

    expect(host.value()).toBe('secret');
  });

  it('should show the violation message and mark the field as invalid once it was visited', async () => {
    const user = userEvent.setup();
    await renderHost();

    await user.click(getField());
    await user.tab();

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(getField()).toBeInvalid();
  });
});
