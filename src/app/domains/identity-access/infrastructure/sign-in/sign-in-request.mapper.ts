import { SignInInput } from '../../application/sign-in/sign-in-input.type';

import { SignInRequestDto } from './sign-in-dto.type';

export const signInRequestMapper = (signInInput: SignInInput): SignInRequestDto => {
  const { login, password } = signInInput;

  return {
    login,
    password,
  };
};
