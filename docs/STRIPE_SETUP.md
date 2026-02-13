# Stripe setup

This project is wired for Stripe Checkout and webhooks. Use your **sandbox (test) keys** in development.

## 1. Environment variables

Add these to `.env.local` (create it from `.env.example` if needed):

```bash
# Stripe (use test keys from https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # from step 3
```

- **Publishable key** (`pk_test_...`): safe to use in the browser; used by Stripe.js.
- **Secret key** (`sk_test_...`): server-only; used in `lib/stripe.ts` and API routes.
- **Webhook secret** (`whsec_...`): used to verify webhook signatures; get it when you create the webhook (step 3).

Optional for redirects:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000   # or your production URL
```

## 2. Create a product and price (test mode)

1. In [Stripe Dashboard](https://dashboard.stripe.com) → **Products** → **Add product**.
2. Add a **one-time** or **recurring** price.
3. Copy the **Price ID** (e.g. `price_...`). You’ll pass this as `priceId` when creating a Checkout session.

## 3. Webhook (required for `checkout.session.completed`)

**Local development**

1. Install Stripe CLI: <https://stripe.com/docs/stripe-cli>
2. Log in: `stripe login`
3. Forward events to your app:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. The CLI prints a **webhook signing secret** (`whsec_...`). Put that in `.env.local` as `STRIPE_WEBHOOK_SECRET`.

**Production**

1. **Developers** → **Webhooks** → **Add endpoint**.
2. URL: `https://your-domain.com/api/stripe/webhook`.
3. Select events (e.g. `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`).
4. Copy the **Signing secret** into your production env as `STRIPE_WEBHOOK_SECRET`.

## 4. Using Checkout from the app

**Server:** create a session by calling your API:

```ts
const res = await fetch('/api/stripe/checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_xxxx',           // from Dashboard
    customerEmail: user?.email,      // optional
    successUrl: '/plan?success=true',
    cancelUrl: '/plan',
  }),
});
const { url } = await res.json();
if (url) window.location.href = url;
```

**Client (Stripe.js):** for custom UIs you can load the publishable key and use Stripe.js; for redirect Checkout the API route above is enough.

## 5. After payment

- The webhook at `app/api/stripe/webhook/route.ts` receives `checkout.session.completed`.
- Implement your logic there (e.g. update Supabase, grant access, send email).
- The handler already logs the event; add your business logic in the `checkout.session.completed` case.

## Files added

| Path | Purpose |
|------|--------|
| `lib/stripe.ts` | Server-side Stripe client (secret key). |
| `app/api/stripe/checkout-session/route.ts` | POST → creates Checkout session, returns `url`. |
| `app/api/stripe/webhook/route.ts` | POST → receives Stripe events, verifies signature, handles events. |
