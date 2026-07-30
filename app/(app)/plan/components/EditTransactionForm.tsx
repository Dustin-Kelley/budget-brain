'use client';

import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormItem,
  FormMessage,
  FormField,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CategoryWithLineItems } from '@/types/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDateForInput } from '@/lib/utils';
import { updateTransaction } from '../mutations/updateTransaction';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().optional(),
  lineItemId: z.string().min(1, 'Budget item is required'),
  date: z.string().min(1, 'Date is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const EditTransactionForm = ({
  children,
  categories,
  transactionAmount,
  transactionId,
  transactionDate,
  transactionDescription,
  lineItemId,
}: {
  categories: CategoryWithLineItems[] | null;
  children: React.ReactNode;
  transactionAmount: number | null;
  transactionId: string;
  transactionDate: string | null;
  transactionDescription: string | null;
  lineItemId: string | null;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: transactionAmount ?? 0,
      description: transactionDescription ?? '',
      transactionId: transactionId,
      date: formatDateForInput(transactionDate),
      lineItemId: lineItemId ?? '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    console.log(values);
    const { error } = await updateTransaction({
      amount: values.amount,
      description: values.description,
      lineItemId: values.lineItemId,
      dateOfTransaction: values.date,
      dateOfInput: undefined,
      transactionId: values.transactionId,
    });
    if (error) {
      toast.error('Something went wrong updating your transaction');
    }
     setIsOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                        $
                      </span>
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
              name='lineItemId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Item</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a budget item' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <div key={category.id}>
                          <div className='px-3 py-1 text-xs font-semibold text-muted-foreground'>
                            {category.name}
                          </div>
                          {category.line_items.map((item) => (
                            <SelectItem
                              key={item.id}
                              value={item.id}
                            >
                              {item.name}
                            </SelectItem>
                          ))}
                        </div>
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
