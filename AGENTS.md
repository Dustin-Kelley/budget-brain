# AGENTS.md

## Cursor Cloud specific instructions

Budget Brain is a Next.js 15 (App Router, Turbopack) + Supabase app. Auth is
email OTP; data lives in a local Supabase (Postgres) stack. There is no test
framework configured (see `WARP.md`). Standard commands live in `package.json`
(`dev`, `build`, `lint`, `start`) and `WARP.md`.

### Services and how to run them

Two services must run for the app to work end to end:

1. Local Supabase (Docker). Start the Docker daemon, then Supabase from the repo
   root:
   - `sudo dockerd > /tmp/dockerd.log 2>&1 &` (only if `docker info` fails)
   - `sudo supabase start` (run from `/workspace`; applies migrations + config)
   - Stop/reset with `sudo supabase stop --no-backup` then `sudo supabase start`.
   - Studio: http://localhost:54323 ; Mailpit (emails): http://localhost:54324
2. Next.js dev server: `npm run dev` (serves http://localhost:3000).

The dev server needs `.env.local` (git-ignored). If it is missing, recreate it
with the local Supabase defaults (these keys are the CLI's standard local dev
keys, not secrets). Get current values any time with `sudo supabase status -o env`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from `supabase status -o env`>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY from `supabase status -o env`>
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Stripe is optional; placeholders keep lib/payments/stripe.ts from throwing on import
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
```

### Non-obvious gotchas

- The repo ships NO SQL migrations; the DB schema only existed as generated
  types in `supabase/supabase.ts`. `supabase/migrations/00000000000000_init_schema.sql`
  was reconstructed from those types for local dev. It has RLS disabled (access
  is via the anon key + authenticated session). It is a best-effort match to
  production, not authoritative.
- Email OTP login: local Supabase does not send real email. A custom local
  template (`supabase/templates/magic_link.html`, wired in `supabase/config.toml`)
  surfaces both the 6-digit code and a "Sign in" link to the app's
  `/auth/confirm` route. Read them at Mailpit (http://localhost:54324).
- Use `localhost` (not `127.0.0.1`) consistently for the app in the browser;
  mixing the two hosts splits auth cookies and breaks the session. `site_url`
  in `supabase/config.toml` is set to `http://localhost:3000` for this reason.
- The `input-otp` widget on `/login` is unreliable for automated (synthetic)
  keyboard input. For scripted/agent logins, complete auth via the Mailpit
  "Sign in" link (which hits `/auth/confirm`) instead of typing the code. That
  link is one-time use.
- Stripe (checkout/subscriptions) is optional. `lib/payments/stripe.ts` throws
  at import if `STRIPE_SECRET_KEY` is unset, so keep the placeholder set even if
  you don't exercise payments; real Stripe test keys are only needed for the
  pricing/checkout/settings-subscription flows.
- After login the app redirects to the `/welcome` marketing page; the actual
  dashboard is at `/` and the budgeting UI is at `/plan`.

### Lint / build / test

- Lint: `npm run lint`
- Build: `npm run build`
- Run (dev): `npm run dev`
- Tests: none configured.
