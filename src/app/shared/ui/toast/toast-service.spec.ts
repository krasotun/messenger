import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast-service';

import { DEFAULT_NOTIFICATION_DELAY_MS } from '@shared/notifications';

@Component({
  selector: 'app-test-modal-stub',
  template: `<div data-testid="modal-stub">Modal content</div>`,
})
class TestModalStub {}

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    document.body.querySelectorAll('.cdk-overlay-container').forEach((element) => element.remove());

    vi.useRealTimers();
  });

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  it('should create an overlay when a notification is shown', () => {
    service.success('Password change', 'Password changed successfully');
    tick();

    const toastEl = document.querySelector('.cdk-overlay-container .app-toast');

    expect(toastEl).toBeTruthy();
  });

  it('should render title and text of the shown notification', () => {
    service.error('Failed to change password', 'Wrong password');
    tick();

    const overlayContainer = document.querySelector('.cdk-overlay-container');

    expect(overlayContainer?.querySelector('.app-toast__title')?.textContent?.trim()).toBe(
      'Failed to change password',
    );
    expect(overlayContainer?.querySelector('.app-toast__text')?.textContent?.trim()).toBe(
      'Wrong password',
    );
  });

  it('should pass the given delay down to the toast', () => {
    service.success('Password change', 'Password changed successfully', 1000);
    tick();

    vi.advanceTimersByTime(999);
    tick();
    expect(document.querySelector('.cdk-overlay-container .app-toast')).toBeTruthy();

    vi.advanceTimersByTime(1);
    tick();
    expect(document.querySelector('.cdk-overlay-container .app-toast')).toBeNull();
  });

  it('should use the default delay when none is given', () => {
    service.success('Password change', 'Password changed successfully');
    tick();

    vi.advanceTimersByTime(DEFAULT_NOTIFICATION_DELAY_MS - 1);
    tick();
    expect(document.querySelector('.cdk-overlay-container .app-toast')).toBeTruthy();

    vi.advanceTimersByTime(1);
    tick();
    expect(document.querySelector('.cdk-overlay-container .app-toast')).toBeNull();
  });

  it('should destroy the overlay once the stack is empty', () => {
    service.success('Password change', 'Password changed successfully', 1000);
    tick();

    vi.advanceTimersByTime(1000);
    tick();

    const overlayPaneEl = document.querySelector('.cdk-overlay-container .cdk-overlay-pane');

    expect(overlayPaneEl).toBeNull();
  });

  it('should show a notification on top of an open modal', () => {
    const overlay = TestBed.inject(Overlay);
    const modalOverlayRef = overlay.create();
    modalOverlayRef.attach(new ComponentPortal(TestModalStub));
    tick();

    service.success('Password change', 'Password changed successfully');
    tick();

    const panes = document.querySelectorAll('.cdk-overlay-container .cdk-overlay-pane');
    const toastPane = document
      .querySelector('.cdk-overlay-container .app-toast')
      ?.closest('.cdk-overlay-pane');

    expect(panes[panes.length - 1]).toBe(toastPane);

    modalOverlayRef.dispose();
  });

  it('should not move keyboard focus when a notification appears', () => {
    const inputEl = document.createElement('input');
    document.body.append(inputEl);
    inputEl.focus();

    service.success('Password change', 'Password changed successfully');
    tick();

    expect(document.activeElement).toBe(inputEl);

    inputEl.remove();
  });
});
