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
import { getStripePrices, getStripeProducts } from '@/lib/payments/utils';

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
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const { householdSubscription } = await getHouseholdSubscription();

  if (householdSubscription?.subscription_status === 'active') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Subscription</CardTitle>
          <CardDescription>
            Your subscription is active. You can manage it below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Update your payment method, view invoices, or cancel your plan.
          </p>
        </CardContent>
      </Card>
    );
  }

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
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          No subscription yet — choose a plan below to get started.
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {prices.map((price) => {
            const product = products.find((p) => p.id === price.productId);
            return (
              <li key={price.id}>
                <form
                  action="/api/stripe/create-checkout-session"
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
                  {product && (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold">{product.name}</span>
                      {product.description && (
                        <span className="text-muted-foreground text-sm">
                          {product.description}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-1 items-baseline justify-between gap-2">
                    <span className="font-medium">
                      {formatPrice(price.unitAmount, price.currency)}
                      {formatInterval(price.interval)}
                    </span>
                    {price.trialPeriodDays != null &&
                      price.trialPeriodDays > 0 && (
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
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
