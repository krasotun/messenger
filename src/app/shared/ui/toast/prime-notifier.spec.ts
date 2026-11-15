import { Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular/zoneless';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { PrimeNotifier } from './prime-notifier';

import { DEFAULT_NOTIFICATION_DELAY_MS } from '@shared/notifications';

// Хост повторяет то, что стоит в app.html (те же входы): настоящий <p-toast>
// слушает тот же MessageService, в который пишет адаптер.
@Component({
  selector: 'app-test-toast-host',
  imports: [ToastModule],
  template: `<p-toast position="top-right" mode="expanded" [stackVisibleLimit]="100" />`,
})
class TestToastHost {}

describe('PrimeNotifier', () => {
  let fixture: ComponentFixture<TestToastHost>;
  let notifier: PrimeNotifier;

  const getAlerts = (): HTMLElement[] => screen.queryAllByRole('alert');

  // Под fake timers whenStable не дожидается планировщика Angular: таймеры
  // заморожены. Поэтому время двигаем сами и сами прогоняем отрисовку.
  const advance = async (ms: number): Promise<void> => {
    await vi.advanceTimersByTimeAsync(ms);
    fixture.detectChanges();
  };

  const settle = (): Promise<void> => advance(0);

  beforeEach(async () => {
    ({ fixture } = await render(TestToastHost, {
      providers: [MessageService, PrimeNotifier],
      waitForStableOnRender: true,
    }));

    vi.useFakeTimers();

    notifier = fixture.debugElement.injector.get(PrimeNotifier);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show title and text of a success notification', async () => {
    notifier.success('Password change', 'Password changed successfully');
    await settle();

    expect(screen.getByText('Password change')).toBeInTheDocument();
    expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
  });

  it('should show title and text of an error notification', async () => {
    notifier.error('Failed to change password', 'Wrong password');
    await settle();

    expect(screen.getByText('Failed to change password')).toBeInTheDocument();
    expect(screen.getByText('Wrong password')).toBeInTheDocument();
  });

  it('should hide the notification after the default delay when none is given', async () => {
    notifier.success('Password change', 'Password changed successfully');
    await settle();

    await advance(DEFAULT_NOTIFICATION_DELAY_MS - 1);
    expect(getAlerts()).toHaveLength(1);

    await advance(1);
    expect(getAlerts()).toHaveLength(0);
  });

  it('should hide the notification after the given delay', async () => {
    notifier.success('Password change', 'Password changed successfully', 1000);
    await settle();

    await advance(999);
    expect(getAlerts()).toHaveLength(1);

    await advance(1);
    expect(getAlerts()).toHaveLength(0);
  });

  it('should show two notifications at once', async () => {
    notifier.success('Password change', 'Password changed successfully');
    notifier.error('Failed to change password', 'Wrong password');
    await settle();

    expect(getAlerts()).toHaveLength(2);
  });

  it('should show a second notification when the same text is repeated', async () => {
    notifier.error('Failed to change password', 'Wrong password');
    notifier.error('Failed to change password', 'Wrong password');
    await settle();

    expect(screen.getAllByText('Failed to change password')).toHaveLength(2);
  });

  it('should keep the first notification when a fourth one appears', async () => {
    notifier.success('First', 'first text');
    notifier.success('Second', 'second text');
    notifier.success('Third', 'third text');
    notifier.success('Fourth', 'fourth text');
    await settle();

    expect(getAlerts()).toHaveLength(4);

    // Кит не убирает лишние уведомления из DOM, а прячет их без data-visible.
    getAlerts().forEach((alertEl) => expect(alertEl).toHaveAttribute('data-visible'));

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Fourth')).toBeInTheDocument();
  });

  it('should close only the notification whose close button is pressed', async () => {
    notifier.success('First', 'first text');
    notifier.error('Second', 'second text');
    await settle();

    const [firstCloseButton] = screen.getAllByRole('button', { name: 'Close' });

    firstCloseButton.click();
    await settle();

    expect(getAlerts()).toHaveLength(1);
  });
});
