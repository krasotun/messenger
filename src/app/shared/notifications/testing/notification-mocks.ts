import { Notifier } from '../notifier.type';

export const NotificationMocks = {
  notifier: () => ({
    success: vi.fn<Notifier['success']>(),
    error: vi.fn<Notifier['error']>(),
  }),
};
