import { SignUpRequestDto } from '@domains/users/data/internal/sign-up-dto';
import { SignUpInput } from '@domains/users/data/sign-up-input';

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
