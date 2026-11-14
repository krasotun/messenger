import { OutputEmitterRef, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export interface SubmitFlow {
  isSubmitting: Signal<boolean>;
  succeeded$: Observable<void>;
}

export const connectSubmitFlow = (flow: SubmitFlow, succeeded: OutputEmitterRef<void>): void => {
  flow.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
    succeeded.emit();
  });
};
