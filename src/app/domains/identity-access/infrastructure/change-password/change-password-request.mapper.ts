import { ChangePasswordInput } from '@domains/identity-access/application/change-password/change-password.input';
import { ChangePasswordRequestDto } from '@domains/identity-access/infrastructure/change-password/change-password.dto';

export const changePasswordRequestMapper = (
  changePasswordInput: ChangePasswordInput,
): ChangePasswordRequestDto => {
  const { oldPassword, newPassword } = changePasswordInput;

  return {
    oldPassword,
    newPassword,
  };
};
