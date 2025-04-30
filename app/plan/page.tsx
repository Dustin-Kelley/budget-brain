import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { budgetData } from '../data';
import { RemainingSpentTab } from './components/RemainingSpentTab';
import { BudgetHeader } from '../components/BudgetHeader';
import { IncomeCard } from './components/IncomeCard';
import { CategoryCards } from './components/CategoryCards';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const parsedMonth = month?.split('-')[0] || new Date().toLocaleString('default', { month: 'long' });

  return (
    <main className='flex flex-col gap-4'>
      <BudgetHeader month={month} />

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
          <IncomeCard month={parsedMonth} />
          <CategoryCards month={month} />
        </TabsContent>

        {/* Remaining Tab */}
        <TabsContent
          value='remaining'
          className='space-y-4'
        >
        <RemainingSpentTab />
        </TabsContent>
        <TabsContent value='transactions'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest spending activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-8'>
                {budgetData.transactions.map((transaction) => {
                  const category = budgetData.categories.find(
                    (c) => c.id === transaction.category_id
                  );
                  const lineItem = budgetData.lineItems.find(
                    (s) => s.id === transaction.subcategory_id
                  );
                  return (
                    <div
                      key={transaction.id}
                      className='flex items-center'
                    >
                      <div className='space-y-1'>
                        <p className='text-sm font-medium leading-none'>
                          {transaction.description}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {transaction.date}
                        </p>
                      </div>
                      <div className='ml-auto flex items-center gap-2'>
                        <div className='rounded-full px-2 py-1 text-xs bg-muted'>
                          {category?.name} / {lineItem?.name}
                        </div>
                        <div className='font-medium'>
                          -${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className='mt-4 flex justify-center'>
                <Button
                  variant='outline'
                  size='sm'
                  asChild
                >
                  <Link href='#'>View All Transactions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}




