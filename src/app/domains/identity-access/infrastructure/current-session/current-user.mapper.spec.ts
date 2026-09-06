import { CurrentUser } from '../../application/current-session/current-user.type';

import { CurrentUserDto } from './current-user-dto.type';
import { currentUserMapper } from './current-user.mapper';

const resourcesBaseUrlMock = 'https://mock.host/resources';

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
    expect(currentUserMapper(mockCurrentUserDto, resourcesBaseUrlMock)).toEqual(mockCurrentUser);
  });

  it('should resolve relative avatar path to absolute url', () => {
    const mockCurrentUserDto: CurrentUserDto = {
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
