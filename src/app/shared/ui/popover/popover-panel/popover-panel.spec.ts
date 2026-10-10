import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';

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
  it('should render template from input into panel', async () => {
    await render(TestHost, { waitForStableOnRender: true });

    expect(screen.getByTestId('popover-content')).toHaveTextContent('Mock');
  });
});
