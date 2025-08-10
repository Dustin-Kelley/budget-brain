import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { CreditCard, DollarSign, Wallet } from 'lucide-react';
import React from 'react';
import { getBudgetSummary } from '../queries/getBudgetSummary';
import { getTotalPlannedAmount } from '../queries/getTotalPlannedAmount';

export const BudgetSummary = async ({date}: {date: string | undefined}) => {
  const { transactions } = await getBudgetSummary({date});
  const { totalPlanned } = await getTotalPlannedAmount({date});

  if (!transactions) {
    return null;
  }

  const planned = totalPlanned;
  const spent = transactions.reduce(
    (acc, transaction) => acc + (transaction.amount || 0),
    0
  ) || 0;
  const remaining = planned - spent;

  const percentSpent = planned > 0 ? Math.round((spent / planned) * 100) : 0;

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Planned Budget</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>${planned.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>
            Total budget for this month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Spent</CardTitle>
          <CreditCard className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>${spent.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>
            {percentSpent}% of your budget used
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Remaining</CardTitle>
          <Wallet className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            ${remaining.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            {100 - percentSpent}% of your budget left
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
