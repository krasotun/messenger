# Manual VDS Deploy Guide

## Current Checkpoint

- Domain: `73053.koara.live`.
- Host nginx is installed and running.
- External check passed: `curl -I http://73053.koara.live` -> `HTTP/1.1 200 OK`.
- Server header: `nginx/1.24.0 (Ubuntu)`.
- Angular app is not deployed yet.

## Target For First Deploy

```text
domain -> VDS public IPv4 -> host nginx :80 -> Angular static files
```

- First deploy: HTTP-only.
- HTTPS with Let's Encrypt: next step after HTTP works.
- Docker: not used for first Angular-only deploy.
- Mock auth backend: never used in production deploy.

## Next Manual Steps

1. Create non-root admin user.
2. Add sudo access.
3. Add SSH key authentication.
4. Verify `ssh <user>@73053.koara.live`.
5. Keep root access as fallback until the new user is verified.
6. Build production frontend.
7. Place build output into `/var/www/messenger`.
8. Configure nginx SPA fallback to `index.html`.
9. Verify `/`, `/sign-in`, and `/sign-up` over HTTP.

## Future Ansible Draft

- Inventory host: `73053.koara.live`.
- Ansible user: future non-root admin user.
- Privilege model: `become: true` via sudo.
- Roles/tasks: bootstrap user, SSH key, packages, nginx, frontend static files.
- Nginx tasks: install, enable service, template site config, reload handler.
- Frontend tasks: create web root, upload artifact, set permissions.
- Verification: HTTP smoke checks for `/`, `/sign-in`, `/sign-up`.
- Later HTTPS tasks: install certbot, issue certificate, redirect HTTP to HTTPS, verify renewal.
