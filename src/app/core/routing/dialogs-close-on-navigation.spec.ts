import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen, waitFor } from '@testing-library/angular/zoneless';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';

import { provideDialogsCloseOnNavigation } from './dialogs-close-on-navigation';

@Component({
  selector: 'app-test-page',
  template: '',
})
class TestPage {}

// Окно подтверждения кит рисует там, где стоит <p-confirmdialog>, - как в app.html.
@Component({
  selector: 'app-test-host',
  imports: [ConfirmDialog],
  template: '<p-confirmdialog />',
})
class TestHost {}

@Component({
  selector: 'app-test-dialog-content',
  template: '<p>Dialog content</p>',
})
class TestDialogContent {}

describe('provideDialogsCloseOnNavigation', () => {
  const queryContent = (): HTMLElement | null => screen.queryByText('Dialog content');

  const openDialog = async (): Promise<void> => {
    TestBed.inject(DialogService).open(TestDialogContent, { header: 'Test dialog' });

    await screen.findByText('Dialog content');
  };

  beforeEach(async () => {
    await render(TestHost, {
      providers: [
        DialogService,
        ConfirmationService,
        provideRouter([
          { path: 'first', component: TestPage },
          { path: 'second', component: TestPage },
          { path: 'forbidden', component: TestPage, canActivate: [() => false] },
        ]),
        provideDialogsCloseOnNavigation(),
      ],
      waitForStableOnRender: true,
    });

    await TestBed.inject(Router).navigateByUrl('/first');
    await openDialog();
  });

  it('should close the open dialog when a navigation ends', async () => {
    await TestBed.inject(Router).navigateByUrl('/second');

    await waitFor(() => expect(queryContent()).not.toBeInTheDocument());
  });

  it('should keep the open dialog when the navigation is cancelled', async () => {
    const isNavigated = await TestBed.inject(Router).navigateByUrl('/forbidden');

    expect(isNavigated).toBe(false);
    expect(queryContent()).toBeInTheDocument();
  });

  it('should close the open confirmation without accepting it when a navigation ends', async () => {
    const accept = vi.fn();

    TestBed.inject(ConfirmationService).confirm({
      header: 'Delete chat',
      message: 'Delete the chat?',
      accept,
    });
    await screen.findByText('Delete the chat?');

    await TestBed.inject(Router).navigateByUrl('/second');

    await waitFor(() => expect(screen.queryByText('Delete the chat?')).not.toBeInTheDocument());
    expect(accept).not.toHaveBeenCalled();
  });
});
