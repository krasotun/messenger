import { ComponentFixture } from '@angular/core/testing';

export const FormFieldQueries = {
  errors: (fixture: ComponentFixture<unknown>): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.form-field__error')),
};
