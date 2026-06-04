import { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directive, ElementRef, inject, input, OnDestroy, TemplateRef } from '@angular/core';

import { PopoverPanel } from './popover-panel/popover-panel';

import { Nullable } from '@app/shared/types';

@Directive({
  selector: '[appPopover]',
  host: {
    '(click)': 'onClick()',
  },
})
export class Popover implements OnDestroy {
  readonly content = input.required<TemplateRef<unknown>>({ alias: 'appPopover' });

  private readonly _elementRef = inject(ElementRef);

  private readonly _overlay = inject(Overlay);
  private _overlayRef: Nullable<OverlayRef> = null;

  onClick(): void {
    if (this._overlayRef) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this._overlayRef) {
      return;
    }

    const positionStrategy = this._createPositionStrategy();
    const overlayRef = this._createOverlayRef(positionStrategy);

    this._attachPopoverPanel(overlayRef);
  }

  close(): void {
    if (!this._overlayRef) {
      return;
    }

    this._disposeOverlayRef();
  }

  ngOnDestroy(): void {
    this._disposeOverlayRef();
  }

  private _createPositionStrategy(): FlexibleConnectedPositionStrategy {
    return this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
      ]);
  }

  private _createOverlayRef(positionStrategy: FlexibleConnectedPositionStrategy): OverlayRef {
    return this._overlay.create({ positionStrategy });
  }

  private _attachPopoverPanel(overlayRef: OverlayRef): void {
    this._overlayRef = overlayRef;

    const componentPortal = new ComponentPortal(PopoverPanel);

    const panelRef = overlayRef.attach(componentPortal);

    panelRef.setInput('content', this.content());
  }

  private _disposeOverlayRef(): void {
    this._overlayRef?.dispose();

    this._overlayRef = null;
  }
}
