import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getMonthlyBudgetProgress } from '../queries/getMonthlyBudgetProgress';

export const MonthlyBudgetProgress = async ({
  date,
}: {
  date: string | undefined;
}) => {
  const { totalPlanned, spent, percentSpent, error } = await getMonthlyBudgetProgress({ date });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Budget Progress</CardTitle>
          <CardDescription>Error loading budget progress</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load budget data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Budget Progress</CardTitle>
        <CardDescription>Your spending progress for this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <div>Spent: ${spent.toLocaleString()}</div>
            <div>{percentSpent}%</div>
          </div>
          <Progress
            value={percentSpent}
            className='h-2'
          />
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <div>$0</div>
            <div>${totalPlanned.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
