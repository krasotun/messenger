import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ConfirmationData } from './confirmation-data.type';
import { ConfirmationDialog } from './confirmation-dialog/confirmation-dialog';
import { ConfirmationService } from './confirmation.service';

import { ModalService } from '@shared/ui/modal/modal-service';

const DATA: ConfirmationData = {
  title: 'Delete chat',
  message: 'Delete "Team"? This cannot be undone.',
  confirmLabel: 'Delete',
  isDangerous: true,
};

let closed$: Subject<boolean | undefined>;

const modalServiceMock = {
  open: vi.fn(),
};

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    closed$ = new Subject<boolean | undefined>();

    modalServiceMock.open.mockReset();
    modalServiceMock.open.mockReturnValue({ closed$: closed$.asObservable() });

    TestBed.configureTestingModule({
      providers: [{ provide: ModalService, useValue: modalServiceMock }],
    });

    service = TestBed.inject(ConfirmationService);
  });

  it('should show the confirmation dialog titled by the caller', () => {
    service.confirm(DATA).subscribe();

    expect(modalServiceMock.open).toHaveBeenCalledWith(
      ConfirmationDialog,
      expect.objectContaining({ title: 'Delete chat' }),
    );
  });

  it('should answer with agreement when the dialog is closed with agreement', () => {
    const answerSpy = vi.fn();

    service.confirm(DATA).subscribe(answerSpy);

    closed$.next(true);

    expect(answerSpy).toHaveBeenCalledWith(true);
  });

  it('should answer with refusal when the dialog is closed with refusal', () => {
    const answerSpy = vi.fn();

    service.confirm(DATA).subscribe(answerSpy);

    closed$.next(false);

    expect(answerSpy).toHaveBeenCalledWith(false);
  });

  it('should answer with refusal when the dialog is closed without a choice', () => {
    const answerSpy = vi.fn();

    service.confirm(DATA).subscribe(answerSpy);

    closed$.next(undefined);

    expect(answerSpy).toHaveBeenCalledWith(false);
  });

  it('should answer with refusal when the dialog did not open', () => {
    modalServiceMock.open.mockReturnValue(null);

    const answerSpy = vi.fn();

    service.confirm(DATA).subscribe(answerSpy);

    expect(answerSpy).toHaveBeenCalledWith(false);
  });

  it('should answer exactly once and complete', () => {
    const answerSpy = vi.fn();
    const completeSpy = vi.fn();

    service.confirm(DATA).subscribe({ next: answerSpy, complete: completeSpy });

    closed$.next(true);
    closed$.next(false);

    expect(answerSpy).toHaveBeenCalledTimes(1);
    expect(completeSpy).toHaveBeenCalledTimes(1);
  });
});
