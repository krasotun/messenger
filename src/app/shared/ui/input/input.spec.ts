import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Input } from './input';

@Component({
  imports: [Input],
  template: ` <input appInput [invalid]="invalid()" [disabled]="disabled()" /> `,
})
class TestHost {
  readonly invalid = signal(false);
  readonly disabled = signal(false);
}

describe('Input', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should render default state', () => {
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputEl.getAttribute('aria-invalid')).toBe('false');
    expect(inputEl.disabled).toBe(false);
  });

  it('should set aria-invalid when invalid input is true', async () => {
    host.invalid.set(true);

    await fixture.whenStable();

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputEl.getAttribute('aria-invalid')).toBe('true');
  });

  it('should disable host input when disabled input is true', async () => {
    host.disabled.set(true);

    await fixture.whenStable();

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputEl.disabled).toBe(true);
  });
});
