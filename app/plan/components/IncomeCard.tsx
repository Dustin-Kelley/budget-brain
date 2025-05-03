import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTotalIncomePerMonth } from "@/app/queries/getTotalIncome";
import { getCategories } from "@/app/queries/getCategories";
export async function IncomeCard({ month }: { month: string }) {

  const { income, totalIncome } = await getTotalIncomePerMonth({ date: month });
  const { categories } = await getCategories({ date: month });

  if (!income) {
    return 'No income found';
  }

  const totalPlanned = categories?.reduce(
    (total, category) => total + (category.line_items?.reduce(
      (total, lineItem) => total + (lineItem.planned_amount || 0),
      0
    ) || 0),
    0
  );

  const remaining = totalIncome - (totalPlanned ?? 0);

  return (
    <Card>
      <CardContent>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>Total Income for: {month}</p>
              <p className='text-2xl font-bold'>${totalIncome}</p>
            </div>
            <div className='rounded-full bg-muted p-3'>
              <DollarSign className='h-6 w-6 text-muted-foreground' />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            {income.map((income) => (
              <div
                key={income.id}
                className='flex items-center justify-between text-sm'
              >
                <span className='font-medium'>{income.name}</span>
                <span className='font-medium'>${income.amount}</span>
              </div>
            ))}
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start text-muted-foreground'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Income Source
            </Button>
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
};
