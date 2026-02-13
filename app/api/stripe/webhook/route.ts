import { type Stripe } from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { stripe } from '@/lib/stripe';

/**
 * Stripe webhook handler. Must use raw body for signature verification.
 * In Next.js App Router, req.text() gives the raw body for this route.
 *
 * Configure this URL in Stripe Dashboard: Developers → Webhooks → Add endpoint
 * URL: https://your-domain.com/api/stripe/webhook
 * For local testing use: stripe listen --forward-to localhost:3000/api/stripe/webhook
 */
export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    const stripeSignature = (await headers()).get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSignature || !webhookSecret) {
      console.error('Missing stripe-signature or STRIPE_WEBHOOK_SECRET');
      return NextResponse.json(
        { message: 'Webhook configuration error' },
        { status: 500 },
      );
    }

    event = stripe.webhooks.constructEvent(
      await req.text(),
      stripeSignature,
      webhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (err instanceof Error) console.error(err);
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { message: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  const permittedEvents = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
  ];

  if (permittedEvents.includes(event.type)) {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(
            'Checkout completed:',
            session.id,
            session.payment_status,
          );
          // TODO: e.g. grant access, update DB, send confirmation
          break;
        }
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('PaymentIntent succeeded:', paymentIntent.id);
          break;
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.error(
            'Payment failed:',
            paymentIntent.last_payment_error?.message,
          );
          break;
        }
        default:
          console.log('Unhandled event type:', event.type);
      }
    } catch (error) {
      console.error('Webhook handler error:', error);
      return NextResponse.json(
        { message: 'Webhook handler failed' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
