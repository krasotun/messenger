import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Button } from './button';

@Component({
  imports: [Button],
  template: ` <button appButton [colorType]="colorType()" [disabled]="disabled()">Test</button> `,
})
class TestHost {
  readonly colorType = signal<'primary' | 'secondary' | 'success' | 'danger' | 'warning'>(
    'primary',
  );
  readonly disabled = signal(false);
}

describe('Button', () => {
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

  it('should apply default color class', async () => {
    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(buttonEl.classList.contains('button-primary')).toBe(true);
  });

  it('should apply color class from input', async () => {
    host.colorType.set('danger');

    await fixture.whenStable();

    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(buttonEl.classList.contains('button-danger')).toBe(true);
  });

  it('should disable host button when disabled input is true', async () => {
    host.disabled.set(true);

    await fixture.whenStable();

    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(buttonEl.disabled).toBe(true);
    expect(buttonEl.classList.contains('disabled')).toBe(true);
  });
});
