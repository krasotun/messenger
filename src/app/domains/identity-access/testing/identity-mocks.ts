import { signal } from '@angular/core';
import { Subject } from 'rxjs';

import { AuthGateway } from '../application/auth.gateway';
import { ChangeAvatarService } from '../application/change-avatar/change-avatar.service';
import { ChangePasswordService } from '../application/change-password/change-password.service';
import { CurrentSessionResult } from '../application/current-session/current-session-result.type';
import { CurrentSessionStatus } from '../application/current-session/current-session-status.type';
import { CurrentUser } from '../application/current-session/current-user.type';
import { SearchUsersService } from '../application/search-users/search-users.service';
import { UpdateProfileInput } from '../application/update-profile/update-profile-input.type';
import { UpdateProfileService } from '../application/update-profile/update-profile.service';
import { UserGateway } from '../application/user.gateway';
import { User } from '../application/user.type';

const currentUser = (overrides: Partial<CurrentUser> = {}): CurrentUser => ({
  id: 1,
  firstName: 'First',
  secondName: 'Second',
  displayName: null,
  phone: '+79990000000',
  login: 'login',
  avatar: null,
  email: 'user@mock.dev',
  ...overrides,
});

const updateProfileInput = (overrides: Partial<UpdateProfileInput> = {}): UpdateProfileInput => ({
  firstName: 'First',
  secondName: 'Second',
  displayName: 'Display',
  login: 'login',
  email: 'user@mock.dev',
  phone: '+79990000000',
  ...overrides,
});

// Каждый вызов отдает новый двойник: сбрасывать его между тестами не нужно.
// isSubmitting и succeeded$ у use case - сигнал и Subject, которыми тест
// управляет сам: переключает отправку и сообщает об успехе через next().
export const IdentityMocks = {
  currentUser,

  user: (overrides: Partial<User> = {}): User => ({
    id: 2,
    login: 'user',
    name: 'User',
    avatar: null,
    ...overrides,
  }),

  updateProfileInput,

  authenticatedSession: (user: CurrentUser = currentUser()): CurrentSessionResult => ({
    status: CurrentSessionStatus.Authenticated,
    user,
  }),

  authGateway: () => ({
    signUp: vi.fn<AuthGateway['signUp']>(),
    signIn: vi.fn<AuthGateway['signIn']>(),
    currentSession: vi.fn<AuthGateway['currentSession']>(),
    logout: vi.fn<AuthGateway['logout']>(),
  }),

  userGateway: () => ({
    updateProfile: vi.fn<UserGateway['updateProfile']>(),
    changePassword: vi.fn<UserGateway['changePassword']>(),
    changeAvatar: vi.fn<UserGateway['changeAvatar']>(),
    searchUsers: vi.fn<UserGateway['searchUsers']>(),
  }),

  searchUsersService: () => ({
    searchUsers: vi.fn<SearchUsersService['searchUsers']>(),
  }),

  changeAvatarService: () => ({
    changeAvatar: vi.fn<ChangeAvatarService['changeAvatar']>(),
    isSubmitting: signal(false),
    succeeded$: new Subject<void>(),
  }),

  changePasswordService: () => ({
    changePassword: vi.fn<ChangePasswordService['changePassword']>(),
    isSubmitting: signal(false),
    succeeded$: new Subject<void>(),
  }),

  updateProfileService: (initialValues: UpdateProfileInput = updateProfileInput()) => ({
    updateProfile: vi.fn<UpdateProfileService['updateProfile']>(),
    initialValues: signal(initialValues),
    isSubmitting: signal(false),
    succeeded$: new Subject<void>(),
  }),
};
