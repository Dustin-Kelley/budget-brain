'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';

import { createPortalSession } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? 'Opening…' : 'Manage subscription'}
    </Button>
  );
}

export function ManageSubscriptionCard() {
  const [state, formAction] = useActionState(createPortalSession, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Subscription
        </CardTitle>
        <CardDescription>
          Manage your plan, payment method, and billing history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
