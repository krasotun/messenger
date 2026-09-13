import { ValidationErrors } from '@angular/forms';

import { CONTROL_ERROR_MESSAGES } from './control-error-messages.constants';

const messagesByErrorKey: Record<string, string | undefined> = CONTROL_ERROR_MESSAGES;

export const resolveControlError = (errors: ValidationErrors | null): string | undefined => {
  if (!errors) {
    return undefined;
  }

  const [errorKey] = Object.keys(errors);

  return messagesByErrorKey[errorKey] ?? CONTROL_ERROR_MESSAGES.default;
};
