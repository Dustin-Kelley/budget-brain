import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

import { getHouseholdSubscription } from '@/app/queries/getHouseholdSubscription';
import { getStripePrices, hasActiveSubscription } from '@/lib/payments/utils';

function formatPrice(unitAmount: number | null, currency: string) {
  if (unitAmount == null) return '—';
  const value = unitAmount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

function formatInterval(interval: string | undefined) {
  if (!interval) return '';
  return interval === 'month' ? '/ month' : `/${interval}`;
}

type ManageSubscriptionCardProps = {
  householdId: string | null;
};

export async function ManageSubscriptionCard({
  householdId,
}: ManageSubscriptionCardProps) {
  const [prices, { household: subscription }] = await Promise.all([
    getStripePrices(),
    getHouseholdSubscription(householdId),
  ]);
  const isActive = hasActiveSubscription(subscription);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Subscription
        </CardTitle>
        <CardDescription>
          Choose a plan to subscribe. You’ll be redirected to Stripe Checkout.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={
            isActive
              ? 'rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400'
              : 'rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground'
          }
        >
          {isActive ? (
            <>
              Subscription: Active
              {subscription?.subscription_current_period_end && (
                <span className="ml-1 font-normal opacity-90">
                  (renews{' '}
                  {new Date(
                    subscription.subscription_current_period_end
                  ).toLocaleDateString()}
                  )
                </span>
              )}
            </>
          ) : (
            'No active plan'
          )}
        </div>
        {prices.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No subscription plans available at the moment.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {prices.map((price) => (
              <li key={price.id}>
                <form
                  action="/api/stripe/checkout-session"
                  method="POST"
                  className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4"
                >
                  <input type="hidden" name="priceId" value={price.id} />
                  {householdId && (
                    <input
                      type="hidden"
                      name="householdId"
                      value={householdId}
                    />
                  )}
                  <div className="flex flex-1 items-baseline justify-between gap-2">
                    <span className="font-medium">
                      {formatPrice(price.unitAmount, price.currency)}
                      {formatInterval(price.interval)}
                    </span>
                    {price.trialPeriodDays != null && price.trialPeriodDays > 0 && (
                      <span className="text-muted-foreground text-xs">
                        {price.trialPeriodDays}-day free trial
                      </span>
                    )}
                  </div>
                  <Button type="submit" variant="outline" className="w-full">
                    Checkout
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
