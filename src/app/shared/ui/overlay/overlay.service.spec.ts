import { TestBed } from '@angular/core/testing';

import { OverlayService } from './overlay.service';

describe('OverlayService', () => {
  let service: OverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlayService);
  });

  afterEach(() => {
    document.body
      .querySelectorAll('[data-app-overlay-container]')
      .forEach((element) => element.remove());
  });

  it('creates overlay container in document body', () => {
    const container = service.getContainer();

    expect(document.body.contains(container)).toBeTruthy();

    expect(container.hasAttribute('data-app-overlay-container')).toBe(true);
  });

  it('returns the same container on repeated calls', () => {
    const first = service.getContainer();
    const second = service.getContainer();

    expect(second).toBe(first);

    const containers = document.body.querySelectorAll('[data-app-overlay-container]');
    expect(containers.length).toBe(1);
  });

  it('uses existing overlay container from document body', () => {
    const overlayContainer = document.createElement('div');
    overlayContainer.setAttribute('data-app-overlay-container', '');

    document.body.appendChild(overlayContainer);

    const container = service.getContainer();
    expect(container).toBe(overlayContainer);

    expect(document.body.querySelectorAll('[data-app-overlay-container]').length).toBe(1);
  });
});
