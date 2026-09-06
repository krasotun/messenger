import { ChangePasswordRequestDto } from './change-password-dto.type';
import { changePasswordRequestMapper } from './change-password-request.mapper';

import { ChangePasswordInput } from '@domains/identity-access/application/change-password/change-password-input.type';

describe('changePasswordRequestMapper', () => {
  it('should map change password input to camelCase request DTO', () => {
    const mockInput: ChangePasswordInput = {
      oldPassword: 'mockOldPassword',
      newPassword: 'mockNewPassword',
    };

    const expectedRequest: ChangePasswordRequestDto = {
      oldPassword: 'mockOldPassword',
      newPassword: 'mockNewPassword',
    };

    expect(changePasswordRequestMapper(mockInput)).toEqual(expectedRequest);
  });

  it('should not put any field beyond old and new password into request', () => {
    const mockInput: ChangePasswordInput = {
      oldPassword: 'mockOldPassword',
      newPassword: 'mockNewPassword',
    };

    expect(Object.keys(changePasswordRequestMapper(mockInput))).toEqual([
      'oldPassword',
      'newPassword',
    ]);
  });
});
