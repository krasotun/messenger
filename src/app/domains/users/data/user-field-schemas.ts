import {
  maxLengthError,
  minLength,
  pattern,
  required,
  schema,
  validate,
} from '@angular/forms/signals';

const emailPattern = /^\S+@\S+$/;
const phonePattern = /^\+?\d+$/;
const phoneMaxLength = 15;

export const emailSchema = schema<string>((path) => {
  required(path);
  pattern(path, emailPattern);
});

export const phoneSchema = schema<string>((path) => {
  required(path);
  pattern(path, phonePattern);
  minLength(path, 10);
  // Не `maxLength()`: оно ставит на input нативный `maxlength`, браузер молча
  // обрезает ввод, и человек не видит сообщения о слишком длинном значении.
  validate(path, ({ value }) =>
    value().length > phoneMaxLength ? maxLengthError(phoneMaxLength) : null,
  );
});
