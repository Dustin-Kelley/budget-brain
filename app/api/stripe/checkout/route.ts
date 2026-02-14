import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import type Stripe from 'stripe';

import { getUserById } from '@/app/queries/getUserById';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    if (!session.customer || typeof session.customer === 'string') {
      throw new Error('Invalid customer data from Stripe.');
    }

    const customerId = session.customer.id;
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      throw new Error('No subscription found for this session.');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });

    const plan = subscription.items.data[0]?.price;
    if (!plan) {
      throw new Error('No plan found for this subscription.');
    }

    const productId = (plan.product as Stripe.Product).id;
    if (!productId) {
      throw new Error('No product ID found for this subscription.');
    }

    // Prefer household_id from metadata (set by create-checkout-session); fallback to user lookup via client_reference_id
    let householdId = session.metadata?.household_id;

    if (!householdId && session.client_reference_id) {
      const { currentUser } = await getUserById(session.client_reference_id);
      householdId = currentUser?.household_id;
    }
    if (!householdId) {
      throw new Error(
        'Could not determine household for this checkout session (missing metadata.household_id or valid client_reference_id).',
      );
    }

    const { error } = await supabase
      .from('household')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_product_id: productId,
        plan_name: (plan.product as Stripe.Product).name,
        subscription_status: subscription.status,
      })
      .eq('id', householdId);

    if (error) {
      console.error('🚀 ~ GET ~ error:', error);
      throw new Error('Failed to update household in database.');
    }

    return NextResponse.redirect(
      new URL(
        `/checkout-success?email=${session.customer_details?.email}`,
        request.url,
      ),
    );
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
