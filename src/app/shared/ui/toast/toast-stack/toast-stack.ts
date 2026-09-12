import { Component, computed, input, output } from '@angular/core';

import { Toast } from '../toast/toast';

import { Notification } from '@shared/notifications';

const TOAST_STACK_LIMIT = 3;

export interface ToastStackItem {
  id: number;
  notification: Notification;
  delayMs?: number;
}

@Component({
  selector: 'app-toast-stack',
  imports: [Toast],
  templateUrl: './toast-stack.html',
  styleUrl: './toast-stack.scss',
  host: {
    class: 'app-toast-stack',
    role: 'status',
    'aria-live': 'polite',
  },
})
export class ToastStack {
  readonly items = input<ToastStackItem[]>([]);

  readonly closed = output<number>();

  readonly visibleItems = computed(() => this.items().slice(0, TOAST_STACK_LIMIT));
}
