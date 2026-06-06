import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverPanel } from './popover-panel';

@Component({
  imports: [PopoverPanel],
  template: `
    <app-popover-panel [content]="mockContent"></app-popover-panel>
    <ng-template #mockContent>
      <div data-testid="popover-content">Mock</div>
    </ng-template>
  `,
})
class TestHost {}

describe('PopoverPanel', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);

    fixture.detectChanges();

    await fixture.whenStable();
  });

  it('should render template from input into panel', () => {
    const panelEl = fixture.nativeElement.querySelector('.app-popover-panel');
    const contentEl = panelEl.querySelector('[data-testid="popover-content"]');

    expect(contentEl).toBeTruthy();

    expect(contentEl.textContent.trim()).toBe('Mock');
  });
});
