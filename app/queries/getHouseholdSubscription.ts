import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

/**
 * Returns the current household's subscription fields (synced from Stripe via webhooks).
 * Use with hasActiveSubscription() from @/lib/payments/utils to gate features.
 */
export const getHouseholdSubscription = cache(
  async (householdId: string | null) => {
    if (!householdId) return { household: null };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('household')
      .select('subscription_status, stripe_subscription_id, subscription_current_period_end')
      .eq('id', householdId)
      .maybeSingle();

    if (error) {
      console.error('getHouseholdSubscription:', error);
      return { household: null };
    }

    return { household: data };
  }
);
