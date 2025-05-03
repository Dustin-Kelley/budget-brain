'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/app/Spinner';
import { Edit } from 'lucide-react';
import { updateCategory } from '@/app/plan/mutations/updateCategory';
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
  categoryName: z.string().min(1, 'Name is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const EditCategoriesForm = ({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: categoryName || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const { error } = await updateCategory({
      categoryId: categoryId,
      categoryName: values.categoryName,
    });
    setIsLoading(false);
    if (error) {
      toast.error('Failed to update category');
      return;
    }
    toast.success('Category updated successfully');
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
              name='categoryName'
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
