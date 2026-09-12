import { ComponentFixture, TestBed } from '@angular/core/testing';

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
  let fixture: ComponentFixture<ToastStack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastStack],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastStack);
  });

  function titles(): string[] {
    const hostEl: HTMLElement = fixture.nativeElement;

    return Array.from(hostEl.querySelectorAll('.app-toast__title')).map(
      (el) => el.textContent?.trim() ?? '',
    );
  }

  it('should keep an already shown notification visible when another one appears', () => {
    fixture.componentRef.setInput('items', [
      makeItem(2, errorNotification),
      makeItem(1, successNotification),
    ]);

    fixture.detectChanges();

    expect(titles()).toHaveLength(2);
    expect(titles()).toContain(successNotification.title);
    expect(titles()).toContain(errorNotification.title);
  });

  it('should render items in the given order, newest first', () => {
    fixture.componentRef.setInput('items', [
      makeItem(2, errorNotification),
      makeItem(1, successNotification),
    ]);

    fixture.detectChanges();

    expect(titles()).toEqual([errorNotification.title, successNotification.title]);
  });

  it('should render no more than three notifications', () => {
    fixture.componentRef.setInput('items', [makeItem(4), makeItem(3), makeItem(2), makeItem(1)]);

    fixture.detectChanges();

    expect(titles().length).toBe(3);
  });

  it('should evict the oldest notification when a fourth appears', () => {
    fixture.componentRef.setInput('items', [
      makeItem(4, errorNotification),
      makeItem(3, successNotification),
      makeItem(2, successNotification),
      makeItem(1, successNotification),
    ]);

    fixture.detectChanges();

    const hostEl: HTMLElement = fixture.nativeElement;

    expect(hostEl.querySelectorAll('.app-toast').length).toBe(3);
    expect(hostEl.querySelectorAll('.app-toast_error').length).toBe(1);
  });

  it('should not collapse two notifications with identical content', () => {
    fixture.componentRef.setInput('items', [
      makeItem(2, successNotification),
      makeItem(1, successNotification),
    ]);

    fixture.detectChanges();

    const hostEl: HTMLElement = fixture.nativeElement;

    expect(hostEl.querySelectorAll('.app-toast').length).toBe(2);
  });

  it('should emit closed with the item id when a toast requests close', () => {
    fixture.componentRef.setInput('items', [makeItem(1, successNotification)]);
    fixture.detectChanges();

    const closedSpy = vi.fn();
    fixture.componentInstance.closed.subscribe(closedSpy);

    const closeButtonEl: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.app-toast__close-button',
    );

    closeButtonEl.click();

    expect(closedSpy).toHaveBeenCalledWith(1);
  });

  it('should declare itself as a live region', () => {
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();

    const hostEl: HTMLElement = fixture.nativeElement;

    expect(hostEl.getAttribute('aria-live')).toBe('polite');
  });
});
