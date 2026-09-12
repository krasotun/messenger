import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfirmationData } from '../confirmation-data.type';

import { ConfirmationDialog } from './confirmation-dialog';

import { ModalRef } from '@shared/ui/modal/modal-ref';

const DANGEROUS_DATA: ConfirmationData = {
  title: 'Delete chat',
  subject: 'Analytics Q3',
  message: "The chat and its messages disappear for every member. This can't be undone.",
  confirmLabel: 'Delete',
  isDangerous: true,
};

let modalRefMock: { close: ReturnType<typeof vi.fn> };

describe('ConfirmationDialog', () => {
  let fixture: ComponentFixture<ConfirmationDialog>;

  async function renderWith(data: ConfirmationData): Promise<void> {
    fixture = TestBed.createComponent(ConfirmationDialog);
    fixture.componentRef.setInput('data', data);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    modalRefMock = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ConfirmationDialog],
      providers: [{ provide: ModalRef, useValue: modalRefMock }],
    });

    await TestBed.compileComponents();
  });

  it('should ask about the subject passed by the caller', async () => {
    await renderWith(DANGEROUS_DATA);

    const questionEl = fixture.debugElement.query(By.css('.app-confirmation-dialog__question'));

    expect(questionEl.nativeElement.textContent.replace(/\s+/g, ' ').trim()).toBe(
      "Delete Analytics Q3? The chat and its messages disappear for every member. This can't be undone.",
    );
  });

  it('should set the subject apart from the rest of the question', async () => {
    await renderWith(DANGEROUS_DATA);

    const subjectEl = fixture.debugElement.query(By.css('.app-confirmation-dialog__subject'));

    expect(subjectEl.nativeElement.textContent.trim()).toBe('Analytics Q3');
  });

  it('should label the confirm button with the text passed by the caller', async () => {
    await renderWith(DANGEROUS_DATA);

    const confirmButtonEl = fixture.debugElement.query(
      By.css('.app-confirmation-dialog__confirm-button'),
    );

    expect(confirmButtonEl.nativeElement.textContent.trim()).toBe('Delete');
  });

  it('should offer a cancel button', async () => {
    await renderWith(DANGEROUS_DATA);

    const cancelButtonEl = fixture.debugElement.query(
      By.css('.app-confirmation-dialog__cancel-button'),
    );

    expect(cancelButtonEl.nativeElement.textContent.trim()).toBe('Cancel');
  });

  it('should paint the confirm button with the danger color for a dangerous action', async () => {
    await renderWith(DANGEROUS_DATA);

    const confirmButtonEl = fixture.debugElement.query(
      By.css('.app-confirmation-dialog__confirm-button'),
    );

    expect(confirmButtonEl.nativeElement.classList.contains('button-danger')).toBe(true);
  });

  it('should paint the confirm button as a primary action when the action is not dangerous', async () => {
    await renderWith({ ...DANGEROUS_DATA, isDangerous: false });

    const confirmButtonEl = fixture.debugElement.query(
      By.css('.app-confirmation-dialog__confirm-button'),
    );

    expect(confirmButtonEl.nativeElement.classList.contains('button-primary')).toBe(true);
  });

  it('should close with agreement when the confirm button is clicked', async () => {
    await renderWith(DANGEROUS_DATA);

    fixture.debugElement
      .query(By.css('.app-confirmation-dialog__confirm-button'))
      .nativeElement.click();

    expect(modalRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should close with refusal when the cancel button is clicked', async () => {
    await renderWith(DANGEROUS_DATA);

    fixture.debugElement
      .query(By.css('.app-confirmation-dialog__cancel-button'))
      .nativeElement.click();

    expect(modalRefMock.close).toHaveBeenCalledWith(false);
  });
});
