import { UpdateProfileRequestDto } from '@domains/users/data/internal/update-profile-dto';
import { UpdateProfileInput } from '@domains/users/data/user-gateway';

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
