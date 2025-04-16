'use client';
'use no memo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { budgetData } from '../data';
import { useState } from 'react';

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().min(1, 'Subcategory is required'),
  date: z.string().min(1, 'Date is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const AddExpenseForm = () => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      description: '',
      categoryId: '',
      subcategoryId: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedCategoryId = form.watch('categoryId');

  const onSubmit = (values: FormValues) => {
    console.log(values);
    // TODO: Add expense to the database
    setIsOpen(false);
  };

 

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Add a new expense to your budget. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>$</span>
                      <Input
                        {...field}
                        type='number'
                        inputMode='decimal'
                        placeholder='0.00'
                        className='pl-7'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {budgetData.categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='subcategoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a subcategory' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {budgetData.lineItems
                        .filter(
                          (item) => item.category_id === selectedCategoryId
                        )
                        .map((subcategory) => (
                          <SelectItem
                            key={subcategory.id}
                            value={subcategory.id}
                          >
                            {subcategory.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <Button
                type='submit'
                className='w-full'
              >
                Save Expense
              </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
