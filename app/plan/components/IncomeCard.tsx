import { Card, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { getTotalIncomePerMonth } from '@/app/queries/getTotalIncome';
import { getTotalPlannedAmount } from '@/app/queries/getTotalPlannedAmount';
import { AddIncomeForm } from './AddIncomeForm';
import { EditIncome } from './EditIncome';

export async function IncomeCard({ month }: { month: string | undefined }) {
  const { income, totalIncome } = await getTotalIncomePerMonth({ date: month });
  const { totalPlanned } = await getTotalPlannedAmount({ date: month });
  
  const parsedMonth =
    month?.split('-')[0] ||
    new Date().toLocaleString('default', { month: 'long' });


  const remaining = totalIncome - totalPlanned;

  return (
    <Card>
      <CardContent>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>
                Total Income for: {parsedMonth}
              </p>
              <p className='text-2xl font-bold'>${totalIncome}</p>
            </div>
            <div className='rounded-full bg-muted p-3'>
              <DollarSign className='h-6 w-6 text-muted-foreground' />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            {income?.map((income) => (
              <div
                key={income.id}
                className='flex items-center justify-between text-sm'
              >
                <span className='font-medium'>{income.name}</span>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>${income.amount}</span>
                  <EditIncome incomeId={income.id} incomeName={income.name} incomeAmount={income.amount} />
                </div>
              </div>
            ))}
            <AddIncomeForm month={month} />
          </div>
          <div className='flex items-center pt-2 border-t'>
            <div className='flex items-center gap-2'>
              <p className='text-2xl font-bold text-muted-foreground'>
                ${remaining}
              </p>
              <span className='text-xs'>left to budget</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
