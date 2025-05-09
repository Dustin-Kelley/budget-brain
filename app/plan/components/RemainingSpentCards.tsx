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
import { CategoryWithLineItems } from '@/types/types';


export const RemainingSpentCards = ({
  spentByLineItem,
  categories,
  totalIncome,
}: {
  spentByLineItem: { line_item_id: string; spent: number }[];
  categories: CategoryWithLineItems[] | null;
  totalIncome: number;
}) => {
  const [showSpent, setShowSpent] = useState(false);

  function getSpentForLineItem(lineItemId: string) {
    return spentByLineItem.find(s => s.line_item_id === lineItemId)?.spent ?? 0;
  }

  function getSpentForCategory(category: CategoryWithLineItems) {
    return category.line_items.reduce(
      (sum, item) => sum + getSpentForLineItem(item.id),
      0
    );
  }

  const totalSpent = spentByLineItem.reduce((sum, s) => sum + s.spent, 0);
  const totalRemaining = totalIncome - totalSpent;
  const percentSpent = totalIncome > 0 ? Math.round((totalSpent / totalIncome) * 100) : 0;
  const percentRemaining = totalIncome > 0 ? Math.round((totalRemaining / totalIncome) * 100) : 0;

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
            ${showSpent ? totalSpent : totalRemaining}
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
          const spentAmt = getSpentForCategory(category);
          const remaining = planned - spentAmt;
          const percentRemaining = planned > 0 ? Math.round((remaining / planned) * 100) : 0;
          const percentSpent = planned > 0 ? Math.round((spentAmt / planned) * 100) : 0;

          return (
            <Card key={category.id}>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-sm font-medium'>
                    {category.name}
                  </CardTitle>
                
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
                  {category.line_items.map((item) => {
                    console.log("🚀 ~ {category.line_items.map ~ item:",)
                    const itemSpent = getSpentForLineItem(item.id);
                    const itemPlanned = item.planned_amount ?? 0;
                    const itemRemaining = itemPlanned - itemSpent;
                    const itemPercentRemaining = itemPlanned > 0 ? Math.round((itemRemaining / itemPlanned) * 100) : 0;
                    const itemPercentSpent = itemPlanned > 0 ? Math.round((itemSpent / itemPlanned) * 100) : 0;
                    return (
                      <div
                        key={item.id}
                        className='flex items-center justify-between text-sm'
                      >
                        <span className='text-muted-foreground'>
                          {item.name}
                        </span>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>
                            $
                            {showSpent
                              ? itemSpent
                              : itemRemaining}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {showSpent
                              ? itemPercentSpent
                              : itemPercentRemaining}
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
                  <span>Budget: ${planned}</span>
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
