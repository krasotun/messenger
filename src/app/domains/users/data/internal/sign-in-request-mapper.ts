import { SignInInput } from '../auth-gateway';

import { SignInRequestDto } from './sign-in-dto';

export const signInRequestMapper = (signInInput: SignInInput): SignInRequestDto => {
  const { login, password } = signInInput;

  return {
    login,
    password,
  };
};
