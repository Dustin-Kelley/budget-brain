'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/app/Spinner';
import { Edit } from 'lucide-react';
import { updateLineItem } from '../mutations/updateLineItem';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

const formSchema = z.object({
  lineItemName: z.string().min(1, 'Name is required'),
  plannedAmount: z.coerce.number().positive('Amount must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

type LineItem = {
  id: string;
  name: string | null;
  planned_amount: number | null;
  category_id: string;
  month: number | null;
  year: number | null;
};

export const EditLineItemForm = ({ lineItem }: { lineItem: LineItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lineItemName: lineItem.name || '',
      plannedAmount: lineItem.planned_amount || 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const { error } = await updateLineItem({
      lineItemId: lineItem.id,
      lineItemName: values.lineItemName,
      categoryId: lineItem.category_id,
      plannedAmount: values.plannedAmount,
    });
    setIsLoading(false);
    if (error) {
      toast.error('Failed to update line item');
      return;
    }
    toast.success('Line item updated successfully');
    setIsOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='default'>
          <Edit className='h-4 w-4' /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Line Item</DialogTitle>
          <DialogDescription>
            Update the details for this line item. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
                        type='text'
                        placeholder='0.00'
                        className='pl-7'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
