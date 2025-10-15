import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RemainingSpentTab } from './components/RemainingSpentTab';
import { BudgetHeader } from '../components/BudgetHeader';
import { IncomeCard } from './components/IncomeCard';
import { CategoryCards } from './components/CategoryCards';
import { TransactionsTab } from './components/TransactionsTab';
import { RolloverBudgetState } from '../components/RolloverBudgetState';
import { getCategories } from '../queries/getCategories';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;

  const { categories } = await getCategories({ date: month });

  if (!categories || categories.length === 0) {
    return (
      <main className='flex flex-col gap-4'>
        <BudgetHeader month={month} />

        <RolloverBudgetState month={month} />
      </main>
    );
  }

  return (
    <main className='flex flex-col gap-4'>
      <div className='flex flex-col'>
        <BudgetHeader month={month} />
        <p className='text-muted-foreground'>Plan your budget</p>
      </div>

      {/* Budget Details */}
      <Tabs defaultValue='planned'>
        <TabsList className='grid grid-cols-3'>
          <TabsTrigger value='planned'>Planned</TabsTrigger>
          <TabsTrigger value='remaining'>Remaining</TabsTrigger>
          <TabsTrigger value='transactions'>Transactions</TabsTrigger>
        </TabsList>

        {/* Planned Tab */}
        <TabsContent
          value='planned'
          className='flex flex-col gap-4'
        >
          <IncomeCard month={month} />
          <CategoryCards month={month} />
        </TabsContent>

        {/* Remaining Tab */}
        <TabsContent
          value='remaining'
          className='flex flex-col gap-4'
        >
          <RemainingSpentTab month={month} />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value='transactions'>
          <TransactionsTab month={month} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
