import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPageShell } from './auth-page-shell';

describe('AuthPageShell', () => {
  let component: AuthPageShell;
  let fixture: ComponentFixture<AuthPageShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPageShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthPageShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
