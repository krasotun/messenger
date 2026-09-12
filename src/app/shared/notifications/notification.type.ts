import { NotificationKind } from './notification-kind.type';

export interface Notification {
  kind: NotificationKind;
  title: string;
  text: string;
}
