import { TestBed } from '@angular/core/testing';

import { appConfig } from './app.config';

import { NOTIFIER } from '@shared/notifications';
import { ToastService } from '@shared/ui/toast/toast-service';

describe('appConfig', () => {
  it('should provide ToastService as the Notifier', () => {
    TestBed.configureTestingModule({
      providers: appConfig.providers,
    });

    const notifier = TestBed.inject(NOTIFIER);

    expect(notifier).toBeInstanceOf(ToastService);
  });
});
