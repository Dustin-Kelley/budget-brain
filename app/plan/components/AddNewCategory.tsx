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
import { addCategory } from '../mutations/addCategory';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  categoryName: z.string().min(1, 'Name is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const AddNewCategory = ({ 
  month,
}: { 
  month: string | undefined;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await addCategory({
        categoryName: values.categoryName,
        date: month,
      });

      if (error) {
        console.error('Failed to add category:', error);
        toast.error('Failed to add category');
        return;
      }

      setIsOpen(false);
      toast.success('Category added successfully');
      form.reset();
      router.refresh();
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className='border-dashed opacity-50 cursor-pointer hover:opacity-100 transition-opacity'>
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
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Add a new category to your budget. Click save when you&apos;re done.
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
                    <Input {...field} placeholder='e.g., Housing, Transportation, etc.' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full'
            >
              Save Category
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
