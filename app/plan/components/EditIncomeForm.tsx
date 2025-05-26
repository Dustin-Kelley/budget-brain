'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/app/Spinner';
import { Edit } from 'lucide-react';
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
import { updateIncome } from '@/app/plan/mutations/updateIncome';
const formSchema = z.object({
  incomeName: z.string().min(1, 'Name is required'),
  incomeAmount: z.coerce.number().positive('Amount must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

export const EditIncomeForm = ({
  incomeId,
  incomeName,
  incomeAmount,
}: {
  incomeId: string;
  incomeName: string | null;
  incomeAmount: number | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      incomeName: incomeName || '',
      incomeAmount: incomeAmount || 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const { error } = await updateIncome({
      incomeId: incomeId,
      incomeName: values.incomeName,
      incomeAmount: values.incomeAmount,
    });
    setIsLoading(false);
    if (error) {
      toast.error('Failed to update income');
      return;
    }
    toast.success('Income updated successfully');
    setIsOpen(false);
    router.refresh();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>
        <Button variant='default'>
          <Edit className='h-4 w-4' /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the details for this category. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='incomeName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='e.g., Rent, Groceries, etc.'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='incomeAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Amount</FormLabel>
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
                        value={
                          field.value === undefined || field.value === null
                            ? ''
                            : field.value
                        }
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
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
