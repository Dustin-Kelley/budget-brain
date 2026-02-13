import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { stripe } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const origin = headersList.get('origin') ?? 'https://budget-brain.io';

    const formData = await request.formData();
    const priceId = formData.get('priceId')?.toString();
    const householdId = formData.get('householdId')?.toString();
    const successUrl = formData.get('successUrl')?.toString();
    const cancelUrl = formData.get('cancelUrl')?.toString();

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url:
        successUrl ??
        `${origin}/checkout-sucess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${origin}/settings`,
      ...(householdId && { metadata: { household_id: householdId } }),
    });

    const sessionUrl = session.url ?? origin;
    return NextResponse.redirect(sessionUrl, 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
