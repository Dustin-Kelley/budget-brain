import { Plus, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { budgetData } from '../data';
import { RemainingSpentTab } from './components/RemainingSpentTab';
import { BudgetHeader } from '../components/BudgetHeader';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const parsedMonth = month?.split('-')[0] || new Date().toLocaleString('default', { month: 'long' });
  const totalIncome = budgetData.income.reduce((total, income) => total + income.amount, 0);

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
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
            {budgetData.categories.map((category) => {
              const categorySubcategories = budgetData.lineItems.filter(
                (sub) => sub.category_id === category.id
              );
              return (
                <Card key={category.id}>
                  <CardHeader className='pb-2'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-sm font-medium'>
                        {category.name}
                      </CardTitle>
                      <div
                        className={`h-3 w-3 rounded-full ${category.color}`}
                      ></div>
                    </div>
                  </CardHeader>
                  <CardContent className='pb-2'>
                    <div className='space-y-2'>
                      {categorySubcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className='flex items-center justify-between text-sm'
                        >
                          <span className='text-muted-foreground'>
                            {subcategory.name}
                          </span>
                          <span className='font-medium'>
                            ${subcategory.planned_amount}
                          </span>
                        </div>
                      ))}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start text-muted-foreground'
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        Add New Item
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className='pt-0'>
                    <div className='flex w-full justify-between text-xs text-muted-foreground'>
                      <span>Total Budget: ${category.planned_amount}</span>
                      <span>{Math.round((category.planned_amount / totalIncome) * 100)}%</span>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
            <Card className='border-dashed opacity-50'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-sm font-medium'>
                    Add New Category
                  </CardTitle>
                  <div className='h-3 w-3 rounded-full bg-muted'></div>
                </div>
              </CardHeader>
              <CardContent className='pb-2'>
                <div className='flex items-center justify-center h-24'>
                  <Plus className='h-8 w-8 text-muted-foreground' />
                </div>
              </CardContent>
              <CardFooter className='pt-0'>
                <div className='flex w-full justify-between text-xs text-muted-foreground'>
                  <span>Total Budget: $0</span>
                </div>
              </CardFooter>
            </Card>
          </div>
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

const IncomeCard = ({ month }: { month: string }) => {
  const totalIncome = budgetData.income.reduce(
    (total, income) => total + income.amount,
    0
  );
  const totalPlanned = budgetData.categories.reduce(
    (total, category) => total + category.planned_amount,
    0
  );
  const remaining = totalIncome - totalPlanned;

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
            {budgetData.income.map((income) => (
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


