import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Avatar } from './avatar';

describe('Avatar', () => {
  let fixture: ComponentFixture<Avatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avatar],
    }).compileComponents();

    fixture = TestBed.createComponent(Avatar);

    fixture.componentRef.setInput('label', 'mockLabel');

    await fixture.whenStable();
  });

  describe('rendering', () => {
    it('renders image when imageUrl is provided', async () => {
      const imageSrcMock = 'http://mock-image.jpg';

      fixture.componentRef.setInput('imageUrl', imageSrcMock);

      fixture.detectChanges();
      await fixture.whenStable();

      const avatarImg: HTMLImageElement = fixture.nativeElement.querySelector('.avatar__image');

      expect(avatarImg).not.toBeNull();

      expect(avatarImg.getAttribute('src')).toBe(imageSrcMock);
      expect(avatarImg.getAttribute('alt')).toBe('mockLabel');

      const avatarFallback: HTMLDivElement =
        fixture.nativeElement.querySelector('.avatar__fallback');

      expect(avatarFallback).toBeNull();
    });

    it('renders fallback when imageUrl is empty', () => {
      const avatarFallback: HTMLDivElement =
        fixture.nativeElement.querySelector('.avatar__fallback');

      expect(avatarFallback).not.toBeNull();
    });

    it('renders fallback after image loading error', async () => {
      const imageSrcMock = 'http://mock-image.jpg';

      fixture.componentRef.setInput('imageUrl', imageSrcMock);

      fixture.detectChanges();
      await fixture.whenStable();

      const avatarImg: HTMLImageElement = fixture.nativeElement.querySelector('.avatar__image');

      avatarImg.dispatchEvent(new Event('error'));

      fixture.detectChanges();
      await fixture.whenStable();

      const errorAvatarImg: HTMLImageElement =
        fixture.nativeElement.querySelector('.avatar__image');

      expect(errorAvatarImg).toBeNull();

      const avatarFallback: HTMLDivElement =
        fixture.nativeElement.querySelector('.avatar__fallback');

      expect(avatarFallback).not.toBeNull();
    });

    it('uses provided accessible label for fallback', () => {
      const avatarFallback: HTMLDivElement =
        fixture.nativeElement.querySelector('.avatar__fallback');

      expect(avatarFallback.getAttribute('aria-label')).toBe('mockLabel');
      expect(avatarFallback.getAttribute('role')).toBe('img');
    });

    it('applies selected predefined size', async () => {
      const avatarEl: HTMLDivElement = fixture.nativeElement.querySelector('.avatar');

      expect(avatarEl.classList.contains('avatar_md')).toBe(true);

      fixture.componentRef.setInput('size', 'sm');

      fixture.detectChanges();
      await fixture.whenStable();

      const newAvatarEl: HTMLDivElement = fixture.nativeElement.querySelector('.avatar');

      expect(newAvatarEl.classList.contains('avatar_md')).toBe(false);
      expect(newAvatarEl.classList.contains('avatar_sm')).toBe(true);
    });

    it('renders fallback text when fallbackText is provided', async () => {
      fixture.componentRef.setInput('fallbackText', 'M');

      fixture.detectChanges();
      await fixture.whenStable();

      const avatarFallback: HTMLDivElement =
        fixture.nativeElement.querySelector('.avatar__fallback');

      expect(avatarFallback).not.toBeNull();
      expect(avatarFallback.getAttribute('aria-label')).toBe('mockLabel');
      expect(avatarFallback.getAttribute('role')).toBe('img');

      expect(avatarFallback.textContent?.trim()).toBe('M');
    });
  });
});
