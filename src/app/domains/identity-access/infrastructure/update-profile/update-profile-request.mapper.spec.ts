import { updateProfileRequestMapper } from './update-profile-request.mapper';
import { UpdateProfileRequestDto } from './update-profile.dto';

import { UpdateProfileInput } from '@domains/identity-access/application/update-profile/update-profile.input';

describe('updateProfileRequestMapper', () => {
  it('should map update profile input to snake_case request DTO', () => {
    const mockInput: UpdateProfileInput = {
      firstName: 'mockFirstName',
      secondName: 'mockSecondName',
      displayName: 'mockDisplayName',
      login: 'mockLogin',
      email: 'mock@email.email',
      phone: '79999999999',
    };

    const expectedRequest: UpdateProfileRequestDto = {
      first_name: 'mockFirstName',
      second_name: 'mockSecondName',
      display_name: 'mockDisplayName',
      login: 'mockLogin',
      email: 'mock@email.email',
      phone: '79999999999',
    };

    expect(updateProfileRequestMapper(mockInput)).toEqual(expectedRequest);
  });
});
