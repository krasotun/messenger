import { SignUpRequestDto } from '@domains/identity-access/api/auth/sign-up-dto.type';
import { SignUpInput } from '@domains/identity-access/sign-up/sign-up-input.type';

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
