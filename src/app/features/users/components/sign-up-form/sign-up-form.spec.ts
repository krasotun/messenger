import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpForm } from './sign-up-form';

describe('SignUpForm', () => {
  let component: SignUpForm;
  let fixture: ComponentFixture<SignUpForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
