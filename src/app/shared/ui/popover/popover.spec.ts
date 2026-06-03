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

    await fixture.whenStable();
  });

  describe('rendering', () => {
    it('should not render popover content by default', () => {
      const contentEl = fixture.nativeElement.querySelector('[data-testid="popover-content"]');

      expect(contentEl).toBeNull();
    });

    it('should render popover content after host click', async () => {
      const hostEl: HTMLDivElement = fixture.nativeElement.querySelector(
        '[data-testid="popover-trigger"]',
      );

      hostEl.dispatchEvent(new Event('click'));

      fixture.detectChanges();

      await fixture.whenStable();

      const contentEl = fixture.nativeElement.querySelector('[data-testid="popover-content"]');

      expect(contentEl).toBeTruthy();
    });
  });
});
