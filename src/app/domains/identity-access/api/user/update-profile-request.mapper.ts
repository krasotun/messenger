import { UpdateProfileRequestDto } from '@domains/identity-access/api/user/update-profile-dto.type';
import { UpdateProfileInput } from '@domains/identity-access/update-profile/update-profile-input.type';

export const updateProfileRequestMapper = (
  updateProfileInput: UpdateProfileInput,
): UpdateProfileRequestDto => {
  const { firstName, secondName, displayName, login, email, phone } = updateProfileInput;

  return {
    first_name: firstName,
    second_name: secondName,
    display_name: displayName,
    login,
    email,
    phone,
  };
};
