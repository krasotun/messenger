import { Component, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { connectSubmitFlow, SubmitFlow } from './connect-submit-flow';

@Component({ selector: 'app-test-host', template: '' })
class TestHost {
  readonly succeededSubject = new Subject<void>();
  readonly succeeded = output<void>();

  readonly flow: SubmitFlow = {
    isSubmitting: signal(false),
    succeeded$: this.succeededSubject.asObservable(),
  };

  constructor() {
    connectSubmitFlow(this.flow, this.succeeded);
  }
}

describe('connectSubmitFlow', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should reach the caller once when the flow succeeds', () => {
    const spy = vi.fn();
    host.succeeded.subscribe(spy);

    host.succeededSubject.next();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should not reach the caller before the flow succeeds', () => {
    const spy = vi.fn();
    host.succeeded.subscribe(spy);

    expect(spy).not.toHaveBeenCalled();
  });
});
