import { resolveAvatarUrl } from './resolve-avatar-url';

describe('resolveAvatarUrl', () => {
  it('should prefix relative path with resources base url', () => {
    expect(resolveAvatarUrl('/path/to/avatar.jpg', 'https://mock.host/resources')).toBe(
      'https://mock.host/resources/path/to/avatar.jpg',
    );
  });

  it('should return null for null path', () => {
    expect(resolveAvatarUrl(null, 'https://mock.host/resources')).toBeNull();
  });
});
