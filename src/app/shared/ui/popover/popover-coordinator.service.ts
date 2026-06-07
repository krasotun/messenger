import { Injectable } from '@angular/core';

import { PopoverHandle } from './popover-handle';

import { Nullable } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class PopoverCoordinator {
  private _activePopoverHandle: Nullable<PopoverHandle> = null;

  activate(popoverHandle: PopoverHandle): void {
    if (this._activePopoverHandle && this._activePopoverHandle !== popoverHandle) {
      this._activePopoverHandle.close();
    }

    this._activePopoverHandle = popoverHandle;
  }

  deactivate(popoverHandle: PopoverHandle): void {
    if (this._activePopoverHandle === popoverHandle) {
      this._activePopoverHandle = null;
    }
  }
}
