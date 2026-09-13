import { signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';

export interface CreateSubmitAvailabilityOptions {
  requireChanges?: boolean;
}

export const createSubmitAvailability = (
  form: AbstractControl,
  options: CreateSubmitAvailabilityOptions = {},
): Signal<boolean> => {
  const { requireChanges = false } = options;

  const computeCanSubmit = () => form.valid && (!requireChanges || form.dirty);

  const canSubmit = signal(computeCanSubmit());

  form.events.pipe(takeUntilDestroyed()).subscribe(() => {
    canSubmit.set(computeCanSubmit());
  });

  return canSubmit.asReadonly();
};
