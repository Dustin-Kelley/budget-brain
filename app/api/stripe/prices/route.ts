import { NextResponse } from 'next/server';

import { getStripePrices, getStripeProducts } from '@/lib/payments/utils';

/**
 * GET /api/stripe/prices
 * Returns active Stripe prices and products for public pricing pages.
 * No auth required.
 */
export async function GET() {
  try {
    const [prices, products] = await Promise.all([
      getStripePrices(),
      getStripeProducts(),
    ]);

    return NextResponse.json({ prices, products });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Stripe prices API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
