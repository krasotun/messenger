import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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

  async function renderWithTitle(title: string | undefined): Promise<void> {
    fixture.componentInstance.title.set(title);

    fixture.detectChanges();

    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [ModalRef],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);

    fixture.detectChanges();

    await fixture.whenStable();
  });

  it('should render content component inside shell', () => {
    const shellEl = fixture.nativeElement.querySelector('.app-modal-shell');
    const contentEl = shellEl.querySelector('[data-testid="shell-content"]');

    expect(contentEl).toBeTruthy();
  });

  it('should render always visible close button', () => {
    const closeButtonEl = fixture.nativeElement.querySelector('.app-modal-shell__close-button');

    expect(closeButtonEl).toBeTruthy();
  });

  it('should call ModalRef.close() when close button is clicked', () => {
    const modalRef = TestBed.inject(ModalRef);

    vi.spyOn(modalRef, 'close');

    const closeButtonEl: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.app-modal-shell__close-button',
    );

    closeButtonEl.dispatchEvent(new MouseEvent('click'));

    fixture.detectChanges();

    expect(modalRef.close).toHaveBeenCalled();
  });

  describe('content padding', () => {
    // Конкретные пиксели не проверяем - они хрупкие. Утверждение теста в том,
    // что содержимое вообще отделено от границ окна.
    it('should separate content from shell edges', () => {
      const shellEl: HTMLElement = fixture.nativeElement.querySelector('.app-modal-shell');

      const { paddingTop, paddingRight, paddingBottom, paddingLeft } = getComputedStyle(shellEl);

      for (const padding of [paddingTop, paddingRight, paddingBottom, paddingLeft]) {
        expect(parseFloat(padding)).toBeGreaterThan(0);
      }
    });
  });

  describe('header', () => {
    it('should place title and close button in the same row', async () => {
      await renderWithTitle('Edit profile');

      const headerEl: HTMLElement = fixture.nativeElement.querySelector('.app-modal-shell__header');

      expect(headerEl).toBeTruthy();

      const titleEl = headerEl.querySelector('.app-modal-shell__title');
      const closeButtonEl = headerEl.querySelector('.app-modal-shell__close-button');

      expect(titleEl).toBeTruthy();
      expect(closeButtonEl).toBeTruthy();
    });

    it('should render given title', async () => {
      await renderWithTitle('Edit profile');

      const titleEl: HTMLElement = fixture.nativeElement.querySelector('.app-modal-shell__title');

      expect(titleEl.textContent?.trim()).toBe('Edit profile');
    });

    it('should keep close button in header when title is not given', () => {
      const headerEl: HTMLElement = fixture.nativeElement.querySelector('.app-modal-shell__header');

      expect(headerEl.querySelector('.app-modal-shell__title')).toBeNull();
      expect(headerEl.querySelector('.app-modal-shell__close-button')).toBeTruthy();
    });
  });

  describe('accessible name', () => {
    it('should expose shell as a dialog', () => {
      const shellEl: HTMLElement = fixture.nativeElement.querySelector('.app-modal-shell');

      expect(shellEl.getAttribute('role')).toBe('dialog');
      expect(shellEl.getAttribute('aria-modal')).toBe('true');
    });

    it('should name the dialog by its title', async () => {
      await renderWithTitle('Edit profile');

      const shellEl: HTMLElement = fixture.nativeElement.querySelector('.app-modal-shell');
      const titleEl: HTMLElement = fixture.nativeElement.querySelector('.app-modal-shell__title');

      expect(shellEl.getAttribute('aria-labelledby')).toBe(titleEl.id);
      expect(titleEl.id).toBeTruthy();
    });

    it('should not reference a title when it is not given', () => {
      const shellEl: HTMLElement = fixture.nativeElement.querySelector('.app-modal-shell');

      expect(shellEl.getAttribute('aria-labelledby')).toBeNull();
    });
  });
});
