import { CurrentUser } from '../current-user';

import { currentUserMapper } from './current-user-mapper';
import { UserDto } from './user-dto';

const resourcesBaseUrlMock = 'https://mock.host/resources';

describe('currentUserMapper', () => {
  it('should map currentUser DTO to current user', () => {
    const mockCurrentUserDto: UserDto = {
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
    expect(currentUserMapper(mockCurrentUserDto, resourcesBaseUrlMock)).toEqual(mockCurrentUser);
  });

  it('should resolve relative avatar path to absolute url', () => {
    const mockCurrentUserDto: UserDto = {
      id: 1,
      first_name: 'first',
      second_name: 'second',
      display_name: null,
      avatar: '/path/to/avatar.jpg',
      email: 'email',
      login: 'login',
      phone: 'phone',
    };

    expect(currentUserMapper(mockCurrentUserDto, resourcesBaseUrlMock).avatar).toBe(
      'https://mock.host/resources/path/to/avatar.jpg',
    );
  });
});
