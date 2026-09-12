import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { race, Subject, timer } from 'rxjs';

import { DEFAULT_NOTIFICATION_DELAY_MS, Notification } from '@shared/notifications';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  host: {
    class: 'app-toast',
    '[class.app-toast_success]': "notification().kind === 'success'",
    '[class.app-toast_error]': "notification().kind === 'error'",
  },
})
export class Toast implements OnInit {
  readonly notification = input.required<Notification>();

  readonly delayMs = input<number>();

  readonly closed = output<void>();

  private readonly _destroyRef = inject(DestroyRef);

  private readonly _closeRequested$ = new Subject<void>();

  // Крестик не уничтожает компонент - убирает уведомление стек, получив
  // closed. Поэтому истекший интервал и нажатый крестик гонятся: тот, кто
  // пришел первым, отменяет второго, и closed уходит ровно один раз.
  ngOnInit(): void {
    race(timer(this.delayMs() ?? DEFAULT_NOTIFICATION_DELAY_MS), this._closeRequested$)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.closed.emit());
  }

  close(): void {
    this._closeRequested$.next();
  }
}
