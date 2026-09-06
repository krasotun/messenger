import { InjectionToken } from '@angular/core';

export interface Notifier {
  success(title: string, text: string, delayMs?: number): void;
  error(title: string, text: string, delayMs?: number): void;
}

export const NOTIFIER = new InjectionToken<Notifier>('NOTIFIER');
