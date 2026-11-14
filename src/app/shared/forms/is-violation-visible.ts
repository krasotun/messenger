import { FieldState } from '@angular/forms/signals';

type ViolationState = Pick<FieldState<unknown>, 'touched' | 'errors'>;

// Нарушение показывается только после того, как человек побывал в поле.
export const isViolationVisible = (state: ViolationState): boolean =>
  state.touched() && state.errors().length > 0;
