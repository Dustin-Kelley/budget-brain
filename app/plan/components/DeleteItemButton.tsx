'use client';

import { Button } from '@/components/ui/button';
import { deleteLineItem } from '../mutations/deleteLineItem';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/app/Spinner';
import { Trash } from 'lucide-react';

export const DeleteItemButton = ({ lineItemId }: { lineItemId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    setIsLoading(true);
    const { error } = await deleteLineItem(lineItemId);
    if (error) {
      console.error('Failed to delete line item:', error);
      toast.error('Failed to delete line item');
    }
    setIsLoading(false);
    router.refresh();
  };

  return (
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
  );
};
