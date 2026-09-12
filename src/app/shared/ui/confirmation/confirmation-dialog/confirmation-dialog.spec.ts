import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfirmationData } from '../confirmation-data.type';

import { ConfirmationDialog } from './confirmation-dialog';

import { ModalRef } from '@shared/ui/modal/modal-ref';

const DANGEROUS_DATA: ConfirmationData = {
  title: 'Delete chat',
  message: 'Delete "Team"? This cannot be undone.',
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

  it('should show the message passed by the caller', async () => {
    await renderWith(DANGEROUS_DATA);

    const messageEl = fixture.debugElement.query(By.css('.app-confirmation-dialog__message'));

    expect(messageEl.nativeElement.textContent.trim()).toBe(DANGEROUS_DATA.message);
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
