import { ChangeAvatarInput } from '@domains/identity-access/application/change-avatar/change-avatar.input';

export const changeAvatarRequestMapper = ({ file }: ChangeAvatarInput): FormData => {
  const formData = new FormData();

  formData.append('avatar', file);

  return formData;
};
