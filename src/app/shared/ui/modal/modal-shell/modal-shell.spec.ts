import { Component } from '@angular/core';
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
  template: `<app-modal-shell [content]="content"></app-modal-shell>`,
})
class TestHost {
  readonly content = TestShellContent;
}

describe('ModalShell', () => {
  let fixture: ComponentFixture<TestHost>;

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
    const closeButtonEl = fixture.nativeElement.querySelector('[data-testid="modal-close-button"]');

    expect(closeButtonEl).toBeTruthy();
  });

  it('should call ModalRef.close() when close button is clicked', () => {
    const modalRef = TestBed.inject(ModalRef);

    vi.spyOn(modalRef, 'close');

    const closeButtonEl: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="modal-close-button"]',
    );

    closeButtonEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    fixture.detectChanges();

    expect(modalRef.close).toHaveBeenCalled();
  });
});
