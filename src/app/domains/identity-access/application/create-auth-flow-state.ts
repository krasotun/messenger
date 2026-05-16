import { computed, signal } from '@angular/core';

import { AuthFlowStatus } from './auth-flow-status';

import { Nullable } from '@app/shared/types';

export const createAuthFlowState = () => {
  const status = signal<AuthFlowStatus>(AuthFlowStatus.Idle);
  const errorMessage = signal<Nullable<string>>(null);

  const isSubmitting = computed(() => {
    return status() === AuthFlowStatus.Submitting;
  });

  const startSubmitting = () => {
    errorMessage.set(null);
    status.set(AuthFlowStatus.Submitting);
  };

  const markSuccess = () => {
    errorMessage.set(null);
    status.set(AuthFlowStatus.Success);
  };

  const markError = (message: string) => {
    status.set(AuthFlowStatus.Error);

    errorMessage.set(message);
  };

  const reset = () => {
    status.set(AuthFlowStatus.Idle);
    errorMessage.set(null);
  };

  return {
    status: status.asReadonly(),
    errorMessage: errorMessage.asReadonly(),
    isSubmitting,
    startSubmitting,
    markSuccess,
    markError,
    reset,
  };
};
