import { getCategories } from '@/app/queries/getCategories';
import { getTotalIncome } from '@/app/queries/getTotalIncome';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React from 'react';

export async function CategoryCards({ month }: { month: string | undefined }) {
  const { data } = await getTotalIncome();
  const { data: categories } = await getCategories(); 
  const totalIncome = data?.reduce(
    (total, income) => total + (income?.amount || 0),
    0
  ) || 0;
console.log(month)
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
      {categories?.map((category) => {
        const categorySubcategories = category.line_items?.filter(
          (sub) => sub.category_id === category.id
        );
        return (
          <Card key={category.id}>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-medium'>
                  {category.name}
                </CardTitle>
                <div className={`h-3 w-3 rounded-full bg-blue-400`}></div>
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
                <span>Total Budget: ${category.line_items?.reduce((acc, item) => acc + (item?.planned_amount || 0), 0)}</span>
                <span>
                  {Math.round((category.line_items?.reduce((acc, item) => acc + (item?.planned_amount || 0), 0) / totalIncome) * 100)}%
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
