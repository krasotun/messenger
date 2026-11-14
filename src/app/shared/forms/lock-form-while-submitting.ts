import { Signal } from '@angular/core';
import { disabled, SchemaPath } from '@angular/forms/signals';

// Правило схемы, а не эффект: недоступность поля в signal forms выводится из
// состояния, императивных enable/disable у формы нет.
export const lockFormWhileSubmitting = <TValue>(
  path: SchemaPath<TValue>,
  isSubmitting: Signal<boolean>,
): void => {
  disabled(path, () => isSubmitting());
};
