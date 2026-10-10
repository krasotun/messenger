import { ModalRef } from '../modal-ref';
import { ModalService } from '../modal-service';

export const ModalMocks = {
  modalRef: () => ({
    close: vi.fn<ModalRef['close']>(),
  }),

  modalService: () => ({
    open: vi.fn<ModalService['open']>(),
  }),
};
