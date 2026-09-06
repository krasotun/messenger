import { NotificationKind } from './notification-kind';

export interface Notification {
  kind: NotificationKind;
  title: string;
  text: string;
}

export const DEFAULT_NOTIFICATION_DELAY_MS = 5000;
