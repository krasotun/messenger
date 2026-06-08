# TODO

Now: `[UI] Add shared modal primitive`

Next:

1. Add `shared/ui/modal` primitive for profile editing flow.
2. Then wire avatar menu `Profile` action to open edit profile modal.

Scope: identity profile editing only; modal after contract; no chats, messages, or settings UI.

Done:

- Completed `[Identity] Define profile editing contract`.
- Added `/user` profile update API contract.
- Added update profile application contract.
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
