import { Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular/zoneless';

import { Input } from './input';

@Component({
  imports: [Input, ReactiveFormsModule],
  template: ` <input appInput [formControl]="control" type="text" /> `,
})
class TestHost {
  readonly control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
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
    fixture.componentInstance.control.markAsTouched();

    await fixture.whenStable();

    expect(screen.getByRole('textbox')).toBeInvalid();
  });

  it('should clear the invalid state once the value is fixed', async () => {
    fixture.componentInstance.control.markAsTouched();
    await fixture.whenStable();

    fixture.componentInstance.control.setValue('a value');
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
