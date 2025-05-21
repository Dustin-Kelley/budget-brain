'use client';

import { useState } from 'react';
import { PlusIcon, Wallet } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CategoryWithLineItems } from '@/types/types';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    return (
      spentByLineItem.find((s) => s.line_item_id === lineItemId)?.spent ?? 0
    );
  }

  function getSpentForCategory(category: CategoryWithLineItems) {
    return category.line_items.reduce(
      (sum, item) => sum + getSpentForLineItem(item.id),
      0
    );
  }

  const totalSpent = spentByLineItem.reduce((sum, s) => sum + s.spent, 0);
  const totalRemaining = totalIncome - totalSpent;
  const percentSpent =
    totalIncome > 0 ? Math.round((totalSpent / totalIncome) * 100) : 0;
  const percentRemaining =
    totalIncome > 0 ? Math.round((totalRemaining / totalIncome) * 100) : 0;

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex p-4 justify-end items-center gap-4'>
          <div className='flex border rounded-2xl p-4 items-center gap-4 font-medium'>

          <Label htmlFor='view-mode'>{showSpent ? 'Showing Spent' : 'Showing Remaining'}</Label>
          <Switch
            className='scale-150'
            id='view-mode'
            checked={showSpent}
            onCheckedChange={setShowSpent}
          />

          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
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
      </div>

      {/* Category Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
        {categories?.map((category) => {
          const planned =
            category.line_items?.reduce(
              (sum, item) => sum + (item.planned_amount ?? 0),
              0
            ) || 0;
          const spentAmt = getSpentForCategory(category);
          const remaining = planned - spentAmt;
          const percentRemaining =
            planned > 0 ? Math.round((remaining / planned) * 100) : 0;
          const percentSpent =
            planned > 0 ? Math.round((spentAmt / planned) * 100) : 0;

          return (
            <Card key={category.id}>
              <CardHeader className='pb-2'>
                <div className='flex flex-col gap-2'>
                  <CardTitle className='text-lg font-bold'>
                    {category.name}
                  </CardTitle>
                  <div className='flex items-center justify-between text-sm mb-1'>
                    <Badge
                      variant='outline'
                      className='font-medium'
                    >
                      {showSpent ? 'Spent' : 'Remaining'}: $
                      {showSpent ? spentAmt : remaining} / ${planned}
                    </Badge>
                    <Badge
                      variant='outline'
                      className='font-medium'
                    >
                      {showSpent ? percentSpent : percentRemaining}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pb-2'>
                <Separator />
                {category.line_items.map((item) => {
                  const itemSpent = getSpentForLineItem(item.id);
                  const itemPlanned = item.planned_amount ?? 0;
                  const itemRemaining = itemPlanned - itemSpent;
                  const itemPercentRemaining =
                    itemPlanned > 0
                      ? Math.round((itemRemaining / itemPlanned) * 100)
                      : 0;
                  const itemPercentSpent =
                    itemPlanned > 0
                      ? Math.round((itemSpent / itemPlanned) * 100)
                      : 0;
                  return (
                    <>
                      <div
                        key={item.id}
                        className='flex items-center py-4 justify-between text-sm'
                      >
                        <div>
                          <span className='font-medium text-md'>
                            {item.name}
                          </span>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>
                              ${showSpent ? itemSpent : itemRemaining}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {showSpent
                                ? itemPercentSpent
                                : itemPercentRemaining}
                              %
                            </span>
                          </div>
                        </div>
                        <Button
                          variant='outline'
                          size='icon'
                        >
                          <PlusIcon className='h-4 w-4' />
                        </Button>
                      </div>
                      <Progress
                        value={
                          showSpent ? itemPercentSpent : itemPercentRemaining
                        }
                        className='h-2'
                      />
                    </>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};
