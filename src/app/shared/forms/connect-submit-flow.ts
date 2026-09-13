import { OutputEmitterRef, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';

import { lockFormWhileSubmitting } from './lock-form-while-submitting';

export interface SubmitFlow {
  isSubmitting: Signal<boolean>;
  succeeded$: Observable<void>;
}

export const connectSubmitFlow = (
  form: AbstractControl,
  flow: SubmitFlow,
  succeeded: OutputEmitterRef<void>,
): void => {
  lockFormWhileSubmitting(form, flow.isSubmitting);

  flow.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
    succeeded.emit();
  });
};
