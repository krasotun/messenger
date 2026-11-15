import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

import { DEFAULT_NOTIFICATION_DELAY_MS, NotificationKind, Notifier } from '@shared/notifications';

// Адаптер порта NOTIFIER над сервисом сообщений кита. Предел одновременных
// уведомлений и порядок задает кит; интервал по умолчанию - наш, у кита свой.
@Injectable({
  providedIn: 'root',
})
export class PrimeNotifier implements Notifier {
  private readonly _messageService = inject(MessageService);

  success(title: string, text: string, delayMs?: number): void {
    this._show('success', title, text, delayMs);
  }

  error(title: string, text: string, delayMs?: number): void {
    this._show('error', title, text, delayMs);
  }

  private _show(severity: NotificationKind, title: string, text: string, delayMs?: number): void {
    this._messageService.add({
      severity,
      summary: title,
      detail: text,
      life: delayMs ?? DEFAULT_NOTIFICATION_DELAY_MS,
    });
  }
}
