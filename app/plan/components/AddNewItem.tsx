'use client';

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
import { useState } from 'react';
import { addLineItem } from '../mutations/addLineItem';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  lineItemName: z.string().min(1, 'Name is required'),
  plannedAmount: z.coerce.number().positive('Amount must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

export const AddNewItem = ({ 
  categoryId,
  month,
  categoryName,
}: { 
  categoryId: string;
  month: string | undefined;
  categoryName: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lineItemName: '',
      plannedAmount: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await addLineItem({
        lineItemName: values.lineItemName,
        categoryId,
        plannedAmount: values.plannedAmount,
        date: month,
      });
      setIsOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error('Failed to add line item:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-start text-muted-foreground'
        >
          <Plus className='mr-2 h-4 w-4' />
          Add New Item
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Budget Item</DialogTitle>
          <DialogDescription>
            Add a new item to your {categoryName ? categoryName : 'budget'} category. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='lineItemName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g., Rent, Groceries, etc.' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='plannedAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planned Amount</FormLabel>
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
            <Button
              type='submit'
              className='w-full'
            >
              Save Item
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 