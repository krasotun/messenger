import { TestBed } from '@angular/core/testing';
import { PrimeNG } from 'primeng/config';

import { appConfig } from './app.config';

import { NOTIFIER } from '@shared/notifications';
import { PrimeNotifier } from '@shared/ui/toast/prime-notifier';

describe('appConfig', () => {
  it('should provide PrimeNotifier as the Notifier', () => {
    TestBed.configureTestingModule({
      providers: appConfig.providers,
    });

    const notifier = TestBed.inject(NOTIFIER);

    expect(notifier).toBeInstanceOf(PrimeNotifier);
  });

  it('should configure the UI kit theme', () => {
    TestBed.configureTestingModule({
      providers: appConfig.providers,
    });

    const primeng = TestBed.inject(PrimeNG);

    expect(primeng.theme()).toBeDefined();
  });
});
