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

let capturedModalRef: ModalRef | null = null;

@Component({
  selector: 'app-test-modal-content-capturing-ref',
  template: `<div data-testid="modal-content">Content</div>`,
})
class TestModalContentCapturingRef {
  readonly modalRef = inject(ModalRef);

  constructor() {
    capturedModalRef = this.modalRef;
  }
}

/**
 * Блокировка скролла в CDK включается только для документа, который длиннее
 * вьюпорта. В тестовой среде layout не считается, поэтому длину задаем явно.
 */
// jsdom не реализует window.scroll, который CDK вызывает при снятии блокировки.
window.scroll = vi.fn();

function makeDocumentScrollable(): void {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 10_000,
    configurable: true,
  });
}

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);

    capturedModalRef = null;

    makeDocumentScrollable();
  });

  afterEach(() => {
    document.body.querySelectorAll('.cdk-overlay-container').forEach((element) => element.remove());

    document.documentElement.classList.remove('cdk-global-scrollblock');

    Reflect.deleteProperty(document.documentElement, 'scrollHeight');
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

    it('should dim application behind modal', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      const backdropEl = document.querySelector(
        '.cdk-overlay-container .cdk-overlay-dark-backdrop',
      );

      expect(backdropEl).toBeTruthy();
    });

    it('should block application scroll while modal is open', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(true);
    });

    it('should center modal and keep it centered after window resize', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      const wrapperEl = document.querySelector<HTMLElement>('.cdk-global-overlay-wrapper');

      expect(wrapperEl?.style.justifyContent).toBe('center');
      expect(wrapperEl?.style.alignItems).toBe('center');

      window.dispatchEvent(new Event('resize'));

      TestBed.inject(ApplicationRef).tick();

      expect(wrapperEl?.style.justifyContent).toBe('center');
      expect(wrapperEl?.style.alignItems).toBe('center');
    });
  });

  describe('close', () => {
    it('should restore application scroll after modal is closed', () => {
      service.open(TestModalContentCapturingRef);

      TestBed.inject(ApplicationRef).tick();

      expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(true);

      capturedModalRef?.close();

      TestBed.inject(ApplicationRef).tick();

      expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(false);
    });
  });
});
