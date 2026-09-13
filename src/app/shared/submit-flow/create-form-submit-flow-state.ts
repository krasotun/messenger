import { signal } from '@angular/core';
import { Subject } from 'rxjs';

export const createFormSubmitFlowState = () => {
  const isSubmitting = signal(false);
  const succeeded = new Subject<void>();

  const startSubmitting = () => {
    isSubmitting.set(true);
  };

  const markSuccess = () => {
    isSubmitting.set(false);
    succeeded.next();
  };

  const markError = () => {
    isSubmitting.set(false);
  };

  return {
    isSubmitting: isSubmitting.asReadonly(),
    succeeded$: succeeded.asObservable(),
    startSubmitting,
    markSuccess,
    markError,
  };
};
