import { inputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { ConfirmationData } from '../confirmation-data.type';

import { ConfirmationDialog } from './confirmation-dialog';

import { ModalRef } from '@shared/ui/modal/modal-ref';
import { ModalMocks } from '@shared/ui/modal/testing';

const DANGEROUS_DATA: ConfirmationData = {
  title: 'Delete chat',
  subject: 'Analytics Q3',
  message: "The chat and its messages disappear for every member. This can't be undone.",
  confirmLabel: 'Delete',
  isDangerous: true,
};

describe('ConfirmationDialog', () => {
  let modalRefMock: ReturnType<typeof ModalMocks.modalRef>;

  const renderWith = (data: ConfirmationData) =>
    render(ConfirmationDialog, {
      bindings: [inputBinding('data', () => data)],
      providers: [{ provide: ModalRef, useValue: modalRefMock }],
      waitForStableOnRender: true,
    });

  beforeEach(() => {
    modalRefMock = ModalMocks.modalRef();
  });

  it('should ask about the subject passed by the caller', async () => {
    await renderWith(DANGEROUS_DATA);

    expect(screen.getByRole('paragraph')).toHaveTextContent(
      "Delete Analytics Q3? The chat and its messages disappear for every member. This can't be undone.",
    );
  });

  it('should set the subject apart from the rest of the question', async () => {
    await renderWith(DANGEROUS_DATA);

    expect(screen.getByText('Analytics Q3').tagName).toBe('B');
  });

  it('should label the confirm button with the text passed by the caller', async () => {
    await renderWith(DANGEROUS_DATA);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should offer a cancel button', async () => {
    await renderWith(DANGEROUS_DATA);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should paint the confirm button with the danger color for a dangerous action', async () => {
    await renderWith(DANGEROUS_DATA);

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('button-danger');
  });

  it('should paint the confirm button as a primary action when the action is not dangerous', async () => {
    await renderWith({ ...DANGEROUS_DATA, isDangerous: false });

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('button-primary');
  });

  it('should close with agreement when the confirm button is clicked', async () => {
    await renderWith(DANGEROUS_DATA);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Delete' }));

    expect(modalRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should close with refusal when the cancel button is clicked', async () => {
    await renderWith(DANGEROUS_DATA);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel' }));

    expect(modalRefMock.close).toHaveBeenCalledWith(false);
  });
});
