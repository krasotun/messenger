import { Nullable } from '@shared/types';

export interface User {
  id: number;
  login: string;
  name: string;
  avatar: Nullable<string>;
}
