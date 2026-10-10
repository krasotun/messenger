import { Component, inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { Toast } from './toast';

import { DEFAULT_NOTIFICATION_DELAY_MS, Notification } from '@shared/notifications';

const successNotification: Notification = {
  kind: 'success',
  title: 'Password change',
  text: 'Password changed successfully',
};

const errorNotification: Notification = {
  kind: 'error',
  title: 'Failed to change password',
  text: 'Wrong password',
};

const firstClosedSpy = vi.fn();
const secondClosedSpy = vi.fn();

@Component({
  imports: [Toast],
  template: `
    <app-toast [notification]="first" [delayMs]="1000" (closed)="firstClosed()"></app-toast>
    <app-toast [notification]="second" [delayMs]="2000" (closed)="secondClosed()"></app-toast>
  `,
})
class TwoToastsHost {
  readonly first = successNotification;
  readonly second = errorNotification;
  readonly firstClosed = firstClosedSpy;
  readonly secondClosed = secondClosedSpy;
}

describe('Toast', () => {
  const renderToast = async (notification: Notification, delayMs?: number) => {
    const closed = vi.fn();

    const result = await render(Toast, {
      bindings: [
        inputBinding('notification', () => notification),
        ...(delayMs === undefined ? [] : [inputBinding('delayMs', () => delayMs)]),
        outputBinding('closed', closed),
      ],
    });

    return { ...result, closed };
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render notification title and text', async () => {
    await renderToast(successNotification);

    expect(screen.getByText('Password change')).toBeInTheDocument();
    expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
  });

  it('should apply success modifier class for success kind', async () => {
    const { container } = await renderToast(successNotification);

    expect(container).toHaveClass('app-toast_success');
    expect(container).not.toHaveClass('app-toast_error');
  });

  it('should apply error modifier class for error kind', async () => {
    const { container } = await renderToast(errorNotification);

    expect(container).toHaveClass('app-toast_error');
    expect(container).not.toHaveClass('app-toast_success');
  });

  describe('closing by button', () => {
    // Таймеры поддельные: user-event двигает их сам.
    const clickClose = (): Promise<void> =>
      userEvent
        .setup({ advanceTimers: vi.advanceTimersByTime })
        .click(screen.getByRole('button', { name: 'Close notification' }));

    it('should emit closed when close button is clicked', async () => {
      const { closed } = await renderToast(successNotification);

      await clickClose();

      expect(closed).toHaveBeenCalledOnce();
    });

    it('should not emit closed again from the timer after the button was clicked', async () => {
      const { closed } = await renderToast(successNotification);

      await clickClose();

      vi.advanceTimersByTime(DEFAULT_NOTIFICATION_DELAY_MS);

      expect(closed).toHaveBeenCalledOnce();
    });
  });

  describe('fading', () => {
    it('should emit closed after default delay when delayMs is not given', async () => {
      const { closed } = await renderToast(successNotification);

      vi.advanceTimersByTime(DEFAULT_NOTIFICATION_DELAY_MS - 1);
      expect(closed).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(closed).toHaveBeenCalledOnce();
    });

    it('should emit closed after given delayMs, not the default', async () => {
      const { closed } = await renderToast(successNotification, 1000);

      vi.advanceTimersByTime(999);
      expect(closed).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(closed).toHaveBeenCalledOnce();
    });

    it('should fade neighboring toasts independently', async () => {
      firstClosedSpy.mockReset();
      secondClosedSpy.mockReset();

      await render(TwoToastsHost);

      vi.advanceTimersByTime(1000);

      expect(firstClosedSpy).toHaveBeenCalledOnce();
      expect(secondClosedSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);

      expect(secondClosedSpy).toHaveBeenCalledOnce();
    });
  });
});
