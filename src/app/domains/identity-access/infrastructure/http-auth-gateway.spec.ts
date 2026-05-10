import { TestBed } from '@angular/core/testing';

import { HttpAuthGateway } from './http-auth-gateway';

describe('HttpAuthGateway', () => {
  let service: HttpAuthGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpAuthGateway);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
