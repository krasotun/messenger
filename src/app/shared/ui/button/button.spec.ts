import { Component, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular/zoneless';

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
    ({ fixture } = await render(TestHost, { waitForStableOnRender: true }));
    host = fixture.componentInstance;
  });

  const getButton = (): HTMLElement => screen.getByRole('button', { name: 'Test' });

  it('should apply default color class', async () => {
    expect(getButton()).toHaveClass('button-primary');
  });

  it('should apply color class from input', async () => {
    host.colorType.set('danger');

    await fixture.whenStable();

    expect(getButton()).toHaveClass('button-danger');
  });

  it('should disable host button when disabled input is true', async () => {
    host.disabled.set(true);

    await fixture.whenStable();

    expect(getButton()).toBeDisabled();
    expect(getButton()).toHaveClass('disabled');
  });
});
