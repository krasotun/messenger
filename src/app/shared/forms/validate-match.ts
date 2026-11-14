import { SchemaPath, validate } from '@angular/forms/signals';

import { MISMATCH_VIOLATION_KIND } from './violation-messages.constants';

// Нарушение сообщается под полем повтора, а не под исходным: править нужно его.
export const validateMatch = <TValue>(
  repeatPath: SchemaPath<TValue>,
  sourcePath: SchemaPath<TValue>,
): void => {
  validate(repeatPath, ({ value, valueOf }) =>
    value() === valueOf(sourcePath) ? null : { kind: MISMATCH_VIOLATION_KIND },
  );
};
