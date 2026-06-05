import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Popover } from '../popover/popover';

@Component({
  imports: [Popover],
  template: `
    <div data-testid="popover-trigger" [appPopover]="content"></div>
    <ng-template #content>
      <div data-testid="popover-content">Popover content</div>
    </ng-template>
  `,
})
class TestHost {}

describe('Popover', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);

    fixture.detectChanges();

    await fixture.whenStable();
  });

  afterEach(() => {
    document.body.querySelectorAll('.cdk-overlay-container').forEach((element) => element.remove());
  });

  describe('rendering', () => {
    it('should not render popover content by default', () => {
      const contentEl = fixture.nativeElement.querySelector('[data-testid="popover-content"]');

      expect(contentEl).toBeNull();
    });

    it('should create popover panel in CDK overlay container after host click', async () => {
      const hostEl: HTMLDivElement = fixture.nativeElement.querySelector(
        '[data-testid="popover-trigger"]',
      );

      hostEl.dispatchEvent(new Event('click'));

      fixture.detectChanges();

      await fixture.whenStable();

      const overlayContainer = document.querySelector('.cdk-overlay-container');

      const popoverPanel = overlayContainer?.querySelector('.app-popover-panel');

      expect(popoverPanel).toBeTruthy();
    });

    it('should remove popover after second click', async () => {
      const hostEl: HTMLDivElement = fixture.nativeElement.querySelector(
        '[data-testid="popover-trigger"]',
      );

      hostEl.dispatchEvent(new Event('click'));

      fixture.detectChanges();

      await fixture.whenStable();

      const overlayContainer = document.querySelector('.cdk-overlay-container');

      const popoverPanel = overlayContainer?.querySelector('.app-popover-panel');

      expect(popoverPanel).toBeTruthy();

      hostEl.dispatchEvent(new Event('click'));

      fixture.detectChanges();
      await fixture.whenStable();

      const secondPopoverPanel = document.querySelector(
        '.cdk-overlay-container .app-popover-panel',
      );

      expect(secondPopoverPanel).toBeNull();
    });

    it('Escape should remove popover', async () => {
      const hostEl: HTMLDivElement = fixture.nativeElement.querySelector(
        '[data-testid="popover-trigger"]',
      );

      hostEl.dispatchEvent(new Event('click'));

      fixture.detectChanges();

      await fixture.whenStable();

      const overlayContainer = document.querySelector('.cdk-overlay-container');

      const popoverPanel = overlayContainer?.querySelector('.app-popover-panel');

      expect(popoverPanel).toBeTruthy();

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      fixture.detectChanges();

      await fixture.whenStable();

      const secondPopoverPanel = document.querySelector(
        '.cdk-overlay-container .app-popover-panel',
      );

      expect(secondPopoverPanel).toBeNull();
    });

    it('outside click should remove popover', async () => {
      const hostEl: HTMLDivElement = fixture.nativeElement.querySelector(
        '[data-testid="popover-trigger"]',
      );

      hostEl.dispatchEvent(new Event('click'));

      fixture.detectChanges();

      await fixture.whenStable();

      const overlayContainer = document.querySelector('.cdk-overlay-container');

      const popoverPanel = overlayContainer?.querySelector('.app-popover-panel');

      expect(popoverPanel).toBeTruthy();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      fixture.detectChanges();
      await fixture.whenStable();

      const secondPopoverPanel = document.querySelector(
        '.cdk-overlay-container .app-popover-panel',
      );

      expect(secondPopoverPanel).toBeNull();
    });
  });
});
