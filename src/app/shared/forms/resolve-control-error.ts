import { ValidationErrors } from '@angular/forms';

const ERROR_MESSAGES: Record<string, string> = {
  required: 'This field is required',
  minlength: 'Value is too short',
  maxlength: 'Value is too long',
  pattern: 'Value has an invalid format',
  mismatch: 'Values do not match',
};

const DEFAULT_ERROR_MESSAGE = 'Value is invalid';

export const resolveControlError = (errors: ValidationErrors | null): string | undefined => {
  if (!errors) {
    return undefined;
  }

  const [errorKey] = Object.keys(errors);

  return ERROR_MESSAGES[errorKey] ?? DEFAULT_ERROR_MESSAGE;
};
