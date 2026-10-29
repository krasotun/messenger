import { render } from '@testing-library/angular/zoneless';

import { AuthPageShell } from './auth-page-shell';

describe('AuthPageShell', () => {
  it('should create', async () => {
    const { fixture } = await render(AuthPageShell);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
