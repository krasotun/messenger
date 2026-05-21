import { CurrentUser } from '../../application/current-session/current-user';

import { CurrentUserDto } from './current-user.dto';

export const currentUserMapper = ({
  id,
  first_name,
  second_name,
  display_name,
  avatar,
  email,
  login,
  phone,
}: CurrentUserDto): CurrentUser => {
  return {
    id,
    firstName: first_name,
    secondName: second_name,
    displayName: display_name,
    avatar,
    email,
    login,
    phone,
  };
};
