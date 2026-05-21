import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { HomePage } from './home-page';

import { CurrentSessionService } from '@app/domains/identity-access/application/current-session/current-session.service';

const currentSessionServiceMock = {
  logout: vi.fn(),
};

const routerMock = {
  navigateByUrl: vi.fn(),
};

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    currentSessionServiceMock.logout.mockReset();
    routerMock.navigateByUrl.mockReset();

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        {
          provide: CurrentSessionService,
          useValue: currentSessionServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show signed-in placeholder', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Home');
    expect(text).toContain('You are signed in.');
  });

  describe('logout', () => {
    it('should show logout action', () => {
      fixture.detectChanges();

      const logoutButton = fixture.debugElement.query(By.css('button'));

      expect(logoutButton.nativeElement.textContent).toContain('Logout');
    });

    it('should call logout on click', async () => {
      currentSessionServiceMock.logout.mockReturnValue(of(undefined));

      fixture.detectChanges();

      const logoutButton = fixture.debugElement.query(By.css('button'));

      logoutButton.triggerEventHandler('click');

      await fixture.whenStable();

      expect(currentSessionServiceMock.logout).toHaveBeenCalledOnce();
    });

    it('should navigate to sign in after successful logout', async () => {
      currentSessionServiceMock.logout.mockReturnValue(of(undefined));

      fixture.detectChanges();

      const logoutButton = fixture.debugElement.query(By.css('button'));

      logoutButton.triggerEventHandler('click');

      await fixture.whenStable();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/sign-in');
    });

    it('should navigate to sign in after logout error', async () => {
      currentSessionServiceMock.logout.mockReturnValue(throwError(() => 'mockError'));

      fixture.detectChanges();

      const logoutButton = fixture.debugElement.query(By.css('button'));

      logoutButton.triggerEventHandler('click');

      await fixture.whenStable();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/sign-in');
    });
  });
});
