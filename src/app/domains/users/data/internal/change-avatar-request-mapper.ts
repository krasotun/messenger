import { ChangeAvatarInput } from '@domains/users/data/change-avatar-input';
import { ChangeAvatarRequestDto } from '@domains/users/data/internal/change-avatar-dto';

export const changeAvatarRequestMapper = ({ file }: ChangeAvatarInput): ChangeAvatarRequestDto => {
  const formData = new FormData();

  formData.append('avatar', file);

  return formData;
};
