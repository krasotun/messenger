import { Component, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular/zoneless';

import { Input } from './input';

@Component({
  imports: [Input, FormField],
  template: ` <input appInput [formField]="field" type="text" /> `,
})
class TestHost {
  readonly field = form(signal(''), (path) => {
    required(path);
  });
}

@Component({
  imports: [Input],
  template: ` <input appInput type="text" /> `,
})
class PlainTestHost {}

describe('Input', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    ({ fixture } = await render(TestHost, { waitForStableOnRender: true }));
  });

  it('should not mark an untouched invalid control as invalid', () => {
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('should mark a touched invalid control as invalid', async () => {
    fixture.componentInstance.field().markAsTouched();

    await fixture.whenStable();

    expect(screen.getByRole('textbox')).toBeInvalid();
  });

  it('should clear the invalid state once the value is fixed', async () => {
    fixture.componentInstance.field().markAsTouched();
    await fixture.whenStable();

    fixture.componentInstance.field().value.set('a value');
    await fixture.whenStable();

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });
});

describe('Input without a control', () => {
  it('should not mark the field as invalid', async () => {
    await render(PlainTestHost, { waitForStableOnRender: true });

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });
});
