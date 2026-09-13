import { Component, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

import { connectSubmitFlow, SubmitFlow } from './connect-submit-flow';

@Component({ selector: 'app-test-host', template: '' })
class TestHost {
  readonly control = new FormControl('a value', { nonNullable: true });
  readonly isSubmitting = signal(false);
  readonly succeededSubject = new Subject<void>();
  readonly succeeded = output<void>();

  readonly flow: SubmitFlow = {
    isSubmitting: this.isSubmitting,
    succeeded$: this.succeededSubject.asObservable(),
  };

  constructor() {
    connectSubmitFlow(this.control, this.flow, this.succeeded);
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

  it('should disable the form while submitting', () => {
    host.isSubmitting.set(true);
    fixture.detectChanges();

    expect(host.control.disabled).toBe(true);
  });

  it('should enable the form again once submitting succeeds', () => {
    host.isSubmitting.set(true);
    fixture.detectChanges();

    host.isSubmitting.set(false);
    fixture.detectChanges();

    expect(host.control.disabled).toBe(false);
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
