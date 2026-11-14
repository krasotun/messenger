import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldTree, form } from '@angular/forms/signals';

import { lockFormWhileSubmitting } from './lock-form-while-submitting';

describe('lockFormWhileSubmitting', () => {
  let isSubmitting: WritableSignal<boolean>;
  let field: FieldTree<string>;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    isSubmitting = signal(false);
    field = TestBed.runInInjectionContext(() =>
      form(signal('a value'), (path) => {
        lockFormWhileSubmitting(path, isSubmitting);
      }),
    );
  });

  it('should disable the form while submitting', () => {
    isSubmitting.set(true);

    expect(field().disabled()).toBe(true);
  });

  it('should enable the form again once submitting succeeds', () => {
    isSubmitting.set(true);

    isSubmitting.set(false);

    expect(field().disabled()).toBe(false);
  });

  it('should enable the form again once submitting fails, keeping the entered value', () => {
    isSubmitting.set(true);

    isSubmitting.set(false);

    expect(field().disabled()).toBe(false);
    expect(field().value()).toBe('a value');
  });

  it('should not mark the form as changed when locking and unlocking it', () => {
    const dirtyBefore = field().dirty();

    isSubmitting.set(true);
    isSubmitting.set(false);

    expect(field().dirty()).toBe(dirtyBefore);
  });
});
