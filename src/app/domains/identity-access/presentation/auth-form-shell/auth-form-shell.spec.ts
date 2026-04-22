import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFormShell } from './auth-form-shell';

describe('AuthFormShell', () => {
  let component: AuthFormShell;
  let fixture: ComponentFixture<AuthFormShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthFormShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthFormShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
