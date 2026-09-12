import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, timer } from 'rxjs';

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

  private _fadeSubscription?: Subscription;

  ngOnInit(): void {
    this._fadeSubscription = timer(this.delayMs() ?? DEFAULT_NOTIFICATION_DELAY_MS)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.closed.emit());
  }

  close(): void {
    this._fadeSubscription?.unsubscribe();

    this.closed.emit();
  }
}
