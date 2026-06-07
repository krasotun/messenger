# TODO

Now: `[Architecture] Define identity-access public API and import boundaries`

Next:

1. Normalize import aliases by application layer.
2. Define `identity-access` public API.
3. Replace external deep domain imports with public API imports.
4. Add documented or linted import boundary rules.
5. Resume `[Identity] Define profile editing contract`:
   - Define editable and non-editable profile fields.
   - Check backend API/DTO contract for profile update.
   - Define application input/result and current session update behavior.
   - After contract: add `shared/ui/modal` primitive for profile editing flow.
   - Then wire avatar menu `Profile` action to open edit profile modal.

Scope: architecture boundary clarification only; no product behavior changes, no chats, messages, or settings UI.

Done: `shared/ui/avatar` v1; `CurrentUserAvatarMenu` with avatar trigger, popover menu, and logout redirect.
