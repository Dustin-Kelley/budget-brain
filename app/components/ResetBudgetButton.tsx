'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { resetBudget } from '../mutations/resetBudget';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const ResetBudgetButton = ({ month }: { month: string | undefined }) => {
  const router = useRouter();

  const handleResetBudget = async () => {
    const error = await resetBudget({ date: month });
    if (error) {
      toast.error('Error resetting budget');
    }
    router.refresh();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive'>Reset Budget</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            month&apos;s budget and all of its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='cursor-pointer'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className='cursor-pointer bg-destructive text-white hover:bg-destructive/90'
            onClick={() => handleResetBudget()}
          >
            Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
