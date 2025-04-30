import { getCategories } from '@/app/queries/getCategories';
import { getTotalIncome } from '@/app/queries/getTotalIncome';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React from 'react';
import { AddNewItem } from './AddNewItem';
import { LineItems } from './LineItems';

export async function CategoryCards({ month }: { month: string | undefined }) {
  const { data } = await getTotalIncome();
  const { data: categories } = await getCategories();
  const totalIncome =
    data?.reduce((total, income) => total + (income?.amount || 0), 0) || 0;
  console.log(month);

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
      {categories?.map((category) => {
        const categoryLineItems = category.line_items?.filter(
          (sub) => sub.category_id === category.id
        );
        return (
          <Card key={category.id}>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-medium'>
                  {category.name}
                </CardTitle>
                <div className={`h-3 w-3 rounded-full bg-blue-400`} />
              </div>
            </CardHeader>
            <CardContent className='pb-2'>
              <div className='space-y-2'>
                {categoryLineItems.map((lineItems) => (
                  <LineItems key={lineItems.id} lineItems={lineItems} />
                ))}
                <AddNewItem
                  categoryName={category.name}
                  categoryId={category.id}
                  month={month}
                />
              </div>
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
  );
}
