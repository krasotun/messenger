# Current Server Inventory

> **Archived.** This document describes the VDS deployment that is no longer
> used. Production now runs on GitHub Pages; see `README.md` and
> `openspec/specs/deployment/spec.md`. The VDS described here has been
> decommissioned, the `VDS_*` secrets have been removed, and there is no
> rollback to it.

Purpose: capture the current VDS state before reproducing it with Ansible on a new FastVPS server.

Related manual deployment notes: `docs/deployment/manual-vds-deploy.md`.

Target FastVPS state: `docs/deployment/fastvps-desired-state.md`.

## Server

- Host: `73053.koara.live`.
- SSH user: `deploy`.
- Control node: local MacBook.
- Ansible version on control node: `ansible-core 2.21.0`.

## Access Contract

- SSH access as `deploy` works.
- Ansible ad-hoc `ping` succeeds.
- Python discovered by Ansible: `/usr/bin/python3.12`.
- `sudo` requires a password.
- Ansible `become` works with `--ask-become-pass`.
- `whoami` with `become` returns `root`.
- Sudo policy for `deploy`: `(ALL : ALL) ALL`.
- Sudo defaults for `deploy`: `env_reset`, `mail_badpass`, `secure_path`, `use_pty`.

## Users And SSH

- Deployment/admin user: `deploy`.
- `deploy` uid/gid: `1000` / `1000`.
- `deploy` groups: `deploy`, `sudo`, `users`.
- `sudo` group contains `deploy`.
- Home directory permissions: `/home/deploy` is `750`, owner `deploy:deploy`.
- SSH directory permissions: `/home/deploy/.ssh` is `700`, owner `deploy:deploy`.
- Authorized keys file permissions: `/home/deploy/.ssh/authorized_keys` is `600`, owner `deploy:deploy`.
- Authorized key contents are intentionally not stored in this inventory.

## OS

- Distribution: Ubuntu.
- Version: `24.04`.
- Release codename: `noble`.
- Distribution family: Debian.
- Kernel: `6.8.0-124-generic`.
- Architecture: `x86_64`.
- Hostname: `73053`.
- `/etc/os-release` was parsed successfully by Ansible facts.

## Known Deployment Shape

- Host nginx serves the Angular production build.
- Web root: `/var/www/messenger`.
- HTTPS is provided by Let's Encrypt through certbot nginx integration.
- HTTP redirects to HTTPS.
- nginx systemd service is enabled and active.
- certbot renewal is scheduled through `certbot.timer`.
- No separate Angular systemd service is required for static frontend hosting.
- Docker is not used for the current Angular-only deployment.

## Systemd Services And Timers

- `nginx` is enabled.
- `nginx` is active.
- nginx version: `nginx/1.24.0 (Ubuntu)`.
- nginx enabled sites:
  - `default -> /etc/nginx/sites-available/default`.
  - `messenger -> /etc/nginx/sites-available/messenger`.
- `certbot.timer` is listed and activates `certbot.service`.
- Observed certbot timer schedule on 2026-06-16:
  - Last run: `Tue 2026-06-16 12:53:16 MSK`.
  - Next run: `Wed 2026-06-17 02:19:49 MSK`.

## Nginx Messenger Site

- Config path: `/etc/nginx/sites-available/messenger`.
- Enabled through: `/etc/nginx/sites-enabled/messenger`.
- `server_name`: `73053.koara.live`.
- Web root: `/var/www/messenger`.
- Index file: `index.html`.
- SPA fallback: `try_files $uri $uri/ /index.html`.
- HTTPS listener: `443 ssl`.
- TLS certificate: `/etc/letsencrypt/live/73053.koara.live/fullchain.pem`.
- TLS private key: `/etc/letsencrypt/live/73053.koara.live/privkey.pem`.
- Certbot nginx SSL options: `/etc/letsencrypt/options-ssl-nginx.conf`.
- Certbot DH params: `/etc/letsencrypt/ssl-dhparams.pem`.
- HTTP listener: `80`.
- HTTP behavior:
  - Requests for `73053.koara.live` redirect to `https://$host$request_uri`.
  - Fallback response is `404`, managed by Certbot.

## Nginx Default Site

- Config path: `/etc/nginx/sites-available/default`.
- Enabled through: `/etc/nginx/sites-enabled/default`.
- This is the standard Ubuntu nginx default server.
- Listens on:
  - `80 default_server`.
  - `[::]:80 default_server`.
- Root: `/var/www/html`.
- Index files: `index.html`, `index.htm`, `index.nginx-debian.html`.
- `server_name`: `_`.
- Location `/` uses `try_files $uri $uri/ =404`.
- Candidate desired state for the FastVPS migration: keep the file as package reference if present, but do not enable the default site unless there is a concrete reason.

## Certbot And TLS

