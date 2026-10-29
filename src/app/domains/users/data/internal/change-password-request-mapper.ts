import { ChangePasswordInput } from '@domains/users/data/change-password-input';
import { ChangePasswordRequestDto } from '@domains/users/data/internal/change-password-dto';

export const changePasswordRequestMapper = (
  changePasswordInput: ChangePasswordInput,
): ChangePasswordRequestDto => {
  const { oldPassword, newPassword } = changePasswordInput;

  return {
    oldPassword,
    newPassword,
  };
};
