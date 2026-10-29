import { CurrentSessionStatus } from './current-session-status';
import { CurrentUser } from './current-user';

export type CurrentSessionResult =
  | {
      status: CurrentSessionStatus.Authenticated;
      user: CurrentUser;
    }
  | {
      status: CurrentSessionStatus.Anonymous;
    };
