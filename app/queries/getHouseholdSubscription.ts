import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';
import { getCurrentUser } from './getCurrentUser';

/**
 * Returns the current household's subscription fields (synced from Stripe via webhooks).
 * Use with hasActiveSubscription() from @/lib/payments/utils to gate features.
 */
export const getHouseholdSubscription = cache(async () => {
  const supabase = await createClient();

  const { currentUser } = await getCurrentUser();
  if (!currentUser) return { householdSubscription: null };

  const { data, error } = await supabase
    .from('household')
    .select(
      'subscription_status, stripe_subscription_id, plan_name, stripe_product_id',
    )
    .eq('id', currentUser.household_id)
    .maybeSingle();

  if (error) {
    console.error('getHouseholdSubscription:', error);
    return { householdSubscription: null };
  }

  return { householdSubscription: data };
});
