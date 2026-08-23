import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, Injector, Type } from '@angular/core';

import { ModalRef } from './modal-ref';
import { ModalShell } from './modal-shell/modal-shell';

export interface ModalOptions {
  inputs?: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly _overlay = inject(Overlay);

  private readonly _injector = inject(Injector);

  open<T>(component: Type<T>, options?: ModalOptions): void {
    const modalRef = new ModalRef();

    const shellInjector = Injector.create({
      providers: [{ provide: ModalRef, useValue: modalRef }],
      parent: this._injector,
    });

    const overlayRef = this._overlay.create();
    const shellPortal = new ComponentPortal(ModalShell, null, shellInjector);
    const shellRef = overlayRef.attach(shellPortal);

    shellRef.setInput('content', component);
    shellRef.setInput('contentInputs', options?.inputs ?? {});
  }
}
