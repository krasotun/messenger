import { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directive, ElementRef, inject, input, OnDestroy, TemplateRef } from '@angular/core';
import { filter, merge, takeUntil } from 'rxjs';

import { PopoverCoordinator } from './popover-coordinator.service';
import { PopoverPanel } from './popover-panel/popover-panel';

import { Nullable } from '@shared/types';

@Directive({
  selector: '[appPopover]',
  host: {
    '(click)': 'onClick()',
  },
})
export class Popover implements OnDestroy {
  readonly content = input.required<TemplateRef<unknown>>({ alias: 'appPopover' });

  private readonly _popoverCoordinator = inject(PopoverCoordinator);

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
    this._popoverCoordinator.activate(this);

    this._setSubscriptions(overlayRef);
  }

  close(): void {
    if (!this._overlayRef) {
      return;
    }

    this._closePopover();
  }

  ngOnDestroy(): void {
    this._closePopover();
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

  private _setSubscriptions(overlayRef: OverlayRef): void {
    const keydownEvents$ = overlayRef.keydownEvents().pipe(filter(({ key }) => key === 'Escape'));

    const pointerEvents$ = overlayRef.outsidePointerEvents().pipe(
      filter(({ target }) => {
        const triggerEl = this._elementRef.nativeElement;

        return !triggerEl.contains(target);
      }),
    );

    merge(keydownEvents$, pointerEvents$)
      .pipe(takeUntil(overlayRef.detachments()))
      .subscribe(() => this.close());
  }

  private _closePopover(): void {
    this._overlayRef?.dispose();

    this._overlayRef = null;

    this._popoverCoordinator.deactivate(this);
  }
}
