# TODO

Emergency: `[Deployment] Move VDS deployment to https://fastvps.ru/ via Ansible`

Goal: learn Ansible by reproducing the current production server setup on a new VDS.

Status:

- Control node: local MacBook.
- Ansible is installed locally: `ansible-core 2.21.0`.
- Current server: `73053.koara.live`.
- New FastVPS server: `s9865e4c2.fastvps-server.com`.
- SSH access to the current server works as `deploy`.
- Ansible ad-hoc `ping` succeeds; Python discovered at `/usr/bin/python3.12`.
- Ansible ad-hoc `ping` to FastVPS succeeds as `root`.
- FastVPS `deploy` user bootstrap playbook succeeded: user, sudo group, SSH key, and permissions created.
- Ansible ad-hoc `ping` to FastVPS succeeds as `deploy`.
- Ansible `become` on FastVPS works as `deploy` without sudo password.
- FastVPS HTTP smoke-check passed after deploying Angular artifact: `http://s9865e4c2.fastvps-server.com` returns `200 OK`.
- FastVPS HTTPS smoke-check passed for `https://s9865e4c2.fastvps-server.com`; HTTP redirects to HTTPS.
- FastVPS certbot renewal dry-run succeeded for `s9865e4c2.fastvps-server.com`.
- GitHub Actions deploy public key `github-actions-messenger-deploy` added to FastVPS `deploy` authorized keys.
- GitHub Actions deployment to FastVPS verified: `/var/www/messenger` updated on `s9865e4c2.fastvps-server.com` at `2026-06-17 20:09`; old server artifact remains from `2026-06-15 22:18`.
- Local `deploy-app.yml` run verified: Angular artifact uploads to FastVPS and deployed `index.html` exists.
- GitHub Actions deployment through `ansible/playbooks/deploy-app.yml` verified successfully.
- Old `73053.koara.live` VDS is no longer a rollback target; FastVPS is the active deployment target.
- Ansible `become` works with sudo password; `whoami` returns `root`.
- Current server inventory document: `docs/deployment/current-server-inventory.md`.
- FastVPS desired state document: `docs/deployment/fastvps-desired-state.md`.
- Ansible inventory: `ansible/inventories/hosts.yml`.
- Ansible bootstrap playbook: `ansible/playbooks/bootstrap-deploy-user.yml`.
- Ansible setup playbook: `ansible/playbooks/setup-server.yml`.
- Ansible HTTPS playbook: `ansible/playbooks/setup-https.yml`.
- Ansible app deploy playbook: `ansible/playbooks/deploy-app.yml`.
- Ansible responsibility split: local MacBook for server inventory/provisioning; GitHub Actions runner for repeatable Angular artifact deployment.
- Current server inventory collected so far: OS, kernel, architecture, hostname, deploy user, sudo policy, SSH permissions, nginx service/sites, certbot certificate/renewal config, firewall status, listening ports, web root permissions, relevant runtime/deployment packages, nginx logs, environment/config file check, backups absence.
- Desired FastVPS decisions: initial access is root SSH only, bootstrap `deploy` with passwordless sudo for Ansible, then manage through `deploy` with sudo/become; keep SSH on `22`, enable UFW for `22/80/443`, enable only nginx `messenger` site, no web root backups for static frontend.
- New FastVPS server hostname is known: `s9865e4c2.fastvps-server.com`.

Steps:

0. Check Ansible prerequisites:
   - Done: control node selected: local MacBook.
   - Done: Ansible installed locally: `ansible-core 2.21.0`.
   - Done: SSH access from the control node to the current server works.
   - Done: Python is available on the current server: `/usr/bin/python3.12`.
   - Done: sudo/become works with `--ask-become-pass`.
   - Done: root SSH access and Python verified on `s9865e4c2.fastvps-server.com`.
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
   - Done: define desired FastVPS state from the inventory.
   - Done: verify root SSH/Python prerequisites on `s9865e4c2.fastvps-server.com`.
   - Done: bootstrap `deploy` user.
   - Done: verify normal Ansible access to `deploy`.
   - Done: verify sudo/become for `deploy`.
