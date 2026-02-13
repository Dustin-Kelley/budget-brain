import { type NextRequest, NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe';

/**
 * POST /api/stripe/checkout-session
 * Creates a Stripe Checkout session. Customize line_items, success_url, cancel_url,
 * and customer_email (e.g. from your auth) to match your product and flow.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { priceId, successUrl, cancelUrl, customerEmail } = body as {
      priceId?: string;
      successUrl?: string;
      cancelUrl?: string;
      customerEmail?: string;
    };

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.nextUrl.origin || 'http://localhost:3000');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId || undefined,
          quantity: 1,
        },
      ],
      success_url: successUrl ?? `${baseUrl}/plan?success=true`,
      cancel_url: cancelUrl ?? `${baseUrl}/plan?canceled=true`,
      ...(customerEmail && { customer_email: customerEmail }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Checkout session error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
