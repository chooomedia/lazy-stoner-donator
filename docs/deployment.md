# Deployment

This project deploys as a static site to `https://lsd.cannachris.de/`.

The production branch is `lazy-stoner-donator`. Every push to that branch runs validation first. Deployment only starts after validation passes.

## Runtime Files

Only the static runtime files are deployed:

- `index.html`
- `robots.txt`
- `llms.txt`
- `sitemap.xml`
- `wishlist-products.json`
- `wishlist-content.json`
- `assets/`
- `js/`
- `styles/`

Repository internals, Cursor rules, docs, scripts, local reports, and `.git/` are not deployed.

## Required GitHub Secrets

Configure these in GitHub under `Settings -> Secrets and variables -> Actions`.

| Secret                            | Required | Purpose                                                                                            |
| --------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `ALL_INKL_HOST`                   | Yes      | SFTP/SSH host, for example the ALL-INKL server hostname                                            |
| `ALL_INKL_PORT`                   | No       | SSH/SFTP port, defaults to `22`                                                                    |
| `ALL_INKL_USERNAME`               | Yes      | Dedicated deploy user or ALL-INKL SSH/SFTP account                                                 |
| `ALL_INKL_PRIVATE_KEY`            | Yes      | Private key for the deploy user                                                                    |
| `ALL_INKL_PRIVATE_KEY_PASSPHRASE` | No       | Passphrase if the private key is encrypted                                                         |
| `ALL_INKL_HOST_KEY_FINGERPRINT`   | Yes      | SHA256 host key fingerprint for host verification                                                  |
| `ALL_INKL_REMOTE_PATH`            | Yes      | Document root mapped to `lsd.cannachris.de`, for example `/www/htdocs/w01fdbd6/lsd.cannachris.de/` |

Use a dedicated deploy key. Do not reuse a personal workstation key.

Known production values for this ALL-INKL account:

| Secret                          | Value                                                |
| ------------------------------- | ---------------------------------------------------- |
| `ALL_INKL_HOST`                 | `dd22834.kasserver.com`                              |
| `ALL_INKL_PORT`                 | `22`                                                 |
| `ALL_INKL_USERNAME`             | `ssh-w01fdbd6`                                       |
| `ALL_INKL_HOST_KEY_FINGERPRINT` | `SHA256:t+/3D/dxHw71Mfd4dzOQZjg6klolPZ7mJgSgTz7ECpE` |
| `ALL_INKL_REMOTE_PATH`          | `/www/htdocs/w01fdbd6/lsd.cannachris.de/`            |

The fingerprint above is the ECDSA host key presented to the SFTP action by `dd22834.kasserver.com`.

## Host Key Fingerprint

Pin the server host key before the first deploy.

```bash
ssh-keyscan -p 22 "$ALL_INKL_HOST" | ssh-keygen -lf -
```

Store the SHA256 fingerprint in `ALL_INKL_HOST_KEY_FINGERPRINT`.

Do not disable host key verification in CI.

## Deploy Key Setup

Generate a dedicated Ed25519 key pair for GitHub Actions.

```bash
ssh-keygen -t ed25519 -C "github-actions@lazy-stoner-donator" -f ./lazy-stoner-donator-deploy
```

Add the public key to the target ALL-INKL account's SSH keys or `authorized_keys`.

```bash
cat ./lazy-stoner-donator-deploy.pub
```

Add the private key content to the GitHub secret:

```bash
cat ./lazy-stoner-donator-deploy
```

After the secret is stored, remove the local private key copy if it is no longer needed.

## ALL-INKL Subdomain Bootstrap

Target hostname:

```text
lsd.cannachris.de
```

The subdomain should point to the same directory used as `ALL_INKL_REMOTE_PATH`.

Recommended document root based on the current ALL-INKL account path:

```text
/www/htdocs/w01fdbd6/lsd.cannachris.de/
```

In KAS, the subdomain path is usually configured relative to the account root. For this setup, use:

```text
lsd.cannachris.de
```

For SFTP deployment, use the absolute path:

```text
/www/htdocs/w01fdbd6/lsd.cannachris.de/
```

ALL-INKL supports subdomain provisioning through the KAS API. The relevant action is `add_subdomain` with:

```json
{
  "subdomain_name": "lsd",
  "domain_name": "cannachris.de",
  "subdomain_path": "PATH_TO_DOCUMENT_ROOT",
  "redirect_status": 0
}
```

