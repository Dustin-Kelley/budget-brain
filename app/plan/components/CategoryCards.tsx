import { getCategories } from '@/app/queries/getCategories';
import { getTotalIncome } from '@/app/queries/getTotalIncome';
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

export async function CategoryCards({ month }: { month: string | undefined }) {
  const { data } = await getTotalIncome();
  const { data: categories } = await getCategories();
  const totalIncome =
    data?.reduce((total, income) => total + (income?.amount || 0), 0) || 0;

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
      {categories?.map((category) => {
        const categoryLineItems = category.line_items?.filter(
          (sub) => sub.category_id === category.id
        );
        return (
          <Card
            className='flex flex-col justify-between'
            key={category.id}
          >
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-medium'>
                  {category.name}
                </CardTitle>
                <EditCategories categoryId={category.id} />
              </div>
            </CardHeader>
            <CardContent>
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
                    (acc, item) => acc + (item?.planned_amount || 0),
                    0
                  )}
                </span>
                <span>
                  {Math.round(
                    (category.line_items?.reduce(
                      (acc, item) => acc + (item?.planned_amount || 0),
                      0
                    ) /
                      totalIncome) *
                      100
                  )}
                  %
                </span>
              </div>
            </CardFooter>
          </Card>
        );
      })}
      <AddNewCategoryForm month={month} />
    </div>
  );
}
