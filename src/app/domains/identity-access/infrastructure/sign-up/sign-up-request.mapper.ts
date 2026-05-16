import { SignUpInput } from '@app/domains/identity-access/application/sign-up/sign-up.input';
import { SignUpRequestDto } from '@domains/identity-access/infrastructure/sign-up/sign-up.dto';

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
