import {
  maxLengthError,
  minLength,
  pattern,
  required,
  schema,
  validate,
} from '@angular/forms/signals';

import { SignUpInput } from '../data/auth-gateway';
import {
  emailPattern,
  phoneMaxLength,
  phoneMinLength,
  phonePattern,
} from '../data/user-field-patterns';

// Поля Пользователя, общие для регистрации и редактирования Профиля.
export type UserFields = Pick<
  SignUpInput,
  'firstName' | 'secondName' | 'login' | 'email' | 'phone'
>;

export const userFieldsSchema = schema<UserFields>((path) => {
  required(path.firstName);
  required(path.secondName);
  required(path.login);

  required(path.email);
  pattern(path.email, emailPattern);

  required(path.phone);
  pattern(path.phone, phonePattern);
  minLength(path.phone, phoneMinLength);
  // Не `maxLength()`: оно ставит на input нативный `maxlength`, браузер молча
  // обрезает ввод, и человек не видит сообщения о слишком длинном значении.
  validate(path.phone, ({ value }) =>
    value().length > phoneMaxLength ? maxLengthError(phoneMaxLength) : null,
  );
});
