export const AUTH_ERROR_MESSAGES = {
  signUp: 'Failed to sign up. Please try again.',
  signIn: 'Failed to sign in. Please try again.',
  currentSession: 'Failed to load session. Please try again.',
  logout: 'Failed to logout. Please try again.',
} as const;

export const USER_ERROR_MESSAGES = {
  updateProfile: 'Failed to update profile. Please try again.',
  changeAvatar: 'Failed to change avatar. Please try again.',
  searchUsers: 'Failed to search users. Please try again.',
  changePassword: 'Failed to change password. Please try again.',
} as const;
