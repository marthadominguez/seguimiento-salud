# Health tracker — Cloudflare Pages deployment

This project is independent of Claude: your data lives in a Cloudflare
database (KV) tied to your own account.

## Current status

This project is already deployed and working:

- **Dashboard:** https://seguimiento-salud.pages.dev
- **Pages project:** `seguimiento-salud` (created as "Direct Upload", without
  Cloudflare's native Git integration — see note below)
- **KV namespace:** `salud_mld` (bound in `wrangler.toml` as `HEALTH_KV`)
- **Access key:** configured as the `API_KEY` secret on the project
- **Automatic deployment:** a GitHub Actions workflow
  (`.github/workflows/deploy.yml`) deploys to Cloudflare Pages every time
  there's a push to `main`

You don't need to repeat the initial setup unless you're starting from a
new Cloudflare account. Skip straight to "Updating the dashboard in the
future" below.

### Note on Cloudflare's native Git integration

The "Connect to Git" option in the Cloudflare dashboard was intentionally
**not** used: in the current version of the dashboard, that option creates a
Worker-type project (Workers Builds) instead of a classic Pages project, and
the default build command (`wrangler deploy`) doesn't know how to handle this
project's `functions/` folder or `pages_build_output_dir`. That's why
automatic deployment is done with a custom GitHub Actions workflow instead of
the native integration.

## Structure

```
public/index.html        → the dashboard (frontend)
functions/api/storage.js → the function that saves/reads data (backend)
wrangler.toml            → deployment configuration
```

## Requirements

- Free Cloudflare account: https://dash.cloudflare.com/sign-up
- Node.js installed on your computer
- Wrangler (Cloudflare CLI): installed in step 1

## Initial setup (reference — already done on this account)

### 1. Install Wrangler and connect your account

```bash
npm install -g wrangler
wrangler login
```

This opens your browser to authorize your Cloudflare account.

### 2. Choose your access key

Think of a key (like a password) you'll use to access the dashboard from any
device. Save it somewhere secure (a password manager) — you'll need it in
step 5 and every time you log in from a new device.

### 3. Create the database (KV namespace)

From the project folder:

```bash
wrangler kv namespace create HEALTH_KV
```

This prints something like:

```
[[kv_namespaces]]
binding = "HEALTH_KV"
id = "abcd1234..."
```

Copy those 3 lines and paste them at the end of `wrangler.toml`, replacing
the commented-out block that's already there.

### 4. Create the Pages project

```bash
wrangler pages project create seguimiento-salud
```

Choose the default region/settings when prompted.

### 5. Set your access key as a secret

```bash
wrangler pages secret put API_KEY --project-name=seguimiento-salud
```

It will ask for the value: paste the key you chose in step 2.

### 6. Deploy

```bash
wrangler pages deploy public --project-name=seguimiento-salud
```

When it finishes it gives you a URL like `https://seguimiento-salud.pages.dev`
— that's your dashboard, now accessible from any PC or phone.

### 7. Log in for the first time

Open the URL, enter the access key you chose. The browser remembers it
locally so you won't be asked for it again on that same device (but you will
the first time on each new device).

## Updating the dashboard in the future

If you want to change the design or add a new marker, edit
`public/index.html`, commit, and push to `main`:

```bash
git add -A
git commit -m "your message"
git push origin main
```

GitHub Actions automatically deploys to Cloudflare Pages on every push
(check the "Actions" tab of the repo to see progress). If you need to deploy
manually without going through GitHub, you can also run:

```bash
wrangler pages deploy public --project-name=seguimiento-salud
```

Your saved data isn't lost — it lives in the KV namespace, separate from the
code.

### Setting up automatic deployment (one time only)

The GitHub Actions workflow needs two repo secrets (Settings →
Secrets and variables → Actions → New repository secret):

- `CLOUDFLARE_API_TOKEN` — a token created at
  https://dash.cloudflare.com/profile/api-tokens with "Account → Cloudflare
  Pages → Edit" permission (you can use the "Edit Cloudflare Workers"
  template or create a custom one).
- `CLOUDFLARE_ACCOUNT_ID` — `8955f80093107f6b7ef8307ab22608a6`

## Changing the access key

```bash
printf 'YOUR_NEW_KEY' | wrangler pages secret put API_KEY --project-name=seguimiento-salud
```

Use `printf` (not `echo`) to avoid including a trailing newline in the
value — a secret with an extra trailing newline won't match what the browser
sends, and the "correct" key will appear to be wrong.

⚠️ Cloudflare Pages secrets and environment variables only apply to
deployments made **after** they're configured. If you change the key, also
run the "Updating the dashboard" command above so the change takes effect.

## Security note

This uses a simple shared key, which is sufficient for personal use. If at
some point you want something more robust (email login, multiple users), it
can be migrated to Cloudflare Access or a provider like Supabase/Firebase —
let me know if you get to that point.
