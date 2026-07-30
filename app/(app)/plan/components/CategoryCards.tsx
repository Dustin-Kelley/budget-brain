import { getCategories } from '@/app/queries/getCategories';
import { getTotalIncomePerMonth } from '@/app/queries/getTotalIncome';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React from 'react';
import { AddNewItemForm } from './AddNewItemForm';
import { LineItems } from './LineItems';
import { AddNewCategoryForm } from './AddNewCategoryForm';
import { EditCategories } from './EditCategories';
import { Separator } from '@/components/ui/separator';

export async function CategoryCards({ month }: { month: string | undefined }) {
  const { totalIncome } = await getTotalIncomePerMonth({ date: month });
  const { categories } = await getCategories({ date: month });

  return (
    <div className='flex  flex-col gap-4'>
      <div className='columns-1 md:columns-2 lg:columns-2 space-y-4'>
        {categories?.map((category) => {
          const categoryLineItems = category.line_items?.filter(
            (sub) => sub.category_id === category.id
          );
          return (
            <Card
              className='mb-4 break-inside-avoid flex flex-col justify-between'
              key={category.id}
            >
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='font-bold text-lg'>
                    {category.name}
                  </CardTitle>
                  <EditCategories
                    categoryId={category.id}
                    categoryName={category.name}
                  />
                </div>
              </CardHeader>
              <CardContent className='flex flex-col gap-2'>
                <Separator />
                {categoryLineItems.map((lineItems) => (
                  <LineItems
                    key={lineItems.id}
                    lineItems={lineItems}
                  />
                ))}
                <AddNewItemForm
                  categoryName={category.name}
                  categoryId={category.id}
                  month={month}
                />
              </CardContent>
              <CardFooter className='pt-0'>
                <div className='flex w-full justify-between text-xs text-muted-foreground'>
                  <span>
                    Total Category Budget: $
                    {category.line_items?.reduce(
                      (acc, item) => acc + (item?.planned_amount ?? 0),
                      0
                    )}
                  </span>
                  <span>
                    {totalIncome
                      ? Math.round(
                          (category.line_items?.reduce(
                            (acc, item) => acc + (item?.planned_amount ?? 0),
                            0
                          ) /
                            totalIncome) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <AddNewCategoryForm month={month} />
    </div>
  );
}