2. Convert inventory into Ansible-managed state:
   - Done: create inventory for the current server and the new FastVPS server.
   - Done: verify Ansible `ping` against `fastvps_bootstrap`.
   - Done: define bootstrap contract for managed `deploy` user.
   - Done: run `bootstrap-deploy-user.yml`.
   - Done: verify `fastvps_managed` ping.
   - Done: verify `fastvps_managed` become without sudo password.
   - Done: define `setup-server.yml` contract for nginx, UFW, certbot, and web root.
   - Done: syntax-check and run `setup-server.yml`.
   - Done: verify HTTP before adding HTTPS.
   - Done: add HTTPS/certbot setup.
   - Done: run `setup-https.yml` and verify HTTPS plus HTTP redirect.
   - Done: verify certificate renewal with `certbot renew --dry-run`.
   - Done: update GitHub Actions `VDS_HOST` secret to `s9865e4c2.fastvps-server.com` and verify full CD deploy.
   - Next: define FastVPS-only rollback plan before decommissioning the old VDS.
   - Extract repeatable setup into roles/playbooks.
   - Keep `setup-server.yml` runnable locally from the MacBook for inventory, bootstrap, and provisioning.
   - Done: add `deploy-app.yml` runnable from GitHub Actions for deploying the built Angular artifact.
   - Done: verify local `deploy-app.yml` run against FastVPS.
   - Done: verify GitHub Actions deploy through `deploy-app.yml`.
   - Keep secrets outside the repository.
   - Make playbooks idempotent.
3. Apply the setup to the new VDS.
4. Verify deployment on the new VDS before switching traffic:
   - Done: app responds over HTTP after artifact deployment.
   - Done: app starts successfully.
   - Done: HTTPS works.
   - Done: certificate renewal dry-run works.
   - Reverse proxy routes are correct.
   - Logs and restart policy work.
   - Backup/restore path is understood.
5. Decommission old VDS only after FastVPS-only rollback path is defined.

Now: `[Shared UI] Add modal primitive`

Status:

- Feature contract drafted in `docs/features/shared-modal.md`: `Goal`, `Scope`, `Out of scope`, `Behavior`, `Test scenarios`, `Design notes` sections done.
- Key decisions locked in: single active modal at a time (no nested/stacked modals; guard is a defensive no-op, not a real user-facing path, and does not affect the already-open modal); close cross is intrinsic to the modal; unified `close` event regardless of trigger (cross, `Escape`, backdrop, or content-driven cancel); `save` is a separate content-driven event carrying data (payload must be asserted, not just the event); no "opened" notification (dropped per YAGNI, no consumer yet); three width presets (`small`/`medium`/`large`, default `medium`), height always driven by content and reactive to content changes; click inside modal does not close it; overlay is disposed after close.
- Entry point: `ModalService.open(component)` via Angular CDK Overlay, content wired through DI (not inheritance) for `ModalRef`-style close/save communication.
- `header`/`main`/`footer` layout dropped from this primitive's scope per YAGNI; revisit as separate shared components only if a real need shows up.
- Scaffold exists: `shared/ui/modal/modal-service.ts` (`open()` throws `Not implemented`) and its spec, both still at generator-default state.
- First TDD scenario picked: `ModalService.open(component)` renders the given component as overlay content (checked via CDK `OverlayContainer`), kept separate from the "no second modal" guard test, which needs the happy path in place first.
- Collaboration mode confirmed: user writes all code (production and tests); assistant only consults, reviews, and asks guiding questions.

Next:

1. Build `shared/ui/modal` on Angular CDK Overlay, TDD-driven from `docs/features/shared-modal.md` `Test scenarios`, one scenario at a time:
   - `ModalService.open(component)` renders content via overlay (in progress — user writing the test).
   - Single-instance guard as its own test, once open() works.
   - `ModalRef`-style `close`/`save` communication via DI, not inheritance.
   - Close on backdrop click, `Escape`, or built-in cross; click inside content does not close.
   - Width presets (`small`/`medium`/`large`, default `medium`); height by content.
   - Dispose overlay after close; restore page scroll.
2. Then wire avatar menu `Profile` action to open edit profile modal.

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
