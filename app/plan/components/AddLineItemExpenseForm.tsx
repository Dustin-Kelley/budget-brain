'use client';
'use no memo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { addLineItemExpense } from '../mutations/addLineItemExpense';
import { toast } from 'sonner';
import { Spinner } from '@/components/app/Spinner';

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const AddLineItemExpenseForm = ({
  lineItemName,
  lineItemId,
}: {
  lineItemName: string | null;
  lineItemId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: '',  
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (values: FormValues) => {
    const { error } = await addLineItemExpense({
      amount: values.amount,
      description: values.description,
      lineItemId,
      dateOfTransaction: values.date,
      dateOfInput: undefined, //pass in undefined to get the current month and year
    });
    if (error) {
      toast.error(error.message);
    }
    setIsOpen(false);
    router.refresh();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='icon'
        >
          <PlusIcon className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
          {lineItemName && `Line Item: ${lineItemName}`}
          </DialogDescription>
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
              disabled={form.formState.isSubmitting}
              type='submit'
              className='w-full'
            >
              {form.formState.isSubmitting ? <Spinner /> : 'Save Expense'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
