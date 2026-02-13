import { stripe } from './stripe';

/** Household row or subset that includes subscription_status (from DB, synced via webhooks). */
export type HouseholdSubscription = {
  subscription_status: string | null;
  stripe_subscription_id?: string | null;
  subscription_current_period_end?: string | null;
};

/** Use this to check if the current household has an active subscription (after running the migration and syncing via webhooks). */
export function hasActiveSubscription(
  household: HouseholdSubscription | null | undefined
): boolean {
  if (!household) return false;
  return household.subscription_status === 'active';
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring',
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id,
  }));
}
