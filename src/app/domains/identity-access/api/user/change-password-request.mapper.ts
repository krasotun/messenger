import { ChangePasswordRequestDto } from '@domains/identity-access/api/user/change-password-dto.type';
import { ChangePasswordInput } from '@domains/identity-access/change-password/change-password-input.type';

export const changePasswordRequestMapper = (
  changePasswordInput: ChangePasswordInput,
): ChangePasswordRequestDto => {
  const { oldPassword, newPassword } = changePasswordInput;

  return {
    oldPassword,
    newPassword,
  };
};
