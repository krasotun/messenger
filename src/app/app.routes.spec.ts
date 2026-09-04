import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Route, Router, Routes } from '@angular/router';

import { routes } from './app.routes';

// Гварды при разборе матчинга не нужны, а с ними промах по роуту превращается в
// редирект: перепутанный порядок роутов вешает навигацию вместо падения теста.
const withoutGuards = (routeList: Routes): Routes =>
  routeList.map(({ canActivate: _canActivate, children, ...route }: Route) => ({
    ...route,
    ...(children ? { children: withoutGuards(children) } : {}),
  }));

const matchedPathsOf = (root: ActivatedRouteSnapshot): string[] => {
  const path = root.routeConfig?.path;
  const childPaths = root.children.flatMap(matchedPathsOf);

  return path === undefined ? childPaths : [path, ...childPaths];
};

describe('routes', () => {
  let router: Router;

  const matchedPathsFor = async (url: string): Promise<string[]> => {
    const succeeded = await router.navigateByUrl(url);

    expect(succeeded).toBe(true);

    return matchedPathsOf(router.routerState.snapshot.root);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(withoutGuards(routes))],
    });

    router = TestBed.inject(Router);
  });

  it('should match sign-in page instead of treating it as a chat', async () => {
    await expect(matchedPathsFor('/sign-in')).resolves.toEqual(['sign-in']);
  });

  it('should match sign-up page instead of treating it as a chat', async () => {
    await expect(matchedPathsFor('/sign-up')).resolves.toEqual(['sign-up']);
  });

  it('should match chat list on the main page', async () => {
    await expect(matchedPathsFor('/')).resolves.toEqual(['', '']);
  });

  it('should match selected chat', async () => {
    await expect(matchedPathsFor('/42')).resolves.toEqual(['', '', ':chatId']);
  });
});
