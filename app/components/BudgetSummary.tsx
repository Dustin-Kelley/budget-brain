import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { CreditCard, DollarSign, Wallet } from 'lucide-react';
import React from 'react';
import { getTotalPlannedAmount } from '../queries/getTotalPlannedAmount';
import { getSpentAmount } from '../queries/getSpentAmount';

export const BudgetSummary = async ({date}: {date: string | undefined}) => {
  const { totalPlanned, totalPlannedError } = await getTotalPlannedAmount({date});
  const { spentAmount, spentAmountError } = await getSpentAmount({date});

  if (totalPlannedError || spentAmountError) {
    return (
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Budget Summary</CardTitle>
            <CardDescription>Error loading budget summary</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const remaining = totalPlanned - spentAmount;

  const percentSpent = totalPlanned > 0 ? Math.round((spentAmount / totalPlanned) * 100) : 0;

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Planned Budget</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>${totalPlanned}</div>
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
          <div className='text-2xl font-bold'>${spentAmount}</div>
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
            ${remaining}
          </div>
          <p className='text-xs text-muted-foreground'>
            {100 - percentSpent}% of your budget left
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
