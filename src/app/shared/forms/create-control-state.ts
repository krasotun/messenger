import { DestroyRef, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ValidationErrors } from '@angular/forms';

export interface ControlState {
  errors: ValidationErrors | null;
  touched: boolean;
  showMessage: boolean;
}

export const createControlState = (
  control: AbstractControl,
  destroyRef: DestroyRef,
): Signal<ControlState> => {
  const computeState = (): ControlState => {
    const { errors, touched } = control;

    return { errors, touched, showMessage: touched && !!errors };
  };

  const state = signal(computeState());

  control.events.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
    state.set(computeState());
  });

  return state.asReadonly();
};
