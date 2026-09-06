import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, Injector, Type } from '@angular/core';
import { filter, merge, takeUntil } from 'rxjs';

import { ModalRef } from './modal-ref';
import { ModalShell } from './modal-shell/modal-shell';
import { DEFAULT_MODAL_SIZE } from './modal-size.constants';
import { ModalSize } from './modal-size.type';

const ESCAPE_KEY = 'Escape';

export interface ModalOptions {
  inputs?: Record<string, unknown>;
  size?: ModalSize;
  title?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly _overlay = inject(Overlay);

  private readonly _injector = inject(Injector);

  private _activeOverlayRef: OverlayRef | null = null;

  open<T>(component: Type<T>, options?: ModalOptions): void {
    if (this._activeOverlayRef) {
      return;
    }

    const modalRef = new ModalRef();

    const overlayRef = this._createOverlayRef();

    this._activeOverlayRef = overlayRef;

    this._attachModalShell(overlayRef, modalRef, component, options);

    this._setSubscriptions(overlayRef, modalRef);
  }

  private _createOverlayRef(): OverlayRef {
    const positionStrategy = this._overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    return this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.block(),
      hasBackdrop: true,
    });
  }

  private _attachModalShell<T>(
    overlayRef: OverlayRef,
    modalRef: ModalRef,
    component: Type<T>,
    options?: ModalOptions,
  ): void {
    const shellInjector = Injector.create({
      providers: [{ provide: ModalRef, useValue: modalRef }],
      parent: this._injector,
    });

    const shellPortal = new ComponentPortal(ModalShell, null, shellInjector);
    const shellRef = overlayRef.attach(shellPortal);

    shellRef.setInput('content', component);
    shellRef.setInput('contentInputs', options?.inputs ?? {});
    shellRef.setInput('size', options?.size ?? DEFAULT_MODAL_SIZE);
    shellRef.setInput('title', options?.title);
  }

  private _setSubscriptions(overlayRef: OverlayRef, modalRef: ModalRef): void {
    const escape$ = overlayRef.keydownEvents().pipe(filter(({ key }) => key === ESCAPE_KEY));
    const backdropClick$ = overlayRef.backdropClick();

    merge(escape$, backdropClick$)
      .pipe(takeUntil(overlayRef.detachments()))
      .subscribe(() => modalRef.close());

    modalRef.closeRequested$
      .pipe(takeUntil(overlayRef.detachments()))
      .subscribe(() => overlayRef.dispose());

    overlayRef.detachments().subscribe(() => {
      if (this._activeOverlayRef === overlayRef) {
        this._activeOverlayRef = null;
      }
    });
  }
}
