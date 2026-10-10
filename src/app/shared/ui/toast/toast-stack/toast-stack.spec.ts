import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { ToastStack, ToastStackItem } from './toast-stack';

import { Notification } from '@shared/notifications';

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

function makeItem(id: number, notification: Notification = successNotification): ToastStackItem {
  return { id, notification };
}

describe('ToastStack', () => {
  const renderStack = async (items: ToastStackItem[]) => {
    const closed = vi.fn();

    const result = await render(ToastStack, {
      bindings: [inputBinding('items', () => items), outputBinding('closed', closed)],
    });

    return { ...result, closed };
  };

  // У каждого тоста своя кнопка закрытия: по ним считаются показанные тосты.
  const getToastCloseButtons = (): HTMLElement[] =>
    screen.queryAllByRole('button', { name: 'Close notification' });

  const titles = (): string[] =>
    screen
      .queryAllByText(new RegExp(`^(${successNotification.title}|${errorNotification.title})$`))
      .map((element) => element.textContent?.trim() ?? '');

  it('should keep an already shown notification visible when another one appears', async () => {
    await renderStack([makeItem(2, errorNotification), makeItem(1, successNotification)]);

    expect(titles()).toHaveLength(2);
    expect(titles()).toContain(successNotification.title);
    expect(titles()).toContain(errorNotification.title);
  });

  it('should render items in the given order, newest first', async () => {
    await renderStack([makeItem(2, errorNotification), makeItem(1, successNotification)]);

    expect(titles()).toEqual([errorNotification.title, successNotification.title]);
  });

  it('should render no more than three notifications', async () => {
    await renderStack([makeItem(4), makeItem(3), makeItem(2), makeItem(1)]);

    expect(getToastCloseButtons()).toHaveLength(3);
  });

  it('should evict the oldest notification when a fourth appears', async () => {
    await renderStack([
      makeItem(4, errorNotification),
      makeItem(3, successNotification),
      makeItem(2, successNotification),
      makeItem(1, successNotification),
    ]);

    expect(getToastCloseButtons()).toHaveLength(3);
    expect(screen.getByText(errorNotification.title)).toBeInTheDocument();
  });

  it('should not collapse two notifications with identical content', async () => {
    await renderStack([makeItem(2, successNotification), makeItem(1, successNotification)]);

    expect(getToastCloseButtons()).toHaveLength(2);
  });

  it('should emit closed with the item id when a toast requests close', async () => {
    const { closed } = await renderStack([makeItem(1, successNotification)]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Close notification' }));

    expect(closed).toHaveBeenCalledWith(1);
  });

  it('should declare itself as a live region', async () => {
    const { container } = await renderStack([]);

    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});
