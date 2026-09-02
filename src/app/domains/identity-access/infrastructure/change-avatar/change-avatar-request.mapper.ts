import { ChangeAvatarInput } from '@domains/identity-access/application/change-avatar/change-avatar.input';
import { ChangeAvatarRequestDto } from '@domains/identity-access/infrastructure/change-avatar/change-avatar.dto';

export const changeAvatarRequestMapper = ({ file }: ChangeAvatarInput): ChangeAvatarRequestDto => {
  const formData = new FormData();

  formData.append('avatar', file);

  return formData;
};
