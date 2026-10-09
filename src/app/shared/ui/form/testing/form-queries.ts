import { ComponentFixture } from '@angular/core/testing';

export const FormQueries = {
  submitButton: (fixture: ComponentFixture<unknown>): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]'),
};
