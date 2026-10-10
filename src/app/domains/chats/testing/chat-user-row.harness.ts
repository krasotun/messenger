import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export interface ChatUserRowHarnessFilters extends BaseHarnessFilters {
  name?: string | RegExp;
}

// Разметку строки участника знает только этот класс: спеки родителей
// (панель участников) говорят со строкой его методами.
export class ChatUserRowHarness extends ComponentHarness {
  static hostSelector = 'app-chat-user-row';

  private readonly _name = this.locatorFor('.chat-user-row__name');
  private readonly _currentUserMark = this.locatorForOptional('.chat-user-row__you');
  private readonly _removeButton = this.locatorForOptional('.chat-user-row__remove-user-button');

  static with(options: ChatUserRowHarnessFilters = {}): HarnessPredicate<ChatUserRowHarness> {
    return new HarnessPredicate(ChatUserRowHarness, options).addOption(
      'name',
      options.name,
      (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name),
    );
  }

  async getName(): Promise<string> {
    return (await this._name()).text();
  }

  async isCurrentUser(): Promise<boolean> {
    return (await this._currentUserMark()) !== null;
  }

  async canRemove(): Promise<boolean> {
    return (await this._removeButton()) !== null;
  }

  async remove(): Promise<void> {
    const removeButton = await this._removeButton();

    if (removeButton === null) {
      throw new Error('The chat user row offers no removal');
    }

    await removeButton.click();
  }
}
