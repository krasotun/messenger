import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';

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
  let user: UserEvent;

  // Панель открывается в CDK overlay, вне корня хоста: поиск идет по screen.
  const queryPanels = (): NodeListOf<Element> =>
    document.querySelectorAll('.cdk-overlay-container .app-popover-panel');

  const openPopover = async (): Promise<void> => {
    await user.click(screen.getByTestId('popover-trigger'));

    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    document.body.querySelectorAll('.cdk-overlay-container').forEach((element) => element.remove());
  });

  const renderHost = () => render(TestHost, { waitForStableOnRender: true });

  describe('rendering', () => {
    it('should not render popover content by default', async () => {
      await renderHost();

      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
    });

    it('should create popover panel in CDK overlay container after host click', async () => {
      await renderHost();

      await openPopover();

      expect(
        screen.getByTestId('popover-content').closest('.cdk-overlay-container'),
      ).not.toBeNull();
      expect(queryPanels()).toHaveLength(1);
    });

    it('should remove popover after second click', async () => {
      await renderHost();

      await openPopover();

      await user.click(screen.getByTestId('popover-trigger'));

      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      expect(queryPanels()).toHaveLength(0);
    });

    it('Escape should remove popover', async () => {
      await renderHost();

      await openPopover();

      await user.keyboard('{Escape}');

      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      expect(queryPanels()).toHaveLength(0);
    });

    it('outside click should remove popover', async () => {
      await renderHost();

      await openPopover();

      await user.click(document.body);

      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      expect(queryPanels()).toHaveLength(0);
    });

    it('should render only one popover when another trigger is clicked', async () => {
      await render(TestHostWithTwoTriggers, { waitForStableOnRender: true });

      await user.click(screen.getByTestId('first-popover-trigger'));

      expect(screen.getByTestId('first-popover-content')).toBeInTheDocument();

      await user.click(screen.getByTestId('second-popover-trigger'));

      expect(screen.queryByTestId('first-popover-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('second-popover-content')).toBeInTheDocument();
      expect(queryPanels()).toHaveLength(1);
    });
  });
});
