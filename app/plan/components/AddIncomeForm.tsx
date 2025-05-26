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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addIncome } from '../mutations/addIncome';
import { Spinner } from '@/components/app/Spinner';

const formSchema = z.object({
  incomeName: z.string().min(1, 'Name is required'),
  incomeAmount: z.coerce.number().positive('Amount must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

export const AddIncomeForm = ({ month }: { month: string | undefined }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      incomeName: '',
      incomeAmount: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const { error } = await addIncome({
      incomeName: values.incomeName,
      incomeAmount: values.incomeAmount,
      date: month,
    });

    if (error) {
      console.error('Failed to add income source:', error);
      toast.error('Failed to add income source');
    }
    setIsOpen(false);
    toast.success('Income source added successfully');
    form.reset();
    router.refresh();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-start text-muted-foreground'
        >
          <Plus className='mr-2 h-4 w-4' />
          Add New Income Source
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Income Source</DialogTitle>
          <DialogDescription>
            Add a new income source to your budget. Click save when you&apos;re
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
                      placeholder='e.g., Salary, Contract Work, etc.'
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
              disabled={form.formState.isSubmitting}
              type='submit'
              className='w-full'
            >
              {form.formState.isSubmitting ? <Spinner /> : 'Save Income'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
