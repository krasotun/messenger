import { ApplicationRef, Component, inject, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ModalRef } from './modal-ref';
import { ModalService } from './modal-service';

@Component({
  selector: 'app-test-modal-content',
  template: `<div data-testid="modal-content">Content</div>`,
})
class TestModalContent {}

@Component({
  selector: 'app-test-modal-content-with-ref',
  template: `<div data-testid="modal-ref-injected">{{ isModalRefInjected }}</div>`,
})
class TestModalContentWithRef {
  private readonly _modalRef = inject(ModalRef);

  readonly isModalRefInjected = this._modalRef instanceof ModalRef;
}

@Component({
  selector: 'app-test-modal-content-with-input',
  template: `<div data-testid="modal-input-value">{{ label() }}</div>`,
})
class TestModalContentWithInput {
  readonly label = input('');
}

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  afterEach(() => {
    document.body.querySelectorAll('.cdk-overlay-container').forEach((element) => element.remove());
  });

  describe('open', () => {
    it('should render content component inside modal', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      const overlayContainer = document.querySelector('.cdk-overlay-container');
      const contentEl = overlayContainer?.querySelector('[data-testid="modal-content"]');

      expect(contentEl).toBeTruthy();
    });

    it('should provide ModalRef to content component via DI', () => {
      service.open(TestModalContentWithRef);

      TestBed.inject(ApplicationRef).tick();

      const overlayContainer = document.querySelector('.cdk-overlay-container');
      const modalRefEl = overlayContainer?.querySelector('[data-testid="modal-ref-injected"]');

      expect(modalRefEl?.textContent?.trim()).toBe('true');
    });

    it('should pass inputs to content component', () => {
      service.open(TestModalContentWithInput, { inputs: { label: 'Hello' } });

      TestBed.inject(ApplicationRef).tick();

      const overlayContainer = document.querySelector('.cdk-overlay-container');
      const inputEl = overlayContainer?.querySelector('[data-testid="modal-input-value"]');

      expect(inputEl?.textContent?.trim()).toBe('Hello');
    });
  });
});
