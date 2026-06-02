# Manual VDS Deploy Guide

## Current Checkpoint

- Domain: `73053.koara.live`.
- Host nginx is installed and running.
- Non-root admin user: `deploy`.
- Web root: `/var/www/messenger`.
- Angular production build is deployed through host nginx.
- SPA fallback is configured to `index.html`.
- nginx systemd autostart is enabled.
- No separate Angular application service is required for static frontend hosting.
- External HTTPS check passed: `https://73053.koara.live` works.
- HTTP -> HTTPS redirect is verified.
- HTTPS routes `/`, `/sign-in`, and `/sign-up` are verified.
- Let's Encrypt certificate is deployed through certbot nginx integration.
- Certificate renewal dry-run passed.
- Production deployment does not use mock auth backend.
- Server header: `nginx/1.24.0 (Ubuntu)`.

## First Deploy Contract

```text
domain -> VDS public IPv4 -> host nginx :443 -> Angular static files
```

- First deploy started as HTTP-only and was upgraded to HTTPS.
- HTTPS is provided by Let's Encrypt.
- Docker: not used for first Angular-only deploy.
- Mock auth backend: never used in production deploy.
- CORS/session-cookie verification is deferred until a production authorization API exists.

## Completed Manual Steps

1. Create non-root admin user `deploy`.
2. Add sudo access.
3. Add SSH key authentication.
4. Verify `ssh deploy@73053.koara.live`.
5. Keep root access as fallback until the new user is verified.
6. Build production frontend.
7. Place build output into `/var/www/messenger`.
8. Configure nginx SPA fallback to `index.html`.
9. Verify `/`, `/sign-in`, and `/sign-up` over HTTP.
10. Verify nginx autostart through systemd.
11. Add HTTPS with Let's Encrypt.
12. Verify HTTPS access.
13. Verify certificate renewal with `certbot renew --dry-run`.
14. Verify HTTP -> HTTPS redirect.
15. Verify `/`, `/sign-in`, and `/sign-up` over HTTPS.
16. Confirm mock auth backend is not deployed to production.

## Next Delivery Steps

1. Continue authorization-only frontend development.
2. Consider Ansible later to make VDS provisioning reproducible.

## GitHub Actions CD

Workflow:

```text
.github/workflows/deploy.yml
```

Trigger:

```text
push to main
workflow_dispatch
```

Contract:

```text
npm ci -> lint -> test:ci -> e2e -> build -> rsync dist/messenger/browser/ to VDS web root
```

Behavioral e2e run through `npm run e2e` before deployment. Visual specs are excluded by the existing `@visual` grep-invert configuration.

Required GitHub Actions secrets:

```text
VDS_SSH_PRIVATE_KEY
VDS_HOST=73053.koara.live
VDS_USER=deploy
VDS_WEB_ROOT=/var/www/messenger
```

Deployment target:

```text
deploy@73053.koara.live:/var/www/messenger/
```

CD runs automatically on push to `main`. Manual `workflow_dispatch` is kept as an explicit fallback.

Automatic deploy on push to `main` has been verified successfully.

## Future Ansible Draft

- Inventory host: `73053.koara.live`.
- Ansible user: `deploy`.
- Privilege model: `become: true` via sudo.
- Roles/tasks: bootstrap user, SSH key, packages, nginx, frontend static files.
- Nginx tasks: install, enable service, template site config, reload handler.
- Frontend tasks: create web root, upload artifact, set permissions.
- No frontend systemd service while the app is static-only.
- Verification: HTTP smoke checks for `/`, `/sign-in`, `/sign-up`.
- Later HTTPS tasks: install certbot, issue certificate, redirect HTTP to HTTPS, verify renewal.
