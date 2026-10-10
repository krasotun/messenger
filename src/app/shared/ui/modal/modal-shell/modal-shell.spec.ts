import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { render, screen, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { ModalRef } from '../modal-ref';

import { ModalShell } from './modal-shell';

@Component({
  selector: 'app-test-shell-content',
  template: `<div data-testid="shell-content">Content</div>`,
})
class TestShellContent {}

@Component({
  imports: [ModalShell],
  template: `<app-modal-shell [content]="content" [title]="title()"></app-modal-shell>`,
})
class TestHost {
  readonly content = TestShellContent;

  readonly title = signal<string | undefined>(undefined);
}

describe('ModalShell', () => {
  let fixture: ComponentFixture<TestHost>;
  let container: HTMLElement;

  async function renderWithTitle(title: string | undefined): Promise<void> {
    fixture.componentInstance.title.set(title);

    await fixture.whenStable();
  }

  const getCloseButton = (): HTMLElement => screen.getByRole('button', { name: 'Close' });

  // Шапка - элемент раскладки без роли: ищется по классу.
  const getHeader = (): HTMLElement =>
    container.querySelector('.app-modal-shell__header') as HTMLElement;

  beforeEach(async () => {
    ({ fixture, container } = await render(TestHost, {
      providers: [ModalRef],
      waitForStableOnRender: true,
    }));
  });

  it('should render content component inside shell', () => {
    expect(within(screen.getByRole('dialog')).getByTestId('shell-content')).toBeInTheDocument();
  });

  it('should render always visible close button', () => {
    expect(getCloseButton()).toBeVisible();
  });

  it('should name the close button for a screen reader', () => {
    expect(getCloseButton()).toHaveAccessibleName('Close');
  });

  it('should call ModalRef.close() when close button is clicked', async () => {
    const modalRef = TestBed.inject(ModalRef);

    vi.spyOn(modalRef, 'close');

    await userEvent.setup().click(getCloseButton());

    expect(modalRef.close).toHaveBeenCalled();
  });

  describe('content padding', () => {
    // Конкретные пиксели не проверяем - они хрупкие. Утверждение теста в том,
    // что содержимое вообще отделено от границ окна.
    it('should separate content from shell edges', () => {
      const { paddingTop, paddingRight, paddingBottom, paddingLeft } = getComputedStyle(
        screen.getByRole('dialog'),
      );

      for (const padding of [paddingTop, paddingRight, paddingBottom, paddingLeft]) {
        expect(parseFloat(padding)).toBeGreaterThan(0);
      }
    });
  });

  describe('header', () => {
    it('should place title and close button in the same row', async () => {
      await renderWithTitle('Edit profile');

      const header = within(getHeader());

      expect(header.getByRole('heading', { name: 'Edit profile' })).toBeInTheDocument();
      expect(header.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should render given title', async () => {
      await renderWithTitle('Edit profile');

      expect(screen.getByRole('heading', { name: 'Edit profile' })).toBeInTheDocument();
    });

    it('should keep close button in header when title is not given', () => {
      const header = within(getHeader());

      expect(header.queryByRole('heading')).not.toBeInTheDocument();
      expect(header.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('accessible name', () => {
    it('should expose shell as a dialog', () => {
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should name the dialog by its title', async () => {
      await renderWithTitle('Edit profile');

      expect(screen.getByRole('dialog', { name: 'Edit profile' })).toBeInTheDocument();
    });

    it('should not reference a title when it is not given', () => {
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
    });
  });
});
