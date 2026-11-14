import { Component, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { required } from '@angular/forms/signals';
import { Subject } from 'rxjs';

import { createSubmitFlowForm, SubmitFlow } from './create-submit-flow-form';

@Component({ selector: 'app-test-host', template: '' })
class TestHost {
  readonly isSubmitting = signal(false);
  readonly succeededSubject = new Subject<void>();
  readonly succeeded = output<void>();

  readonly flow: SubmitFlow = {
    isSubmitting: this.isSubmitting,
    succeeded$: this.succeededSubject.asObservable(),
  };

  readonly value = signal({ name: 'a value' });

  readonly form = createSubmitFlowForm({
    value: this.value,
    schema: (path) => {
      required(path.name);
    },
    flow: this.flow,
    succeeded: this.succeeded,
  });
}

describe('createSubmitFlowForm', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should apply the schema of the caller', () => {
    host.form.name().value.set('');

    expect(host.form().invalid()).toBe(true);
  });

  it('should disable the form while submitting', () => {
    host.isSubmitting.set(true);

    expect(host.form.name().disabled()).toBe(true);
  });

  it('should enable the form again once submitting succeeds', () => {
    host.isSubmitting.set(true);

    host.isSubmitting.set(false);

    expect(host.form.name().disabled()).toBe(false);
  });

  it('should enable the form again once submitting fails, keeping the entered value', () => {
    host.isSubmitting.set(true);

    host.isSubmitting.set(false);

    expect(host.form.name().disabled()).toBe(false);
    expect(host.form.name().value()).toBe('a value');
  });

  it('should not mark the form as changed when locking and unlocking it', () => {
    const dirtyBefore = host.form().dirty();

    host.isSubmitting.set(true);
    host.isSubmitting.set(false);

    expect(host.form().dirty()).toBe(dirtyBefore);
  });

  it('should keep the form marked as changed after locking and unlocking it', () => {
    host.form.name().markAsDirty();

    host.isSubmitting.set(true);
    host.isSubmitting.set(false);

    expect(host.form().dirty()).toBe(true);
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