- certbot version: `2.9.0`.
- Certificate name: `73053.koara.live`.
- Observed serial number: `6e887cd5f5cf1f704abfa06809bf4c570e0`.
- Key type: ECDSA.
- Domains: `73053.koara.live`.
- Expiry date: `2026-08-31 17:02:40+00:00`.
- Validity at collection time: 75 days remaining.
- Certificate path: `/etc/letsencrypt/live/73053.koara.live/fullchain.pem`.
- Private key path: `/etc/letsencrypt/live/73053.koara.live/privkey.pem`.
- certbot debug log path: `/var/log/letsencrypt/letsencrypt.log`.
- Private key contents are intentionally not stored in this inventory.
- Renewal config directory: `/etc/letsencrypt/renewal`.
- Renewal config file: `/etc/letsencrypt/renewal/73053.koara.live.conf`.
- Renewal config owner/group/mode: `root:root 644`.
- Renewal archive dir: `/etc/letsencrypt/archive/73053.koara.live`.
- Renewal cert path: `/etc/letsencrypt/live/73053.koara.live/cert.pem`.
- Renewal chain path: `/etc/letsencrypt/live/73053.koara.live/chain.pem`.
- Renewal fullchain path: `/etc/letsencrypt/live/73053.koara.live/fullchain.pem`.
- Renewal private key path: `/etc/letsencrypt/live/73053.koara.live/privkey.pem`.
- Renewal account id observed: `676de3b9063a706e82a930fbace8664d`.
- Renewal authenticator: `nginx`.
- Renewal installer: `nginx`.
- Renewal ACME server: `https://acme-v02.api.letsencrypt.org/directory`.
- Renewal key type: `ecdsa`.
- Desired FastVPS behavior: issue a new certificate for the target domain through certbot nginx integration rather than copying the current private key.

## Firewall And Network Exposure

- UFW status: inactive.
- Public TCP listeners:
  - `0.0.0.0:22` and `[::]:22`: `sshd`.
  - `0.0.0.0:80` and `[::]:80`: `nginx`.
  - `0.0.0.0:443`: `nginx`.
- Local resolver listeners:
  - `127.0.0.53:53`: `systemd-resolve`.
  - `127.0.0.54:53`: `systemd-resolve`.
- No unexpected public application ports were observed.
- Desired FastVPS behavior: define firewall policy explicitly instead of inheriting the current inactive UFW state by accident.

## Web Root

- Parent directory: `/var/www`.
- `/var/www` owner/group/mode: `root:root 755`.
- Application web root: `/var/www/messenger`.
- `/var/www/messenger` owner/group/mode: `deploy:deploy 755`.
- Top-level deployed artifact shape:
  - `index.html`.
  - hashed CSS bundle.
  - hashed JS main bundle.
  - hashed JS chunks.
  - `media/`.
  - `static/`.
- Top-level deployed files are owned by `deploy:deploy`.
- Top-level deployed files observed with mode `644`.
- Top-level deployed directories observed with mode `755`.
- Deployment implication: GitHub Actions can update `/var/www/messenger` over SSH/rsync as `deploy` without sudo.

## Installed Runtime And Deployment Packages

- `certbot`: `2.9.0-1`.
- `nginx`: `1.24.0-2ubuntu7.12`.
- `openssh-server`: `1:9.6p1-3ubuntu13.16`.
- `python3-certbot-nginx`: `2.9.0-1`.
- `rsync`: `3.2.7-1ubuntu1.5`.
- `ufw`: `0.36.2-6`.

## Logs

- nginx log directory: `/var/log/nginx`.
- Active logs:
  - `/var/log/nginx/access.log`.
  - `/var/log/nginx/error.log`.
- Rotated logs are present:
  - `access.log.1`.
  - `access.log.*.gz`.
  - `error.log.1`.
  - `error.log.*.gz`.
- Observed log ownership/group/mode: `www-data:adm 640`.
- Rotation is active for nginx logs.

## Environment Files

- No `.env*`, `*env*`, or `config*.json` files were found under `/var/www/messenger` with max depth 2.
- Current static frontend deployment does not rely on server-side environment files in the web root.

## Backups

- No backup flow is configured for the current deployment.
- For the current static frontend, the practical recovery path is redeploying the production build through GitHub Actions.
- Desired FastVPS behavior: explicitly decide whether web root backups are needed or whether redeploy from source/CD is the accepted recovery path.

## Inventory Log

- 2026-06-16: `ansible --version` confirmed locally: `ansible-core 2.21.0`.
- 2026-06-16: `ansible all -i '73053.koara.live,' -u deploy -m ping` succeeded.
- 2026-06-16: `ansible all -i '73053.koara.live,' -u deploy -m command -a 'whoami' --become --ask-become-pass` returned `root`.
- 2026-06-16: OS facts collected with `setup filter=ansible_distribution*`.
- 2026-06-16: Kernel, architecture, and hostname facts collected with Ansible `setup`.
- 2026-06-16: `deploy` user, sudo group membership, and SSH file permissions collected.
- 2026-06-16: sudo policy for `deploy` collected with `sudo -l -U deploy` through Ansible `become`.
- 2026-06-16: nginx service state and certbot timer collected through `systemctl`.
- 2026-06-16: nginx version and enabled sites collected.
- 2026-06-16: nginx `messenger` site config collected.
- 2026-06-16: nginx `default` site config collected; it is the standard Ubuntu default site.
- 2026-06-16: certbot version and certificate metadata collected.
- 2026-06-16: certbot renewal config collected.
- 2026-06-16: UFW status collected; UFW is inactive.
- 2026-06-16: listening ports and owning processes collected with `ss -tulpn`.
- 2026-06-16: web root ownership, permissions, and top-level artifact shape collected.
- 2026-06-16: relevant runtime and deployment package versions collected with `dpkg-query`.
- 2026-06-16: nginx log directory and rotation shape collected.
- 2026-06-16: web root checked for environment/config files; none were found.
- 2026-06-16: confirmed no backup flow is configured for the current static frontend deployment.

## Next Facts To Collect

- Decide desired FastVPS firewall policy.
- Decide whether default nginx site should be disabled on FastVPS.
- Decide whether web root backups are needed or redeploy through GitHub Actions is enough.
