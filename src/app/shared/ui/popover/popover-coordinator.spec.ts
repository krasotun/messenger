import { TestBed } from '@angular/core/testing';

import { PopoverCoordinator } from './popover-coordinator.service';

describe('PopoverCoordinator', () => {
  let service: PopoverCoordinator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopoverCoordinator);
  });

  describe('activate', () => {
    it('should close previous active popover when another popover is activated', () => {
      const firstPopoverHandleMock = { close: vi.fn() };
      const secondPopoverHandleMock = { close: vi.fn() };

      service.activate(firstPopoverHandleMock);
      service.activate(secondPopoverHandleMock);

      expect(firstPopoverHandleMock.close).toHaveBeenCalledOnce();
      expect(secondPopoverHandleMock.close).not.toHaveBeenCalled();
    });

    it('should not close active popover when same popover is activated again', () => {
      const popoverHandleMock = { close: vi.fn() };

      service.activate(popoverHandleMock);
      service.activate(popoverHandleMock);

      expect(popoverHandleMock.close).not.toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    it('should clear active popover when current active popover is deactivated', () => {
      const firstPopoverHandleMock = { close: vi.fn() };
      const secondPopoverHandleMock = { close: vi.fn() };

      service.activate(firstPopoverHandleMock);
      service.deactivate(firstPopoverHandleMock);
      service.activate(secondPopoverHandleMock);

      expect(firstPopoverHandleMock.close).not.toHaveBeenCalled();
    });

    it('should not clear active popover when inactive popover is deactivated', () => {
      const firstPopoverHandleMock = { close: vi.fn() };
      const secondPopoverHandleMock = { close: vi.fn() };

      service.activate(firstPopoverHandleMock);
      service.activate(secondPopoverHandleMock);

      service.deactivate(firstPopoverHandleMock);
      service.activate(firstPopoverHandleMock);

      expect(firstPopoverHandleMock.close).toHaveBeenCalledTimes(1);
      expect(secondPopoverHandleMock.close).toHaveBeenCalledTimes(1);
    });
  });
});
