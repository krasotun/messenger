import { ValidationError } from '@angular/forms/signals';

import { UNKNOWN_VIOLATION_MESSAGE, VIOLATION_MESSAGES } from './violation-messages.constants';

const messagesByViolationKind: Record<string, string | undefined> = VIOLATION_MESSAGES;

export const resolveViolationMessage = (
  violations: readonly ValidationError[],
): string | undefined => {
  const [firstViolation] = violations;

  if (!firstViolation) {
    return undefined;
  }

  return messagesByViolationKind[firstViolation.kind] ?? UNKNOWN_VIOLATION_MESSAGE;
};
