import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';

import { createControlState } from './create-control-state';

describe('createControlState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  const createState = (control: FormControl<string>) =>
    createControlState(control, TestBed.inject(DestroyRef));

  it('should report no errors and no message for a valid untouched control', () => {
    const control = new FormControl('a value', {
      nonNullable: true,
      validators: [Validators.required],
    });

    const state = createState(control);

    expect(state().errors).toBeNull();
    expect(state().touched).toBe(false);
    expect(state().showMessage).toBe(false);
  });

  it('should not show a message for an invalid control that was not touched', () => {
    const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });

    const state = createState(control);

    expect(state().errors).toEqual({ required: true });
    expect(state().showMessage).toBe(false);
  });

  it('should show a message once an invalid control is touched', () => {
    const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
    const state = createState(control);

    control.markAsTouched();

    expect(state().touched).toBe(true);
    expect(state().showMessage).toBe(true);
  });

  it('should update after the control value changes', () => {
    const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
    const state = createState(control);
    control.markAsTouched();

    control.setValue('a value');

    expect(state().errors).toBeNull();
    expect(state().showMessage).toBe(false);
  });

  it('should update after the control status changes', () => {
    const control = new FormControl('a value', {
      nonNullable: true,
      validators: [Validators.required],
    });
    const state = createState(control);
    control.markAsTouched();

    control.setErrors({ mismatch: true });

    expect(state().errors).toEqual({ mismatch: true });
    expect(state().showMessage).toBe(true);
  });

  it('should update without a manual change detection call', () => {
    const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
    const state = createState(control);

    control.markAsTouched();
    control.setValue('a value');

    expect(state().showMessage).toBe(false);
  });
});
