import { User } from '../user';

import { UserDto } from './user-dto';

import { resolveAvatarUrl } from '@shared/resources';

export const userMapper = (
  { id, first_name, display_name, login, avatar }: UserDto,
  resourcesBaseUrl: string,
): User => {
  return {
    id,
    login,
    name: (display_name || first_name || login).trim(),
    avatar: resolveAvatarUrl(avatar, resourcesBaseUrl),
  };
};
