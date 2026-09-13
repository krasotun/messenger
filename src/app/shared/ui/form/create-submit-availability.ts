import { DestroyRef, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';

export interface CreateSubmitAvailabilityOptions {
  requireChanges?: boolean;
}

export const createSubmitAvailability = (
  form: AbstractControl,
  destroyRef: DestroyRef,
  options: CreateSubmitAvailabilityOptions = {},
): Signal<boolean> => {
  const { requireChanges = false } = options;

  const computeCanSubmit = () => form.valid && (!requireChanges || form.dirty);

  const canSubmit = signal(computeCanSubmit());

  form.events.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
    canSubmit.set(computeCanSubmit());
  });

  return canSubmit.asReadonly();
};
