import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

/**
 * Returns the current household's subscription fields (synced from Stripe via webhooks).
 * Use with hasActiveSubscription() from @/lib/payments/utils to gate features.
 */
export const getHouseholdSubscription = cache(
  async (householdId: string | null) => {
    if (!householdId) return { HouseholdSubscription: null };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('household')
      .select(
        'subscription_status, stripe_subscription_id, plan_name, stripe_product_id',
      )
      .eq('id', householdId)
      .maybeSingle();

    if (error) {
      console.error('getHouseholdSubscription:', error);
      return { HouseholdSubscription: null };
    }

    return { HouseholdSubscription: data };
  },
);
