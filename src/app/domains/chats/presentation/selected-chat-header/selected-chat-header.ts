import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ChatListService } from '../../application/chat-list/chat-list.service';
import { ChatUsersService } from '../../application/chat-users/chat-users.service';
import { DeleteChatService } from '../../application/delete-chat/delete-chat.service';
import { AddChatUserPanel } from '../add-chat-user-panel/add-chat-user-panel';
import { ChatUserStack } from '../chat-user-stack/chat-user-stack';
import { PrototypeMembers } from '../prototype-remove-member/prototype-members';
import { VariantAMembersModal } from '../prototype-remove-member/variant-a-members-modal';
import { VariantBSidePanel } from '../prototype-remove-member/variant-b-side-panel';
import { VariantCMembersView } from '../prototype-remove-member/variant-c-members-view';

import { CurrentSessionService } from '@domains/identity-access';
import { NOTIFIER } from '@shared/notifications';
import { Avatar } from '@shared/ui/avatar/avatar';
import { Button } from '@shared/ui/button/button';
import { ConfirmationService } from '@shared/ui/confirmation';
import { ModalService } from '@shared/ui/modal/modal-service';
import { Popover } from '@shared/ui/popover/popover';
import {
  PrototypeSwitcher,
  PrototypeVariant,
} from '@shared/ui/prototype-switcher/prototype-switcher';

// PROTOTYPE: варианты UI исключения участника, переключаются ?variant=.
const PROTOTYPE_VARIANTS: PrototypeVariant[] = [
  { key: 'A', name: 'Members modal, confirm as 2nd step' },
  { key: 'B', name: 'Side panel + confirmation modal' },
  { key: 'C', name: 'Members view in chat area, inline confirm' },
];

const DELETE_CHAT_MESSAGE =
  "The chat and its messages disappear for every member. This can't be undone.";

@Component({
  selector: 'app-selected-chat-header',
  imports: [
    Avatar,
    ChatUserStack,
    AddChatUserPanel,
    Button,
    Popover,
    PrototypeSwitcher,
    VariantBSidePanel,
    VariantCMembersView,
  ],
  templateUrl: './selected-chat-header.html',
  styleUrl: './selected-chat-header.scss',
  providers: [DeleteChatService],
})
export class SelectedChatHeader {
  readonly chatId = input.required<string>();

  // PROTOTYPE
  readonly variant = input<string>();

  private readonly _chatUsersService = inject(ChatUsersService);
  private readonly _chatListService = inject(ChatListService);
  private readonly _currentSessionService = inject(CurrentSessionService);
  private readonly _confirmationService = inject(ConfirmationService);
  private readonly _deleteChatService = inject(DeleteChatService);
  private readonly _router = inject(Router);

  private readonly _addUserPopover = viewChild(Popover);

  // PROTOTYPE
  private readonly _modalService = inject(ModalService);
  private readonly _hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly prototypeVariants = PROTOTYPE_VARIANTS;
  protected readonly currentVariant = computed(() => this.variant() ?? 'A');
  protected readonly membersOpen = signal(false);
  protected readonly membersHeight = signal(0);
  protected readonly prototypeMembers = new PrototypeMembers(
    this._chatUsersService.chatUsers,
    computed(() => this._currentSessionService.currentUser()?.id ?? null),
    inject(NOTIFIER),
  );

  readonly numericChatId = computed(() => Number(this.chatId()));

  readonly chat = computed(() => {
    const numericChatId = this.numericChatId();

    return this._chatListService.chats().find((chat) => chat.id === numericChatId) ?? null;
  });

  readonly chatUsers = this._chatUsersService.chatUsers;
  readonly errorMessage = this._chatUsersService.errorMessage;

  readonly avatarLabel = computed(() => `Avatar ${this.chat()?.title ?? ''}`);
  readonly avatarFallbackText = computed(() => this.chat()?.title.trim()[0]?.toUpperCase() ?? '');

  readonly canDeleteChat = computed(() => {
    const chat = this.chat();
    const currentUser = this._currentSessionService.currentUser();

    return !!chat && !!currentUser && chat.createdBy === currentUser.id;
  });

  constructor() {
    // Роут переиспользует этот компонент при переходе между чатами: без
    // effect на chatId состав участников остался бы от предыдущего чата.
    effect(() => {
      this._chatUsersService.loadChatUsers(this.numericChatId());
    });

    // PROTOTYPE: смена варианта закрывает открытый состав.
    effect(() => {
      this.currentVariant();
      this.membersOpen.set(false);
    });

    this._deleteChatService.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
      this._router.navigateByUrl('/');
    });
  }

  // PROTOTYPE
  protected openMembers(): void {
    const chatTitle = this.chat()?.title ?? '';

    if (this.currentVariant() === 'A') {
      this._modalService.open(VariantAMembersModal, {
        title: 'Members',
        inputs: { state: this.prototypeMembers, chatTitle },
      });

      return;
    }

    const { bottom } = this._hostElement.nativeElement.getBoundingClientRect();

    this.membersHeight.set(window.innerHeight - bottom);
    this.membersOpen.update((open) => !open);
  }

  protected closeAddUserPopover(): void {
    this._addUserPopover()?.close();
  }

  protected deleteChat(): void {
    const chat = this.chat();

    if (!chat) {
      return;
    }

    this._confirmationService
      .confirm({
        title: 'Delete chat',
        subject: chat.title,
        message: DELETE_CHAT_MESSAGE,
        confirmLabel: 'Delete',
        isDangerous: true,
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this._deleteChatService.deleteChat({ chatId: chat.id });
        }
      });
  }
}
