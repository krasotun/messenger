import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { fireEvent, render, screen } from '@testing-library/angular/zoneless';

import { Avatar } from './avatar';

import { Nullable } from '@shared/types';

type AvatarSize = ReturnType<Avatar['size']>;

describe('Avatar', () => {
  let fixture: ComponentFixture<Avatar>;
  let container: HTMLElement;
  let imageUrl: WritableSignal<Nullable<string>>;
  let size: WritableSignal<AvatarSize>;
  let name: WritableSignal<string>;

  // И картинка, и заглушка - role="img" с подписью: различаются тегом.
  const getAvatar = (): HTMLElement => screen.getByRole('img', { name: 'mockLabel' });

  const update = async (change: () => void): Promise<void> => {
    change();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    imageUrl = signal<Nullable<string>>(null);
    size = signal<AvatarSize>('md');
    name = signal('');

    ({ fixture, container } = await render(Avatar, {
      bindings: [
        inputBinding('label', () => 'mockLabel'),
        inputBinding('imageUrl', imageUrl),
        inputBinding('size', size),
        inputBinding('name', name),
      ],
      waitForStableOnRender: true,
    }));
  });

  describe('rendering', () => {
    it('renders image when imageUrl is provided', async () => {
      const imageSrcMock = 'http://mock-image.jpg';

      await update(() => imageUrl.set(imageSrcMock));

      expect(getAvatar().tagName).toBe('IMG');
      expect(getAvatar()).toHaveAttribute('src', imageSrcMock);
      expect(getAvatar()).toHaveAttribute('alt', 'mockLabel');
    });

    it('renders fallback when imageUrl is empty', () => {
      expect(getAvatar().tagName).not.toBe('IMG');
    });

    it('renders fallback after image loading error', async () => {
      await update(() => imageUrl.set('http://mock-image.jpg'));

      await update(() => fireEvent.error(getAvatar()));

      expect(getAvatar().tagName).not.toBe('IMG');
    });

    it('retries rendering an image after imageUrl changes', async () => {
      await update(() => imageUrl.set('http://mock-image.jpg'));

      await update(() => fireEvent.error(getAvatar()));

      expect(getAvatar().tagName).not.toBe('IMG');

      await update(() => imageUrl.set('http://other-mock-image.jpg'));

      expect(getAvatar().tagName).toBe('IMG');
      expect(getAvatar()).toHaveAttribute('src', 'http://other-mock-image.jpg');
    });

    it('uses provided accessible label for fallback', () => {
      expect(getAvatar()).toHaveAttribute('aria-label', 'mockLabel');
      expect(getAvatar()).toHaveAttribute('role', 'img');
    });

    it('applies selected predefined size', async () => {
      const getAvatarRoot = (): Element | null => container.querySelector('.avatar');

      expect(getAvatarRoot()).toHaveClass('avatar_md');

      await update(() => size.set('sm'));

      expect(getAvatarRoot()).not.toHaveClass('avatar_md');
      expect(getAvatarRoot()).toHaveClass('avatar_sm');
    });

    it('renders the first letter of the name in upper case as the fallback', async () => {
      await update(() => name.set('  maria'));

      expect(getAvatar()).toHaveTextContent(/^M$/);
    });

    it('renders an empty fallback for a blank name', async () => {
      await update(() => name.set('   '));

      expect(getAvatar().textContent?.trim()).toBe('');
    });
  });
});
