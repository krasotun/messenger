import { inputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';

import { AuthFormShell } from './auth-form-shell';

describe('AuthFormShell', () => {
  const renderShell = () =>
    render(AuthFormShell, { bindings: [inputBinding('formTitle', () => 'Mock title')] });

  it('should create', async () => {
    const { fixture } = await renderShell();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render form title', async () => {
    await renderShell();

    expect(screen.getByRole('heading', { name: 'Mock title' })).toBeInTheDocument();
  });
});
