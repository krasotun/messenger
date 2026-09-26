import { signal } from '@angular/core';

import { createActionFlowState } from '@shared/submit-flow/create-action-flow-state';

export const createFormSubmitFlowState = () => {
  const actionFlowState = createActionFlowState();

  const isSubmitting = signal(false);

  const startSubmitting = () => {
    isSubmitting.set(true);
  };

  const markSuccess = () => {
    isSubmitting.set(false);
    actionFlowState.markSuccess();
  };

  const markError = () => {
    isSubmitting.set(false);
  };

  return {
    isSubmitting: isSubmitting.asReadonly(),
    succeeded$: actionFlowState.succeeded$,
    startSubmitting,
    markSuccess,
    markError,
  };
};
