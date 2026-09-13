import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Input } from './input';

@Component({
  imports: [Input, ReactiveFormsModule],
  template: ` <input appInput [formControl]="control" type="text" /> `,
})
class TestHost {
  readonly control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}

@Component({
  imports: [Input],
  template: ` <input appInput type="text" /> `,
})
class PlainTestHost {}

describe('Input', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);

    await fixture.whenStable();
  });

  it('should not mark an untouched invalid control as invalid', () => {
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputEl.getAttribute('aria-invalid')).toBe('false');
  });

  it('should mark a touched invalid control as invalid', async () => {
    fixture.componentInstance.control.markAsTouched();

    await fixture.whenStable();

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputEl.getAttribute('aria-invalid')).toBe('true');
  });

  it('should clear the invalid state once the value is fixed', async () => {
    fixture.componentInstance.control.markAsTouched();
    await fixture.whenStable();

    fixture.componentInstance.control.setValue('a value');
    await fixture.whenStable();

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputEl.getAttribute('aria-invalid')).toBe('false');
  });
});

describe('Input without a control', () => {
  it('should not mark the field as invalid', async () => {
    await TestBed.configureTestingModule({
      imports: [PlainTestHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(PlainTestHost);
    await fixture.whenStable();

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputEl.getAttribute('aria-invalid')).toBe('false');
  });
});
