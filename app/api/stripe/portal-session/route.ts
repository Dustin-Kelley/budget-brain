import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/payments/stripe';

/**
 * POST /api/stripe/portal-session
 * Creates a Stripe Customer Portal session so the user can manage subscription,
 * payment methods, and invoices. Finds or creates a Stripe customer by email.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to manage your subscription.' },
        { status: 401 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      request.nextUrl.origin ??
      'http://localhost:3000';
    const returnUrl = `${baseUrl}/settings`;

    let customerId: string | null = null;

    const existing = await stripe.customers.search({
      query: `email:'${authUser.email}'`,
      limit: 1,
    });

    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: authUser.email,
      });
      customerId = customer.id;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Portal session error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
