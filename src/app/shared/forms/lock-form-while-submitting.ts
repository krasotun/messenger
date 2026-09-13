import { effect, Signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

export const lockFormWhileSubmitting = (
  form: AbstractControl,
  isSubmitting: Signal<boolean>,
): void => {
  effect(() => {
    if (isSubmitting()) {
      form.disable({ emitEvent: false });
    } else {
      form.enable({ emitEvent: false });
    }
  });
};
