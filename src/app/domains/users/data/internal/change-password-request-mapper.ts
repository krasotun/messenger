import { ChangePasswordRequestDto } from '@domains/users/data/internal/change-password-dto';
import { ChangePasswordInput } from '@domains/users/data/user-gateway';

export const changePasswordRequestMapper = (
  changePasswordInput: ChangePasswordInput,
): ChangePasswordRequestDto => {
  const { oldPassword, newPassword } = changePasswordInput;

  return {
    oldPassword,
    newPassword,
  };
};
