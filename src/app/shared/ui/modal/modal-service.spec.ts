import { TestBed } from '@angular/core/testing';

import { ModalService } from './modal-service';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
