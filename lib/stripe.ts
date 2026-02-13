import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY is missing. Add it to your .env.local from the Stripe Dashboard.',
  );
}

/**
 * Server-side Stripe client. Use this in API routes and server components only.
 * Never expose STRIPE_SECRET_KEY to the client.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});