If the subdomain already exists, use `update_subdomain` with:

```json
{
  "subdomain_name": "lsd.cannachris.de",
  "subdomain_path": "PATH_TO_DOCUMENT_ROOT",
  "redirect_status": 0
}
```

Replace `PATH_TO_DOCUMENT_ROOT` with the ALL-INKL path that should receive the static files. Use the same final path as `ALL_INKL_REMOTE_PATH`.

Example with a local KAS API shell client:

```bash
kasapi.sh -f "add_subdomain" -p '{
  "subdomain_name": "lsd",
  "domain_name": "cannachris.de",
  "subdomain_path": "PATH_TO_DOCUMENT_ROOT",
  "redirect_status": 0
}'
```

For an existing subdomain:

```bash
kasapi.sh -f "update_subdomain" -p '{
  "subdomain_name": "lsd.cannachris.de",
  "subdomain_path": "PATH_TO_DOCUMENT_ROOT",
  "redirect_status": 0
}'
```

If KAS API credentials are not available in CI, create or update the subdomain once in KAS manually:

1. Open KAS.
2. Create the subdomain `lsd` under `cannachris.de`.
3. Point it to the dedicated project directory.
4. Enable HTTPS/SSL for the hostname.
5. Use the directory as `ALL_INKL_REMOTE_PATH`.

## Local Validation

Validation and artifact preparation run as inline steps in `.github/workflows/deploy.yml` (no separate local scripts). Before pushing product-data changes, verify that the generated JSON-LD is in sync with the product JSON:

```bash
node scripts/build-schema.mjs
git diff --exit-code -- index.html en/index.html
```

The deploy artifact is assembled by the workflow into `deploy-artifact/` and uploaded as `lazy-stoner-donator-static`.

## GitHub Actions Flow

Workflow file:

```text
.github/workflows/deploy.yml
```

Jobs:

- `validate`: checks runtime files, JSON syntax, fallback data synchronization, JSON-LD product count, and JSON-LD/product-JSON synchronization via `node scripts/build-schema.mjs` + `git diff --exit-code`.
- `deploy`: uploads `deploy-artifact/` to ALL-INKL via SFTP after validation succeeds.

Deployment triggers:

- `pull_request` to `lazy-stoner-donator`: validation only
- `push` to `lazy-stoner-donator`: validation and deploy
- `workflow_dispatch`: manual validation and deploy from the selected ref if it is the production branch

## Rollback

Rollback is commit-based.

1. Identify the last known good commit.
2. Revert the broken commit or reset through a corrective commit.
3. Push to `lazy-stoner-donator`.
4. Let GitHub Actions validate and redeploy.

For emergency manual rollback, download the `lazy-stoner-donator-static` artifact from a previous successful workflow run and upload it to `ALL_INKL_REMOTE_PATH` through SFTP.

## First Production Smoke Test

After the first successful deploy:

```bash
curl --fail --location https://lsd.cannachris.de/
```

Check in a browser:

- page loads over HTTPS
- card grid renders
- product count matches `wishlist-products.json`
- share menu opens and closes
- footer toolbar does not cover footer links
- no visible product prices are shown

## Troubleshooting

### Deployment fails before SFTP

- Check that all required GitHub secrets are present.
- Reproduce the failing step locally: the validation and artifact steps are inline Python in `.github/workflows/deploy.yml`; the JSON-LD sync check is `node scripts/build-schema.mjs && git diff --exit-code -- index.html en/index.html`.
- Verify that fallback JavaScript mirrors match the JSON files.

### Host key verification fails

- Re-run `ssh-keyscan` from a trusted network.
- Compare the fingerprint with the ALL-INKL host key shown by your SSH client.
- Update `ALL_INKL_HOST_KEY_FINGERPRINT` only after verifying the host is correct.

### Upload succeeds but site is unchanged

- Confirm `ALL_INKL_REMOTE_PATH` is the document root for `lsd.cannachris.de`.
- Check whether the subdomain points to a different folder in KAS.
- Clear server or browser cache if applicable.

### Site loads without CSS or JavaScript

- Confirm `styles/`, `js/`, and `assets/` were included in the artifact.
- Check file permissions on the uploaded directories.
- Verify that paths in `index.html` are still relative.
