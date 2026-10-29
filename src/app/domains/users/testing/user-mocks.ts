import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { AuthGateway, CurrentSessionResult } from '../data/auth-gateway';
import { ChangeAvatarService } from '../data/change-avatar-service';
import { ChangePasswordService } from '../data/change-password-service';
import { CurrentSessionStatus } from '../data/current-session-status';
import { CurrentUser } from '../data/current-user';
import { UpdateProfileService } from '../data/update-profile-service';
import { User } from '../data/user';
import { UpdateProfileInput, UserGateway } from '../data/user-gateway';

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
export const UserMocks = {
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

  anonymousSession: (): CurrentSessionResult => ({
    status: CurrentSessionStatus.Anonymous,
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
