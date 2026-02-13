import { type Stripe } from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { stripe } from '@/lib/payments/stripe';
import { createServiceRoleClient } from '@/utils/supabase/server';

/**
 * Stripe webhook handler. Must use raw body for signature verification.
 * Configure this URL in Stripe Dashboard: Developers → Webhooks → Add endpoint
 * Subscribe to: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
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
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
  ];

  if (permittedEvents.includes(event.type)) {
    try {
      const supabase = createServiceRoleClient();

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const householdId = session.metadata?.household_id as string | undefined;
          const customerId =
            typeof session.customer === 'string'
              ? session.customer
              : session.customer?.id;
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription?.id;

          if (householdId && customerId) {
            const updates: {
              stripe_customer_id: string;
              stripe_subscription_id?: string;
              subscription_status?: string;
              subscription_current_period_end?: string | null;
            } = {
              stripe_customer_id: customerId,
            };
            if (subscriptionId) {
              updates.stripe_subscription_id = subscriptionId;
              const sub = await stripe.subscriptions.retrieve(subscriptionId);
              const subObj = sub as unknown as { status: string; current_period_end?: number };
              updates.subscription_status = subObj.status;
              updates.subscription_current_period_end = subObj.current_period_end
                ? new Date(subObj.current_period_end * 1000).toISOString()
                : null;
            }
            const { error } = await supabase
              .from('household')
              .update(updates)
              .eq('id', householdId);
            if (error) console.error('Webhook household update failed:', error);
          }
          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription & {
            current_period_end?: number;
          };
          const status =
            event.type === 'customer.subscription.deleted'
              ? 'canceled'
              : subscription.status;
          const periodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null;
          const { error } = await supabase
            .from('household')
            .update({
              subscription_status: status,
              subscription_current_period_end: periodEnd,
              ...(event.type === 'customer.subscription.deleted' && {
                stripe_subscription_id: null,
              }),
            })
            .eq('stripe_subscription_id', subscription.id);
          if (error) console.error('Webhook subscription update failed:', error);
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
