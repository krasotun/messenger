import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormField } from './form-field';

describe('FormField', () => {
  let component: FormField;
  let fixture: ComponentFixture<FormField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormField],
    }).compileComponents();

    fixture = TestBed.createComponent(FormField);

    fixture.componentRef.setInput('label', 'mockLabel');
    fixture.componentRef.setInput('htmlFor', 'mockHtmlFor');

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label text and for attribute', () => {
    const labelEl: HTMLLabelElement = fixture.nativeElement.querySelector('.form-field__label');

    expect(labelEl.textContent).toContain('mockLabel');
    expect(labelEl.getAttribute('for')).toBe('mockHtmlFor');
  });

  it('should not render error by default', () => {
    const errorEl: HTMLElement | null = fixture.nativeElement.querySelector('.form-field__error');

    expect(errorEl).toBeNull();
  });

  it('should render error when error input has value', async () => {
    fixture.componentRef.setInput('error', 'Email is required');

    await fixture.whenStable();

    const errorEl: HTMLElement | null = fixture.nativeElement.querySelector('.form-field__error');

    expect(errorEl).not.toBeNull();
    expect(errorEl?.textContent).toContain('Email is required');
  });
});
