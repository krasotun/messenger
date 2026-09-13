import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Form } from './form';

import { lockFormWhileSubmitting } from '@shared/forms';

interface TestFormModel {
  name: FormControl<string>;
}

@Component({
  imports: [Form, ReactiveFormsModule],
  template: `
    <app-form
      [group]="group"
      [submitLabel]="'Submit'"
      [requireChanges]="requireChanges"
      [isSubmitting]="isSubmitting()"
      (submitted)="submitted()"
    >
      <input [formControl]="group.controls.name" type="text" />
    </app-form>
  `,
})
class TestHost {
  readonly group = new FormGroup<TestFormModel>({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly requireChanges = false;
  readonly isSubmitting: WritableSignal<boolean> = signal(false);
  readonly submitted = vi.fn();

  constructor() {
    lockFormWhileSubmitting(this.group, this.isSubmitting);
  }
}

@Component({
  imports: [Form, ReactiveFormsModule],
  template: `
    <app-form
      [group]="group"
      [submitLabel]="'Save'"
      [requireChanges]="true"
      [isSubmitting]="false"
      (submitted)="submitted()"
    >
      <input [formControl]="group.controls.name" type="text" />
    </app-form>
  `,
})
class RequireChangesHost {
  readonly group = new FormGroup<TestFormModel>({
    name: new FormControl('a value', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly submitted = vi.fn();
}

describe('Form', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  const getSubmitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');
  const getFormEl = (): HTMLFormElement => fixture.nativeElement.querySelector('form');
  const getFieldInput = (): HTMLInputElement => fixture.nativeElement.querySelector('input');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the submit label', () => {
    expect(getSubmitButton().textContent).toContain('Submit');
  });

  it('should disable the submit button while the form is invalid', () => {
    expect(getSubmitButton().disabled).toBe(true);
  });

  it('should enable the submit button once the form becomes valid', async () => {
    host.group.setValue({ name: 'a value' });
    await fixture.whenStable();

    expect(getSubmitButton().disabled).toBe(false);
  });

  it('should reach the caller when a valid form is submitted', () => {
    host.group.setValue({ name: 'a value' });

    getFormEl().dispatchEvent(new Event('submit'));

    expect(host.submitted).toHaveBeenCalledOnce();
  });

  it('should not reach the caller when an invalid form is submitted', () => {
    getFormEl().dispatchEvent(new Event('submit'));

    expect(host.submitted).not.toHaveBeenCalled();
  });

  it('should disable the submit button while submitting', async () => {
    host.group.setValue({ name: 'a value' });
    await fixture.whenStable();

    host.isSubmitting.set(true);
    await fixture.whenStable();

    expect(getSubmitButton().disabled).toBe(true);
  });

  it('should disable projected fields while submitting', async () => {
    host.isSubmitting.set(true);
    await fixture.whenStable();

    expect(getFieldInput().disabled).toBe(true);
  });

  it('should enable projected fields again once submitting ends', async () => {
    host.isSubmitting.set(true);
    await fixture.whenStable();

    host.isSubmitting.set(false);
    await fixture.whenStable();

    expect(getFieldInput().disabled).toBe(false);
  });
});

describe('Form with requireChanges', () => {
  let fixture: ComponentFixture<RequireChangesHost>;
  let host: RequireChangesHost;

  const getSubmitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequireChangesHost],
    }).compileComponents();

    fixture = TestBed.createComponent(RequireChangesHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should disable the submit button for an untouched valid form', () => {
    expect(getSubmitButton().disabled).toBe(true);
  });

  it('should enable the submit button once the value changes', async () => {
    host.group.markAsDirty();
    host.group.setValue({ name: 'another value' });
    await fixture.whenStable();

    expect(getSubmitButton().disabled).toBe(false);
  });
});
