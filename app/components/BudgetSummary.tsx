import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { CreditCard, DollarSign, Wallet } from 'lucide-react';
import React from 'react';
import { getBudgetSummary } from '../queries/getBudgetSummary';

export const BudgetSummary = async ({date}: {date: string | undefined}) => {
  const currentDate = date || `${new Date().toLocaleString('default', { month: 'long' })}-${new Date().getFullYear()}`;
  const [month, year] = currentDate.split('-');
  const monthIndex = (new Date(`${month} 1, ${year}`).getMonth() + 1).toString();

  const { income, transactions } = await getBudgetSummary({month: monthIndex, year});

  if (!income || !transactions) {
    return null;
  }

  const planned = income.reduce((acc, income) => acc + (income.amount || 0), 0);
  const spent = transactions.reduce(
    (acc, transaction) => acc + (transaction.amount || 0),
    0
  );
  const remaining = planned - spent;

  const percentSpent = Math.round((spent / planned) * 100);

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
