'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe';

const SETTINGS_PATH = '/settings';

export async function createPortalSession(
  _prevState: null | { error?: string },
  _formData?: FormData
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) {
      return { error: 'You must be signed in to manage your subscription.' };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const returnUrl = `${baseUrl}${SETTINGS_PATH}`;

    let customerId: string;

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

    if (session.url) {
      redirect(session.url);
    }

    return { error: 'Could not open billing portal.' };
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Portal session error:', message);
    return { error: message };
  }
}
