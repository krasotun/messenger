import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpForm } from './sign-up-form';

import { API_BASE_URL } from '@app/core/tokens';

const baseUrlMock = 'baseUrlMock';

describe('SignUpForm', () => {
  let component: SignUpForm;
  let fixture: ComponentFixture<SignUpForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpForm],
      providers: [
        {
          provide: API_BASE_URL,
          useValue: baseUrlMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
