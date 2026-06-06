# TODO

Now: `[Identity] Add current user avatar menu`

Next:

1. Finish specs for `CurrentUserAvatarMenu`.
2. Spec: authenticated header renders user control on the right.
3. Implement with `shared/ui/avatar` + `shared/ui/popover`.
4. Wire current session/logout through identity application boundary.

Scope: authorization only; menu action: `Выйти`; no profile editing, chats, messages, settings UI, or non-auth flows.

Done: `shared/ui/avatar` v1; created `CurrentUserAvatarMenu`; started first component spec.
