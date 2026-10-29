import { ChangeAvatarRequestDto } from '@domains/users/data/internal/change-avatar-dto';
import { ChangeAvatarInput } from '@domains/users/data/user-gateway';

export const changeAvatarRequestMapper = ({ file }: ChangeAvatarInput): ChangeAvatarRequestDto => {
  const formData = new FormData();

  formData.append('avatar', file);

  return formData;
};
