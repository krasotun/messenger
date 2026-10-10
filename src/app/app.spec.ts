import { render } from '@testing-library/angular/zoneless';

import { App } from './app';

describe('App', () => {
  it('should create the app', async () => {
    const { fixture } = await render(App, { skipDetectChanges: true });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
