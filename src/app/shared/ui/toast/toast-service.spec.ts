import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ApplicationRef, Component, effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { screen } from '@testing-library/angular/zoneless';

import { ToastService } from './toast-service';

import { DEFAULT_NOTIFICATION_DELAY_MS } from '@shared/notifications';

@Component({
  selector: 'app-test-modal-stub',
  template: `<div data-testid="modal-stub">Modal content</div>`,
})
class TestModalStub {}

@Component({
  selector: 'app-test-effect-caller',
  template: `<span>{{ notificationsAsked() }}</span>`,
})
class TestEffectCaller {
  readonly notificationsAsked = signal(0);

  constructor() {
    const toastService = TestBed.inject(ToastService);

    effect(() => {
      if (this.notificationsAsked() > 0) {
        toastService.error('Called from an effect', 'Wrong password');
      }
    });
  }
}

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

  // Тост живет в overlay, вне какого-либо fixture: поиск идет по screen.
  const queryToast = (): HTMLElement | null =>
    screen.queryByRole('button', { name: 'Close notification' });

  it('should create an overlay when a notification is shown', () => {
    service.success('Password change', 'Password changed successfully');
    tick();

    expect(queryToast()?.closest('.cdk-overlay-container')).toBeTruthy();
  });

  it('should render title and text of the shown notification', () => {
    service.error('Failed to change password', 'Wrong password');
    tick();

    expect(screen.getByText('Failed to change password')).toBeInTheDocument();
    expect(screen.getByText('Wrong password')).toBeInTheDocument();
  });

  it('should pass the given delay down to the toast', () => {
    service.success('Password change', 'Password changed successfully', 1000);
    tick();

    vi.advanceTimersByTime(999);
    tick();
    expect(queryToast()).toBeInTheDocument();

    vi.advanceTimersByTime(1);
    tick();
    expect(queryToast()).not.toBeInTheDocument();
  });

  it('should use the default delay when none is given', () => {
    service.success('Password change', 'Password changed successfully');
    tick();

    vi.advanceTimersByTime(DEFAULT_NOTIFICATION_DELAY_MS - 1);
    tick();
    expect(queryToast()).toBeInTheDocument();

    vi.advanceTimersByTime(1);
    tick();
    expect(queryToast()).not.toBeInTheDocument();
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
    const toastPane = queryToast()?.closest('.cdk-overlay-pane');

    expect(panes[panes.length - 1]).toBe(toastPane);

    modalOverlayRef.dispose();
  });

  describe('without a change detection pass of the application', () => {
    it('should render the first notification', () => {
      service.success('Password change', 'Password changed successfully');

      expect(screen.getByText('Password change')).toBeInTheDocument();
    });

    it('should render the next notification in an already open stack', () => {
      service.success('Password change', 'Password changed successfully');
      service.error('Failed to change password', 'Wrong password');

      const titles = screen
        .getAllByText(/^(Failed to change password|Password change)$/)
        .map((titleEl) => titleEl.textContent?.trim());

      expect(titles).toEqual(['Failed to change password', 'Password change']);
    });
  });

  it('should render a notification asked for from inside a change detection pass', () => {
    const fixture = TestBed.createComponent(TestEffectCaller);
    fixture.detectChanges();

    fixture.componentInstance.notificationsAsked.set(1);

    expect(() => tick()).not.toThrow();

    expect(screen.getByText('Called from an effect')).toBeInTheDocument();
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
