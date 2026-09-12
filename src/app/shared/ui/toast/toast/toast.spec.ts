import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Toast } from './toast';

import { DEFAULT_NOTIFICATION_DELAY_MS, Notification } from '@shared/notifications';

const successNotification: Notification = {
  kind: 'success',
  title: 'Смена пароля',
  text: 'Пароль успешно изменен',
};

const errorNotification: Notification = {
  kind: 'error',
  title: 'Не удалось сменить пароль',
  text: 'Неверный пароль',
};

describe('Toast', () => {
  let fixture: ComponentFixture<Toast>;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [Toast],
    }).compileComponents();

    fixture = TestBed.createComponent(Toast);
    fixture.componentRef.setInput('notification', successNotification);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render notification title and text', () => {
    const toastEl: HTMLElement = fixture.nativeElement;

    expect(toastEl.querySelector('.app-toast__title')?.textContent?.trim()).toBe('Смена пароля');
    expect(toastEl.querySelector('.app-toast__text')?.textContent?.trim()).toBe(
      'Пароль успешно изменен',
    );
  });

  it('should apply success modifier class for success kind', () => {
    const toastEl: HTMLElement = fixture.nativeElement;

    expect(toastEl.classList.contains('app-toast_success')).toBe(true);
    expect(toastEl.classList.contains('app-toast_error')).toBe(false);
  });

  it('should apply error modifier class for error kind', () => {
    fixture.componentRef.setInput('notification', errorNotification);
    fixture.detectChanges();

    const toastEl: HTMLElement = fixture.nativeElement;

    expect(toastEl.classList.contains('app-toast_error')).toBe(true);
    expect(toastEl.classList.contains('app-toast_success')).toBe(false);
  });

  describe('закрытие кнопкой', () => {
    it('should emit closed when close button is clicked', () => {
      const closedSpy = vi.fn();

      fixture.componentInstance.closed.subscribe(closedSpy);

      const closeButtonEl: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.app-toast__close-button',
      );

      closeButtonEl.click();

      expect(closedSpy).toHaveBeenCalledOnce();
    });

    it('should not emit closed again from the timer after the button was clicked', () => {
      const closedSpy = vi.fn();

      fixture.componentInstance.closed.subscribe(closedSpy);

      const closeButtonEl: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.app-toast__close-button',
      );

      closeButtonEl.click();

      vi.advanceTimersByTime(DEFAULT_NOTIFICATION_DELAY_MS);

      expect(closedSpy).toHaveBeenCalledOnce();
    });
  });

  describe('угасание', () => {
    it('should emit closed after default delay when delayMs is not given', () => {
      const closedSpy = vi.fn();

      fixture.componentInstance.closed.subscribe(closedSpy);

      vi.advanceTimersByTime(DEFAULT_NOTIFICATION_DELAY_MS - 1);
      expect(closedSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(closedSpy).toHaveBeenCalledOnce();
    });

    it('should emit closed after given delayMs, not the default', () => {
      const customFixture = TestBed.createComponent(Toast);

      customFixture.componentRef.setInput('notification', successNotification);
      customFixture.componentRef.setInput('delayMs', 1000);
      customFixture.detectChanges();

      const closedSpy = vi.fn();

      customFixture.componentInstance.closed.subscribe(closedSpy);

      vi.advanceTimersByTime(999);
      expect(closedSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(closedSpy).toHaveBeenCalledOnce();
    });

    it('should fade neighboring toasts independently', () => {
      const firstFixture = TestBed.createComponent(Toast);

      firstFixture.componentRef.setInput('notification', successNotification);
      firstFixture.componentRef.setInput('delayMs', 1000);
      firstFixture.detectChanges();

      const secondFixture = TestBed.createComponent(Toast);

      secondFixture.componentRef.setInput('notification', errorNotification);
      secondFixture.componentRef.setInput('delayMs', 2000);
      secondFixture.detectChanges();

      const firstClosedSpy = vi.fn();
      const secondClosedSpy = vi.fn();

      firstFixture.componentInstance.closed.subscribe(firstClosedSpy);
      secondFixture.componentInstance.closed.subscribe(secondClosedSpy);

      vi.advanceTimersByTime(1000);

      expect(firstClosedSpy).toHaveBeenCalledOnce();
      expect(secondClosedSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);

      expect(secondClosedSpy).toHaveBeenCalledOnce();
    });
  });
});
