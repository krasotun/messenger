import { changeAvatarRequestMapper } from './change-avatar-request.mapper';

describe('changeAvatarRequestMapper', () => {
  it('should map change avatar input to form data with the single avatar field', () => {
    const file = new File(['mockContent'], 'avatar.png', { type: 'image/png' });

    const formData = changeAvatarRequestMapper({ file });

    expect(formData.getAll('avatar')).toEqual([file]);
    expect([...formData.keys()]).toEqual(['avatar']);
  });
});
