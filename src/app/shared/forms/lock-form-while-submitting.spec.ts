import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { lockFormWhileSubmitting } from './lock-form-while-submitting';

describe('lockFormWhileSubmitting', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should disable the form while submitting', () => {
    const control = new FormControl('a value', { nonNullable: true });
    const isSubmitting = signal(false);
    TestBed.runInInjectionContext(() => lockFormWhileSubmitting(control, isSubmitting));
    TestBed.tick();

    isSubmitting.set(true);
    TestBed.tick();

    expect(control.disabled).toBe(true);
  });

  it('should enable the form again once submitting succeeds', () => {
    const control = new FormControl('a value', { nonNullable: true });
    const isSubmitting = signal(false);
    TestBed.runInInjectionContext(() => lockFormWhileSubmitting(control, isSubmitting));
    TestBed.tick();
    isSubmitting.set(true);
    TestBed.tick();

    isSubmitting.set(false);
    TestBed.tick();

    expect(control.disabled).toBe(false);
  });

  it('should enable the form again once submitting fails, keeping the entered value', () => {
    const control = new FormControl('a value', { nonNullable: true });
    const isSubmitting = signal(false);
    TestBed.runInInjectionContext(() => lockFormWhileSubmitting(control, isSubmitting));
    TestBed.tick();
    isSubmitting.set(true);
    TestBed.tick();

    isSubmitting.set(false);
    TestBed.tick();

    expect(control.disabled).toBe(false);
    expect(control.value).toBe('a value');
  });

  it('should not mark the form as changed when locking and unlocking it', () => {
    const control = new FormControl('a value', { nonNullable: true });
    const isSubmitting = signal(false);
    TestBed.runInInjectionContext(() => lockFormWhileSubmitting(control, isSubmitting));
    TestBed.tick();
    const dirtyBefore = control.dirty;

    isSubmitting.set(true);
    TestBed.tick();
    isSubmitting.set(false);
    TestBed.tick();

    expect(control.dirty).toBe(dirtyBefore);
  });
});
