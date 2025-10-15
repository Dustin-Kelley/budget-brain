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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
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
import { useState } from 'react';
import { addTransaction } from '../mutations/addTransaction';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CategoryWithLineItems } from '@/types/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Spinner } from '@/components/app/Spinner';

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().optional(),
  lineItemId: z.string().min(1, 'Budget item is required'),
  date: z.string().min(1, 'Date is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const AddExpenseForm = ({
  categories,
}: {
  categories: CategoryWithLineItems[] | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: '',
      lineItemId: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (values: FormValues) => {
    const { error } = await addTransaction({
      amount: values.amount,
      description: values.description,
      lineItemId: values.lineItemId,
      dateOfTransaction: values.date,
      dateOfInput: undefined,
    });
    if (error) {
      toast.error(error.message);
    }
    setIsOpen(false);
    router.refresh();
  };

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className='py-4'>
          <DrawerHeader>
            <DrawerTitle>Add New Expense</DrawerTitle>
            <DrawerDescription>
              Add a new expense to your budget. Click save when you&apos;re
              done.
            </DrawerDescription>
          </DrawerHeader>
          <div className='px-4 pb-4'>
            <ExpenseFormContent
              form={form}
              onSubmit={onSubmit}
              categories={categories}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Add a new expense to your budget. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <ExpenseFormContent
          form={form}
          onSubmit={onSubmit}
          categories={categories}
        />
      </DialogContent>
    </Dialog>
  );
};

// Form content component to avoid duplication
function ExpenseFormContent({
  form,
  onSubmit,
  categories,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  onSubmit: (values: FormValues) => Promise<void>;
  categories: CategoryWithLineItems[] | null;
}) {
  return (
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
          className='w-full mt-4'
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <span className='flex items-center gap-2'>
              <Spinner /> Saving...
            </span>
          ) : (
            'Save Expense'
          )}
        </Button>
      </form>
    </Form>
  );
}

const triggerButton = (
  <Button
    className='fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl hover:bg-primary/90 transition-colors'
    aria-label='Add'
  >
    <PlusIcon className='size-6' />
  </Button>
);
