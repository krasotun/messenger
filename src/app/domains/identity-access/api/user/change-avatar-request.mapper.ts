import { ChangeAvatarRequestDto } from '@domains/identity-access/api/user/change-avatar-dto.type';
import { ChangeAvatarInput } from '@domains/identity-access/change-avatar/change-avatar-input.type';

export const changeAvatarRequestMapper = ({ file }: ChangeAvatarInput): ChangeAvatarRequestDto => {
  const formData = new FormData();

  formData.append('avatar', file);

  return formData;
};
