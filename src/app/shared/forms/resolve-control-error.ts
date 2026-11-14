import { ValidationError } from '@angular/forms/signals';

import { CONTROL_ERROR_MESSAGES } from './control-error-messages.constants';

const messagesByErrorKind: Record<string, string | undefined> = CONTROL_ERROR_MESSAGES;

export const resolveControlError = (errors: readonly ValidationError[]): string | undefined => {
  const [firstError] = errors;

  if (!firstError) {
    return undefined;
  }

  return messagesByErrorKind[firstError.kind] ?? CONTROL_ERROR_MESSAGES.default;
};
