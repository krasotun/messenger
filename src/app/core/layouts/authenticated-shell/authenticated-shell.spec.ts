import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticatedShell } from './authenticated-shell';

describe('AuthenticatedShell', () => {
  let component: AuthenticatedShell;
  let fixture: ComponentFixture<AuthenticatedShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticatedShell],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthenticatedShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
