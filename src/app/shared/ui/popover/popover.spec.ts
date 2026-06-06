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

@Component({
  imports: [Popover],
  template: `
    <div data-testid="first-popover-trigger" [appPopover]="firstContent"></div>
    <div data-testid="second-popover-trigger" [appPopover]="secondContent"></div>

    <ng-template #firstContent>
      <div data-testid="first-popover-content">First popover content</div>
    </ng-template>

    <ng-template #secondContent>
      <div data-testid="second-popover-content">Second popover content</div>
    </ng-template>
  `,
})
class TestHostWithTwoTriggers {}

describe('Popover', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost, TestHostWithTwoTriggers],
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

    it('should render only one popover when another trigger is clicked', async () => {
      const fixtureWithTwoTriggers = TestBed.createComponent(TestHostWithTwoTriggers);
      fixtureWithTwoTriggers.detectChanges();
      await fixtureWithTwoTriggers.whenStable();

      const firstTriggerEl: HTMLDivElement = fixtureWithTwoTriggers.nativeElement.querySelector(
        '[data-testid="first-popover-trigger"]',
      );
      const secondTriggerEl: HTMLDivElement = fixtureWithTwoTriggers.nativeElement.querySelector(
        '[data-testid="second-popover-trigger"]',
      );

      firstTriggerEl.dispatchEvent(new Event('click'));
      fixtureWithTwoTriggers.detectChanges();
      await fixtureWithTwoTriggers.whenStable();

      const firstPopoverContent = document.querySelector(
        '.cdk-overlay-container [data-testid="first-popover-content"]',
      );

      expect(firstPopoverContent).toBeTruthy();

      secondTriggerEl.dispatchEvent(new Event('click'));
      fixtureWithTwoTriggers.detectChanges();
      await fixtureWithTwoTriggers.whenStable();

      const firstPopoverContentAfterSecondClick = document.querySelector(
        '.cdk-overlay-container [data-testid="first-popover-content"]',
      );
      const secondPopoverContent = document.querySelector(
        '.cdk-overlay-container [data-testid="second-popover-content"]',
      );
      const popoverPanels = document.querySelectorAll('.cdk-overlay-container .app-popover-panel');

      expect(firstPopoverContentAfterSecondClick).toBeNull();
      expect(secondPopoverContent).toBeTruthy();
      expect(popoverPanels).toHaveLength(1);
    });
  });
});
