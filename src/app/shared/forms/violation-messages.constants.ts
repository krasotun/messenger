import {
  MaxLengthValidationError,
  MinLengthValidationError,
  PatternValidationError,
  RequiredValidationError,
} from '@angular/forms/signals';

export const MISMATCH_VIOLATION_KIND = 'mismatch';

// Ключи взяты из типов ошибок Angular: переименуют вид нарушения - сломается
// сборка, а не молча пропадет текст.
type KnownViolationKind =
  | RequiredValidationError['kind']
  | MinLengthValidationError['kind']
  | MaxLengthValidationError['kind']
  | PatternValidationError['kind']
  | typeof MISMATCH_VIOLATION_KIND;

export const VIOLATION_MESSAGES: Record<KnownViolationKind, string> = {
  required: 'This field is required',
  minLength: 'Value is too short',
  maxLength: 'Value is too long',
  pattern: 'Value has an invalid format',
  [MISMATCH_VIOLATION_KIND]: 'Values do not match',
};

export const UNKNOWN_VIOLATION_MESSAGE = 'Value is invalid';
