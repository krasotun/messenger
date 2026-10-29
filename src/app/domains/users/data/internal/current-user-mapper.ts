import { CurrentUser } from '../current-user';

import { UserDto } from './user-dto';

import { resolveAvatarUrl } from '@shared/resources';

export const currentUserMapper = (
  { id, first_name, second_name, display_name, avatar, email, login, phone }: UserDto,
  resourcesBaseUrl: string,
): CurrentUser => {
  return {
    id,
    firstName: first_name,
    secondName: second_name,
    displayName: display_name,
    avatar: resolveAvatarUrl(avatar, resourcesBaseUrl),
    email,
    login,
    phone,
  };
};
