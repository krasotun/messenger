import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { effect, inject, Injectable, Injector, signal } from '@angular/core';

import { ToastStack, ToastStackItem } from './toast-stack/toast-stack';

import { Notification, Notifier } from '@shared/notifications';

@Injectable({
  providedIn: 'root',
})
export class ToastService implements Notifier {
  private readonly _overlay = inject(Overlay);

  private readonly _injector = inject(Injector);

  private readonly _items = signal<ToastStackItem[]>([]);

  private _overlayRef: OverlayRef | null = null;

  private _nextId = 0;

  success(title: string, text: string, delayMs?: number): void {
    this._show({ kind: 'success', title, text }, delayMs);
  }

  error(title: string, text: string, delayMs?: number): void {
    this._show({ kind: 'error', title, text }, delayMs);
  }

  private _show(notification: Notification, delayMs?: number): void {
    const item: ToastStackItem = { id: this._nextId++, notification, delayMs };

    this._items.update((items) => [item, ...items]);

    this._ensureOverlay();
  }

  private _ensureOverlay(): void {
    if (this._overlayRef) {
      return;
    }

    const positionStrategy = this._overlay.position().global().top().right();

    this._overlayRef = this._overlay.create({ positionStrategy, hasBackdrop: false });

    const portal = new ComponentPortal(ToastStack, null, this._injector);
    const stackRef = this._overlayRef.attach(portal);

    stackRef.instance.closed.subscribe((id: number) => this._remove(id));

    effect(() => stackRef.setInput('items', this._items()), { injector: this._injector });
  }

  private _remove(id: number): void {
    this._items.update((items) => items.filter((item) => item.id !== id));

    if (this._items().length === 0 && this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }
}
