import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { CreateChatService } from '../../application/create-chat/create-chat.service';

import { CreateChatForm } from './create-chat-form';

let createChatServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  succeeded$: Subject<void>;
  createChat: ReturnType<typeof vi.fn>;
};

describe('CreateChatForm', () => {
  let component: CreateChatForm;
  let fixture: ComponentFixture<CreateChatForm>;

  const submitForm = () => {
    const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
    formElement.dispatchEvent(new Event('submit'));
  };

  const fillForm = (title: string) => {
    component.createChatForm.setValue({ title });
  };

  beforeEach(async () => {
    createChatServiceMock = {
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      createChat: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CreateChatForm],
      providers: [
        {
          provide: CreateChatService,
          useValue: createChatServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateChatForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('opened form', () => {
    it('should show an empty title field', () => {
      fixture.detectChanges();

      expect(component.createChatForm.getRawValue()).toEqual({ title: '' });
    });
  });

  describe('submit with an empty title', () => {
    it('should not call createChat', () => {
      fixture.detectChanges();

      submitForm();

      expect(createChatServiceMock.createChat).not.toHaveBeenCalled();
    });

    it('should mark the title control as touched and show a field error', () => {
      fixture.detectChanges();

      submitForm();

      fixture.detectChanges();

      expect(component.createChatForm.controls.title.touched).toBe(true);

      const fieldError: HTMLElement | null =
        fixture.nativeElement.querySelector('.form-field__error');

      expect(fieldError).not.toBeNull();
      expect(fieldError?.textContent?.trim()).toBeTruthy();
    });
  });

  describe('valid submit', () => {
    it('should call createChat with the entered title', () => {
      fixture.detectChanges();

      fillForm('Analytics Q3');

      submitForm();

      expect(createChatServiceMock.createChat).toHaveBeenCalledOnce();
      expect(createChatServiceMock.createChat).toHaveBeenCalledWith({ title: 'Analytics Q3' });
    });
  });

  describe('submitting state', () => {
    it('should disable submit button and the title control', () => {
      createChatServiceMock.isSubmitting.set(true);
      fixture.detectChanges();

      const submitButton: HTMLButtonElement =
        fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton.disabled).toBe(true);
      expect(component.createChatForm.controls.title.disabled).toBe(true);
    });
  });

  describe('error state', () => {
    it('should not render a submit error in the form', () => {
      fixture.detectChanges();

      const errorElement: HTMLElement | null = fixture.nativeElement.querySelector(
        '.create-chat-form__error',
      );

      expect(errorElement).toBeNull();
    });
  });

  describe('success state', () => {
    it('should emit chatCreated when the service reports success, without a manual application tick', () => {
      const chatCreatedSpy = vi.fn();
      component.chatCreated.subscribe(chatCreatedSpy);

      createChatServiceMock.succeeded$.next();

      expect(chatCreatedSpy).toHaveBeenCalledOnce();
    });
  });
});
