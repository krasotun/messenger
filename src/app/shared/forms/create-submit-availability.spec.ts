import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';

import {
  createSubmitAvailability,
  CreateSubmitAvailabilityOptions,
} from './create-submit-availability';

describe('createSubmitAvailability', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  const createAvailability = (
    control: FormControl<string>,
    options?: CreateSubmitAvailabilityOptions,
  ) => createSubmitAvailability(control, TestBed.inject(DestroyRef), options);

  describe('without requireChanges', () => {
    it('should be false while the form is invalid', () => {
      const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });

      const canSubmit = createAvailability(control);

      expect(canSubmit()).toBe(false);
    });

    it('should become true once the form becomes valid', () => {
      const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
      const canSubmit = createAvailability(control);

      control.setValue('a value');

      expect(canSubmit()).toBe(true);
    });

    it('should become false again once a valid value turns invalid', () => {
      const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
      const canSubmit = createAvailability(control);
      control.setValue('a value');

      control.setValue('');

      expect(canSubmit()).toBe(false);
    });
  });

  describe('with requireChanges', () => {
    it('should be false for a valid form that was not touched', () => {
      const control = new FormControl('a value', {
        nonNullable: true,
        validators: [Validators.required],
      });

      const canSubmit = createAvailability(control, { requireChanges: true });

      expect(canSubmit()).toBe(false);
    });

    it('should become true once the value changes and the form stays valid', () => {
      const control = new FormControl('a value', {
        nonNullable: true,
        validators: [Validators.required],
      });
      const canSubmit = createAvailability(control, { requireChanges: true });

      control.markAsDirty();
      control.setValue('another value');

      expect(canSubmit()).toBe(true);
    });

    it('should stay false when the field was focused and blurred without a value change', () => {
      const control = new FormControl('a value', {
        nonNullable: true,
        validators: [Validators.required],
      });
      const canSubmit = createAvailability(control, { requireChanges: true });

      control.markAsTouched();

      expect(canSubmit()).toBe(false);
    });

    it('should be true from the start when requireChanges is not requested', () => {
      const control = new FormControl('a value', {
        nonNullable: true,
        validators: [Validators.required],
      });

      const canSubmit = createAvailability(control);

      expect(canSubmit()).toBe(true);
    });
  });
});
