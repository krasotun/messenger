import { DOCUMENT, inject, Injectable } from '@angular/core';

import { Nullable } from '@app/shared/types';

@Injectable({
  providedIn: 'root',
})
export class OverlayService {
  private readonly _document = inject(DOCUMENT);

  private readonly _containerSelector = '[data-app-overlay-container]';
  private readonly _containerAttribute = 'data-app-overlay-container';

  private _cachedContainer: Nullable<HTMLDivElement> = null;

  getContainer(): HTMLDivElement {
    if (this._cachedContainer) {
      return this._cachedContainer;
    }

    const existingContainer = this._findContainer();

    if (existingContainer) {
      this._cachedContainer = existingContainer;

      return existingContainer;
    }

    const container = this._createContainer();

    this._cachedContainer = container;

    this._document.body.appendChild(container);

    return container;
  }

  private _findContainer(): Nullable<HTMLDivElement> {
    return this._document.body.querySelector(this._containerSelector);
  }

  private _createContainer(): HTMLDivElement {
    const overlayContainer = this._document.createElement('div');

    overlayContainer.setAttribute(this._containerAttribute, '');

    return overlayContainer;
  }
}
