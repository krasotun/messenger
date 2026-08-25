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

@Component({
  selector: 'app-test-modal-content-with-focusable',
  template: `
    <button type="button" data-testid="content-first-button">First</button>
    <button type="button" data-testid="content-last-button">Last</button>
  `,
})
class TestModalContentWithFocusable {}

/**
 * Блокировка скролла в CDK включается только для документа, который длиннее
 * вьюпорта. В тестовой среде layout не считается, поэтому длину задаем явно.
 */
// jsdom не реализует window.scroll, который CDK вызывает при снятии блокировки.
window.scroll = vi.fn();

// jsdom не считает layout: у элементов всегда нулевая геометрия, из-за чего
// InteractivityChecker CDK считает их невидимыми и focus trap не находит,
// куда переводить фокус.
Element.prototype.getClientRects = function (this: Element): DOMRectList {
  return [{}] as unknown as DOMRectList;
};

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

    it('should pass title to modal shell', () => {
      service.open(TestModalContent, { title: 'Edit profile' });

      TestBed.inject(ApplicationRef).tick();

      const titleEl = document.querySelector('.cdk-overlay-container .app-modal-shell__title');

      expect(titleEl?.textContent?.trim()).toBe('Edit profile');
    });

    it('should open without a title', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      const titleEl = document.querySelector('.cdk-overlay-container .app-modal-shell__title');

      expect(titleEl).toBeNull();
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

    it('should not open a second modal when called while a modal is already open', () => {
      service.open(TestModalContentWithInput, { inputs: { label: 'First' } });
      service.open(TestModalContentWithInput, { inputs: { label: 'Second' } });

      TestBed.inject(ApplicationRef).tick();

      const overlayContainers = document.querySelectorAll(
        '.cdk-overlay-container .cdk-overlay-pane',
      );

      expect(overlayContainers.length).toBe(1);
    });

    it('should leave the already open modal unaffected when open is called again', () => {
      service.open(TestModalContentWithInput, { inputs: { label: 'First' } });
      service.open(TestModalContentWithInput, { inputs: { label: 'Second' } });

      TestBed.inject(ApplicationRef).tick();

      const overlayContainer = document.querySelector('.cdk-overlay-container');
      const inputEl = overlayContainer?.querySelector('[data-testid="modal-input-value"]');

      expect(inputEl?.textContent?.trim()).toBe('First');
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

    it('should close modal when close button is clicked', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      const closeButtonEl = document.querySelector<HTMLButtonElement>(
        '.cdk-overlay-container .app-modal-shell__close-button',
      );

      closeButtonEl?.dispatchEvent(new MouseEvent('click'));

      TestBed.inject(ApplicationRef).tick();

      const contentEl = document.querySelector(
        '.cdk-overlay-container [data-testid="modal-content"]',
      );

      expect(contentEl).toBeNull();
    });

    it('should close modal on Escape', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      TestBed.inject(ApplicationRef).tick();

      const contentEl = document.querySelector(
        '.cdk-overlay-container [data-testid="modal-content"]',
      );

      expect(contentEl).toBeNull();
    });

    it('should close modal on backdrop click', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      const backdropEl = document.querySelector<HTMLElement>(
        '.cdk-overlay-container .cdk-overlay-backdrop',
      );

      backdropEl?.dispatchEvent(new MouseEvent('click'));

      TestBed.inject(ApplicationRef).tick();

      const contentEl = document.querySelector(
        '.cdk-overlay-container [data-testid="modal-content"]',
      );

      expect(contentEl).toBeNull();
    });

    it('should close modal when content requests close via ModalRef', () => {
      service.open(TestModalContentCapturingRef);

      TestBed.inject(ApplicationRef).tick();

      capturedModalRef?.close();

      TestBed.inject(ApplicationRef).tick();

      const contentEl = document.querySelector(
        '.cdk-overlay-container [data-testid="modal-content"]',
      );

      expect(contentEl).toBeNull();
    });

    it('should not close modal when clicking inside modal', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      const contentEl = document.querySelector<HTMLElement>(
        '.cdk-overlay-container [data-testid="modal-content"]',
      );

      contentEl?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      TestBed.inject(ApplicationRef).tick();

      const contentElAfterClick = document.querySelector(
        '.cdk-overlay-container [data-testid="modal-content"]',
      );

      expect(contentElAfterClick).toBeTruthy();
    });

    it('should destroy overlay after modal is closed', () => {
      service.open(TestModalContentCapturingRef);

      TestBed.inject(ApplicationRef).tick();

      capturedModalRef?.close();

      TestBed.inject(ApplicationRef).tick();

      const overlayPaneEl = document.querySelector('.cdk-overlay-container .cdk-overlay-pane');

      expect(overlayPaneEl).toBeNull();
    });
  });

  describe('size', () => {
    it('should apply requested size preset to modal', () => {
      service.open(TestModalContent, { size: 'large' });

      TestBed.inject(ApplicationRef).tick();

      const shellEl = document.querySelector('.cdk-overlay-container .app-modal-shell');

      expect(shellEl?.classList.contains('app-modal-shell_large')).toBe(true);
    });

    it('should apply medium size preset when size is not specified', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      const shellEl = document.querySelector('.cdk-overlay-container .app-modal-shell');

      expect(shellEl?.classList.contains('app-modal-shell_medium')).toBe(true);
    });

    // Высота нигде не задана, поэтому она равна высоте содержимого и меняется
    // вместе с ним. Конкретные пиксели не проверяем - они хрупкие.
    it('should let modal height follow its content', () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      const shellEl = document.querySelector<HTMLElement>(
        '.cdk-overlay-container .app-modal-shell',
      )!;

      expect(getComputedStyle(shellEl).height).toBe('');
    });
  });

  describe('focus', () => {
    afterEach(() => {
      document.body
        .querySelectorAll('button[data-testid="opener-button"]')
        .forEach((element) => element.remove());
    });

    it('should move focus inside modal after opening', async () => {
      service.open(TestModalContent);

      TestBed.inject(ApplicationRef).tick();

      await new Promise((resolve) => setTimeout(resolve));

      const overlayContainer = document.querySelector('.cdk-overlay-container');

      expect(overlayContainer?.contains(document.activeElement)).toBe(true);
    });

    it('should keep focus inside modal when Tab is pressed on the last focusable element', async () => {
      service.open(TestModalContentWithFocusable);

      TestBed.inject(ApplicationRef).tick();

      await new Promise((resolve) => setTimeout(resolve));

      const overlayContainer = document.querySelector('.cdk-overlay-container') as HTMLElement;
      const anchors = overlayContainer.querySelectorAll<HTMLElement>('.cdk-focus-trap-anchor');
      const endAnchor = anchors[anchors.length - 1];

      endAnchor.focus();

      expect(overlayContainer.contains(document.activeElement)).toBe(true);
      expect(document.activeElement?.classList.contains('cdk-focus-trap-anchor')).toBe(false);
    });

    it('should keep focus inside modal when Shift+Tab is pressed on the first focusable element', async () => {
      service.open(TestModalContentWithFocusable);

      TestBed.inject(ApplicationRef).tick();

      await new Promise((resolve) => setTimeout(resolve));

      const overlayContainer = document.querySelector('.cdk-overlay-container') as HTMLElement;
      const startAnchor = overlayContainer.querySelector<HTMLElement>('.cdk-focus-trap-anchor')!;

      startAnchor.focus();

      expect(overlayContainer.contains(document.activeElement)).toBe(true);
      expect(document.activeElement?.classList.contains('cdk-focus-trap-anchor')).toBe(false);
    });

    it('should restore focus to previously focused element after closing', async () => {
      const openerButtonEl = document.createElement('button');
      openerButtonEl.setAttribute('data-testid', 'opener-button');
      document.body.append(openerButtonEl);
      openerButtonEl.focus();

      service.open(TestModalContentCapturingRef);

      TestBed.inject(ApplicationRef).tick();

      await new Promise((resolve) => setTimeout(resolve));

      expect(document.activeElement).not.toBe(openerButtonEl);

      capturedModalRef?.close();

      TestBed.inject(ApplicationRef).tick();

      await new Promise((resolve) => setTimeout(resolve));

      expect(document.activeElement).toBe(openerButtonEl);
    });
  });
});
