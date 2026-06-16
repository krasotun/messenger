# TODO

Emergency: `[Deployment] Move VDS deployment to https://firstvds.ru/ via Ansible`

Goal: learn Ansible by reproducing the current production server setup on a new VDS.

Status:

- Control node: local MacBook.
- Ansible is installed locally: `ansible-core 2.21.0`.
- Current server: `73053.koara.live`.
- SSH access to the current server works as `deploy`.
- Ansible ad-hoc `ping` succeeds; Python discovered at `/usr/bin/python3.12`.
- Ansible `become` works with sudo password; `whoami` returns `root`.
- Current server inventory document: `docs/deployment/current-server-inventory.md`.
- FirstVDS desired state document: `docs/deployment/firstvds-desired-state.md`.
- Current server inventory collected so far: OS, kernel, architecture, hostname, deploy user, sudo policy, SSH permissions, nginx service/sites, certbot certificate/renewal config, firewall status, listening ports, web root permissions, relevant runtime/deployment packages, nginx logs, environment/config file check, backups absence.
- Desired FirstVDS decisions: initial access is root SSH only, bootstrap `deploy`, then manage through `deploy` with sudo/become; keep SSH on `22`, enable UFW for `22/80/443`, enable only nginx `messenger` site, no web root backups for static frontend.
- New FirstVDS server is not created yet; proceed with current server inventory first.

Steps:

0. Check Ansible prerequisites:
   - Done: control node selected: local MacBook.
   - Done: Ansible installed locally: `ansible-core 2.21.0`.
   - Done: SSH access from the control node to the current server works.
   - Done: Python is available on the current server: `/usr/bin/python3.12`.
   - Done: sudo/become works with `--ask-become-pass`.
   - After creating the new FirstVDS server, verify SSH access and Python there.
1. Inventory the current server:
   - Done: OS and version.
   - Done: kernel, architecture, hostname.
   - Done: users, SSH access, sudo rules.
   - Done: nginx service state, enabled sites, and site configs.
   - Done: certbot version, certificate metadata, renewal config, and renewal timer.
   - Done: firewall status and listening ports.
   - Done: web root ownership, permissions, and top-level artifact shape.
   - Done: installed packages relevant to runtime and deployment.
   - Done: nginx log directory and rotation shape.
   - Done: environment/config files check.
   - Done: backups check; no backup flow is configured.
   - Done: define desired FirstVDS state from the inventory.
   - Next: create the FirstVDS server and verify root SSH/Python prerequisites there.
   - Then: bootstrap `deploy` user and switch normal Ansible access to `deploy` with sudo/become.
2. Convert inventory into Ansible-managed state:
   - Create inventory for the current server and the new FirstVDS server.
   - Extract repeatable setup into roles/playbooks.
   - Keep secrets outside the repository.
   - Make playbooks idempotent.
3. Apply the setup to the new VDS.
4. Verify deployment on the new VDS before switching traffic:
   - App starts successfully.
   - HTTPS works.
   - Reverse proxy routes are correct.
   - Logs and restart policy work.
   - Backup/restore path is understood.
5. Switch traffic only after rollback path is defined.

Now: `[Shared UI] Add modal primitive`

Next:

1. Define service-based modal primitive behavior and test contract.
2. Build `shared/ui/modal` on Angular CDK Overlay:
   - `ModalService.open(component)`.
   - `ModalRef.close()`.
   - Close on backdrop click.
   - Close on `Escape`.
   - Dispose overlay after close.
3. Then wire avatar menu `Profile` action to open edit profile modal.

Scope: shared modal primitive as prerequisite for identity profile editing; no profile form, no identity business logic, no chats, messages, or settings UI.

Learning:

- `[Bash] Build a simple project status helper`.
  1. Create `scripts/project-status.sh` with a shebang and strict mode.
  2. Print the project root.
  3. Print the current git branch.
  4. Print changed files from git status.
  5. Print available npm scripts from `package.json`.
  6. Add small checks for missing required commands.
  7. Run `bash -n scripts/project-status.sh` and then run the script manually.
- Later: evolve it into a boundary checker for import rules and shared/domain layer constraints.

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
