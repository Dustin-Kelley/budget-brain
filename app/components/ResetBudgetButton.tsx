'use client';

import { Button } from "@/components/ui/button";
import { resetBudget } from "../mutations/resetBudget";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const ResetBudgetButton = ({ month }: { month: string | undefined }) => {
  const router = useRouter();

  const handleResetBudget = async () => {
    const error = await resetBudget({ date: month });
    if (error) {
      toast.error('Error resetting budget');
    }
    router.refresh();
  };

  return <Button variant='outline' onClick={handleResetBudget}>Reset Budget</Button>;
};

