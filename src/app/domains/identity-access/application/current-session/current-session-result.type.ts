import { CurrentSessionStatus } from './current-session-status.type';
import { CurrentUser } from './current-user.type';

export type CurrentSessionResult =
  | {
      status: CurrentSessionStatus.Authenticated;
      user: CurrentUser;
    }
  | {
      status: CurrentSessionStatus.Anonymous;
    };
