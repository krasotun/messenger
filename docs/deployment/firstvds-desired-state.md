# FirstVDS Desired State

> **Archived.** This document describes the VDS deployment that is no longer
> used. Production now runs on GitHub Pages; see `README.md` and
> `openspec/specs/deployment/spec.md`. The VDS described here has been
> decommissioned, the `VDS_*` secrets have been removed, and there is no
> rollback to it.

Purpose: define the target server state before writing Ansible playbooks.

Source inventory: `docs/deployment/current-server-inventory.md`.

## Base Server

- OS target: Ubuntu 24.04 LTS.
- Architecture target: `x86_64`.
- Control node: local MacBook with `ansible-core 2.21.0`.
- Initial FirstVDS access: root SSH only.
- Managed SSH user: `deploy`.
- Ansible connects as `deploy`.
- Privilege escalation uses sudo/become.

## Bootstrap Phase

- Use initial root SSH access only to prepare the managed user.
- Bootstrap responsibilities:
  - Create or verify user `deploy`.
  - Add `deploy` to the `sudo` group.
  - Configure `/home/deploy/.ssh/authorized_keys`.
  - Set SSH directory and authorized keys permissions.
- After bootstrap, verify Ansible access as `deploy`.
- After bootstrap verification, apply server roles as `deploy` with sudo/become.
- Do not use root SSH as the normal operational Ansible user.

## SSH And Admin User

- Create or verify user `deploy`.
- Add `deploy` to the `sudo` group.
- Keep SSH port `22`.
- Configure SSH key authentication for `deploy`.
- Do not store private keys in the repository.
- Target permissions:
  - `/home/deploy`: `deploy:deploy 750`.
  - `/home/deploy/.ssh`: `deploy:deploy 700`.
  - `/home/deploy/.ssh/authorized_keys`: `deploy:deploy 600`.

## Firewall

- Enable UFW on FirstVDS.
- Default incoming policy: deny.
- Default outgoing policy: allow.
- Allow:
  - `22/tcp` for SSH.
  - `80/tcp` for HTTP and Let's Encrypt validation.
  - `443/tcp` for HTTPS.
- This intentionally differs from the current server, where UFW is inactive.

## Packages

- Install runtime and deployment packages:
  - `nginx`.
  - `certbot`.
  - `python3-certbot-nginx`.
  - `openssh-server`.
  - `rsync`.
  - `ufw`.

## Nginx

- Serve the Angular production build as static files through host nginx.
- Web root: `/var/www/messenger`.
- Web root owner/group/mode: `deploy:deploy 755`.
- Enable only the `messenger` site.
- Do not enable the default nginx site.
- Keep the default nginx package file only as a reference if the package creates it.
- `messenger` site behavior:
  - `server_name`: target FirstVDS domain.
  - `root`: `/var/www/messenger`.
  - `index`: `index.html`.
  - SPA fallback: `try_files $uri $uri/ /index.html`.
  - HTTP redirects to HTTPS after certificate issuance.
- nginx service must be enabled and active.

## TLS

- Use Let's Encrypt through certbot nginx integration.
- Issue a new certificate for the target FirstVDS domain.
- Do not copy the current `73053.koara.live` private key.
- Renewal should be managed by `certbot.timer`.

## Deployment Contract

- GitHub Actions deploys the Angular production build over SSH/rsync as `deploy`.
- Deployment target: `/var/www/messenger`.
- No separate Angular systemd service is required while the app is static-only.
- Docker is not required for the current Angular-only deployment.
- Production deployment must not use the mock auth backend.

## Logs

- nginx logs live under `/var/log/nginx`.
- Use the standard nginx/logrotate behavior from Ubuntu packages.

## Environment Files

- No server-side environment files are required in `/var/www/messenger` for the current static frontend.

## Backups

- Web root backups are not required for the current static frontend.
- Accepted recovery path: redeploy the production build through GitHub Actions.
- If the deployment later gains server-side state, this decision must be revisited.

## Open Before Playbook

- Choose the final FirstVDS domain.
- Create the FirstVDS server.
- Verify SSH access to the new server.
- Verify Python availability on the new server.
