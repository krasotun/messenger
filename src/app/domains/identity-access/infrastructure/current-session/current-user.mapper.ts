import { CurrentUser } from '../../application/current-session/current-user';

import { CurrentUserDto } from './current-user.dto';
import { resolveAvatarUrl } from './resolve-avatar-url';

export const currentUserMapper = (
  { id, first_name, second_name, display_name, avatar, email, login, phone }: CurrentUserDto,
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
