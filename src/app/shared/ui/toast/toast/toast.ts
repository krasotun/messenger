import { Component, computed, input, OnDestroy, OnInit, output } from '@angular/core';

import { DEFAULT_NOTIFICATION_DELAY_MS, Notification } from '@shared/notifications';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  host: {
    '[class]': 'hostClass()',
  },
})
export class Toast implements OnInit, OnDestroy {
  readonly notification = input.required<Notification>();

  readonly delayMs = input<number>();

  readonly closed = output<void>();

  readonly hostClass = computed(() => `app-toast app-toast_${this.notification().kind}`);

  private _fadeTimeoutId?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this._fadeTimeoutId = setTimeout(
      () => this.closed.emit(),
      this.delayMs() ?? DEFAULT_NOTIFICATION_DELAY_MS,
    );
  }

  ngOnDestroy(): void {
    clearTimeout(this._fadeTimeoutId);
  }

  close(): void {
    clearTimeout(this._fadeTimeoutId);

    this.closed.emit();
  }
}
