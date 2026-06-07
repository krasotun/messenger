# TODO

Now: `[Identity] Define profile editing contract`

Next:

1. Define editable and non-editable profile fields.
2. Check backend API/DTO contract for profile update.
3. Define application input/result and current session update behavior.
4. After contract: add `shared/ui/modal` primitive for profile editing flow.
5. Then wire avatar menu `Profile` action to open edit profile modal.

Scope: identity profile editing only; modal after contract; no chats, messages, or settings UI.

Done:

- `shared/ui/avatar` v1.
- `CurrentUserAvatarMenu` with avatar trigger, popover menu, and logout redirect.
- Normalized import aliases by application layer.
- Added `identity-access` public API entrypoint.
- Added `provideIdentityAccess()` provider boundary with DI contract spec.
- Added session/current-user public API exports for external `core` consumers.
- Replaced external static deep imports with `@domains/identity-access`.
- Documented lazy route imports as route boundary exception.
- Added ESLint static import boundary rules.
- Completed `[Architecture] Define identity-access public API and import boundaries`.
