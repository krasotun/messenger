import { Nullable } from '@shared/types';

export const resolveAvatarUrl = (path: Nullable<string>, baseUrl: string): Nullable<string> => {
  return path === null ? null : `${baseUrl}${path}`;
};
