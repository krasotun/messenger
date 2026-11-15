import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';

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

  it('should keep the UI kit in the light theme whatever the system theme is', () => {
    TestBed.configureTestingModule({
      providers: appConfig.providers,
    });

    const theme = TestBed.inject(PrimeNG).theme() as { options?: { darkModeSelector?: unknown } };

    expect(theme.options?.darkModeSelector).toBe(false);
  });

  it('should provide the confirmation and dialog services of the UI kit', () => {
    TestBed.configureTestingModule({
      providers: appConfig.providers,
    });

    expect(TestBed.inject(ConfirmationService)).toBeInstanceOf(ConfirmationService);
    expect(TestBed.inject(DialogService)).toBeInstanceOf(DialogService);
  });
});
