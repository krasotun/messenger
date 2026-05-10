import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFormShell } from './auth-form-shell';

describe('AuthFormShell', () => {
  let component: AuthFormShell;
  let fixture: ComponentFixture<AuthFormShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthFormShell],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthFormShell);

    fixture.componentRef.setInput('formTitle', 'Mock title');

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render form title', () => {
    const titleEl: HTMLHeadingElement =
      fixture.nativeElement.querySelector('.auth-form-shell__title');

    expect(titleEl.textContent).toContain('Mock title');
  });
});
