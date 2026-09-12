import { computed, signal } from '@angular/core';

import { AuthFlowStatus } from './auth-flow-status.type';

export const createAuthFlowState = () => {
  const status = signal<AuthFlowStatus>(AuthFlowStatus.Idle);

  const isSubmitting = computed(() => {
    return status() === AuthFlowStatus.Submitting;
  });

  const startSubmitting = () => {
    status.set(AuthFlowStatus.Submitting);
  };

  const markSuccess = () => {
    status.set(AuthFlowStatus.Success);
  };

  const markError = () => {
    status.set(AuthFlowStatus.Error);
  };

  const reset = () => {
    status.set(AuthFlowStatus.Idle);
  };

  return {
    status: status.asReadonly(),
    isSubmitting,
    startSubmitting,
    markSuccess,
    markError,
    reset,
  };
};
