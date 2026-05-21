import { CurrentUser } from '../../application/current-session/current-user';

import { CurrentUserDto } from './current-user.dto';
import { currentUserMapper } from './current-user.mapper';

describe('currentUserMapper', () => {
  it('should map currentUser DTO to current user', () => {
    const mockCurrentUserDto: CurrentUserDto = {
      id: 1,
      first_name: 'first',
      second_name: 'second',
      display_name: null,
      avatar: null,
      email: 'email',
      login: 'login',
      phone: 'phone',
    };

    const mockCurrentUser: CurrentUser = {
      id: 1,
      firstName: 'first',
      secondName: 'second',
      displayName: null,
      avatar: null,
      email: 'email',
      login: 'login',
      phone: 'phone',
    };
    expect(currentUserMapper(mockCurrentUserDto)).toEqual(mockCurrentUser);
  });
});
