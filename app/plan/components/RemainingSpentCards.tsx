'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { budgetData } from '../../data';

type LineItem = {
  id: string;
  category_id: string;
  name: string | null;
  month: number | null;
  year: number | null;
  planned_amount: number | null;
  spent_amount: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
};

type Category = {
  id: string;
  household_id: string;
  name: string | null;
  created_at: string;
  updated_at: string | null;
  color?: string;
  month?: number | null;
  year?: number | null;
  planned_amount?: number | null;
  spent_amount?: number | null;
  line_items: LineItem[];
};

export const RemainingSpentCards = ({
  spent,
  remaining,
  percentSpent,
  percentRemaining,
  categories,
}: {
  spent: number;
  remaining: number;
  percentSpent: number;
  percentRemaining: number;
  categories: Category[] | null ;
}) => {
  const [showSpent, setShowSpent] = useState(false);

  return (
    <>
      <div className='flex items-center justify-end gap-2'>
        <Label htmlFor='view-mode'>Show Spent</Label>
        <Switch
          id='view-mode'
          checked={showSpent}
          onCheckedChange={setShowSpent}
        />
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            {showSpent ? 'Spent' : 'Remaining'}
          </CardTitle>
          <Wallet className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <div className='text-2xl font-bold'>
            ${showSpent ? spent : remaining}
          </div>
          <p className='text-xs text-muted-foreground'>
            {showSpent ? percentSpent : percentRemaining}% of your budget{' '}
            {showSpent ? 'spent' : 'remaining'}
          </p>
          <Progress
            value={showSpent ? percentSpent : percentRemaining}
            className='h-2'
          />
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
        {categories?.map((category) => {
          const planned = category.line_items?.reduce((sum, item) => sum + (item.planned_amount ?? 0), 0) || 0;
          const spentAmt = category.line_items?.reduce((sum, item) => sum + (item.spent_amount ?? 0), 0) || 0;
          const remaining = planned - spentAmt;
          const percentRemaining = planned > 0 ? Math.round((remaining / planned) * 100) : 0;
          const percentSpent = planned > 0 ? Math.round((spentAmt / planned) * 100) : 0;
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
                <div className='flex items-center justify-between text-sm mb-1'>
                  <span>
                    {showSpent ? 'Spent' : 'Remaining'}: $
                    {showSpent ? spentAmt : remaining}
                  </span>
                  <span>{showSpent ? percentSpent : percentRemaining}%</span>
                </div>
                <Progress
                  value={showSpent ? percentSpent : percentRemaining}
                  className='h-2'
                />
                <div className='space-y-2 mt-4'>
                  {categorySubcategories.map((subcategory) => {
                    const subcategoryTransactions =
                      budgetData.transactions.filter(
                        (t) => t.subcategory_id === subcategory.id
                      );
                    const subcategorySpent = subcategoryTransactions.reduce(
                      (acc, t) => acc + t.amount,
                      0
                    );
                    const subcategoryRemaining =
                      subcategory.planned_amount - subcategorySpent;
                    const subcategoryPercentRemaining = Math.round(
                      (subcategoryRemaining / subcategory.planned_amount) * 100
                    );
                    const subcategoryPercentSpent = Math.round(
                      (subcategorySpent / subcategory.planned_amount) * 100
                    );

                    return (
                      <div
                        key={subcategory.id}
                        className='flex items-center justify-between text-sm'
                      >
                        <span className='text-muted-foreground'>
                          {subcategory.name}
                        </span>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>
                            $
                            {showSpent
                              ? subcategorySpent
                              : subcategoryRemaining}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {showSpent
                              ? subcategoryPercentSpent
                              : subcategoryPercentRemaining}
                            %
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className='pt-0'>
                <div className='flex w-full justify-between text-xs text-muted-foreground'>
                  <span>Budget: ${category.planned_amount}</span>
                  <span>
                    {showSpent ? 'Spent' : 'Remaining'}: $
                    {showSpent ? spentAmt : remaining}
                  </span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
};
