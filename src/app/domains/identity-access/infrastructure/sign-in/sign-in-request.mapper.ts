import { SignInInput } from '../../application/sign-in/sign-in.input';

import { SignInRequestDto } from './sign-in.dto';

export const signInRequestMapper = (signInInput: SignInInput): SignInRequestDto => {
  const { login, password } = signInInput;

  return {
    login,
    password,
  };
};
