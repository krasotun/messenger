import { UpdateProfileInput } from '@domains/identity-access/application/update-profile/update-profile-input.type';
import { UpdateProfileRequestDto } from '@domains/identity-access/infrastructure/update-profile/update-profile-dto.type';

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
