import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { FormField } from './form-field';

@Component({
  imports: [FormField, ReactiveFormsModule],
  template: `
    <app-form-field [label]="'Login'" [control]="control">
      <input [formControl]="control" type="text" />
    </app-form-field>
  `,
})
class TestHost {
  readonly control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}

describe('FormField', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the label text', () => {
    const labelEl: HTMLLabelElement = fixture.nativeElement.querySelector('.form-field__label');

    expect(labelEl.textContent).toContain('Login');
  });

  it('should not show a message on an untouched invalid control', () => {
    const errorEl: HTMLElement | null = fixture.nativeElement.querySelector('.form-field__error');

    expect(errorEl).toBeNull();
  });

  it('should show the message resolved from the violation once the control is touched', async () => {
    fixture.componentInstance.control.markAsTouched();

    await fixture.whenStable();

    const errorEl: HTMLElement | null = fixture.nativeElement.querySelector('.form-field__error');

    expect(errorEl).not.toBeNull();
    expect(errorEl?.textContent).toContain('This field is required');
  });

  it('should hide the message once the violation is fixed', async () => {
    fixture.componentInstance.control.markAsTouched();
    await fixture.whenStable();

    fixture.componentInstance.control.setValue('a value');
    await fixture.whenStable();

    const errorEl: HTMLElement | null = fixture.nativeElement.querySelector('.form-field__error');

    expect(errorEl).toBeNull();
  });

  it('should wrap the projected field inside the label so a click on it reaches the field', () => {
    const labelEl: HTMLLabelElement = fixture.nativeElement.querySelector('.form-field__label');
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(labelEl.contains(inputEl)).toBe(true);
  });

  it('should announce the field by its label without a manual for/id pair', () => {
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputEl.closest('label')?.textContent).toContain('Login');
    expect(inputEl.hasAttribute('id')).toBe(false);
  });
});
