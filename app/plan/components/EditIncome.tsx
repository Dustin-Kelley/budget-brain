'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash, MoreHorizontal } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/app/Spinner';
import { deleteIncome } from '../mutations/deleteIncome';
import { EditIncomeForm } from './EditIncomeForm';

export const EditIncome = ({
  incomeId,
  incomeName,
  incomeAmount,
}: {
  incomeId: string;
  incomeName: string | null;
  incomeAmount: number | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const { error } = await deleteIncome({ incomeId });
      if (error) {
        toast.error('Failed to delete income');
        return;
      }
      toast.success('Income deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete income:', error);
      toast.error('Failed to delete income');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='icon'
        >
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-40 p-2 flex flex-col gap-2'
        align='end'
      >
        <Button
          variant='destructive'
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <div className='flex items-center gap-2'>
              <Trash className='h-4 w-4' />
              Delete
            </div>
          )}
        </Button>
        <EditIncomeForm
          incomeId={incomeId}
          incomeName={incomeName}
          incomeAmount={incomeAmount}
        />
      </PopoverContent>
    </Popover>
  );
};
