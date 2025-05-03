'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash, MoreHorizontal } from 'lucide-react';
import { deleteCategory } from '../mutations/deleteCategory';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/app/Spinner';
import { EditCategoriesForm } from './EditCategoriesForm';

export const EditCategories = ({ categoryId, categoryName }: { categoryId: string, categoryName: string | null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const { error } = await deleteCategory({ categoryId });
      if (error) {
        toast.error('Failed to delete category');
        return;
      }
      toast.success('Category deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2 flex flex-col gap-2" align="end">
        <Button
          variant='destructive'
          onClick={handleDelete}
          disabled={isLoading}
       
        >
          {isLoading ? <Spinner /> : (
            <div className='flex items-center gap-2'>
              <Trash className='h-4 w-4' />
              Delete
            </div>
          )}
        </Button>
        <EditCategoriesForm categoryId={categoryId} categoryName={categoryName} />
      </PopoverContent>
    </Popover>
  );
};
