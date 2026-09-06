import { SignUpInput } from '@domains/identity-access/application/sign-up/sign-up-input.type';
import { SignUpRequestDto } from '@domains/identity-access/infrastructure/sign-up/sign-up-dto.type';

export const signUpRequestMapper = (signUpInput: SignUpInput): SignUpRequestDto => {
  const { firstName, secondName, login, email, password, phone } = signUpInput;

  return {
    first_name: firstName,
    second_name: secondName,
    login,
    email,
    password,
    phone,
  };
};
