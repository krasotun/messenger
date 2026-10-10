import { CurrentUser } from '../application/current-session/current-user.type';

export const IdentityMocks = {
  currentUser: (overrides: Partial<CurrentUser> = {}): CurrentUser => ({
    id: 1,
    firstName: 'First',
    secondName: 'Second',
    displayName: null,
    phone: '+70000000000',
    login: 'login',
    avatar: null,
    email: 'user@mock',
    ...overrides,
  }),
};
