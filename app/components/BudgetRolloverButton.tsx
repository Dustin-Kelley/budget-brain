"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { rolloverBudget } from "@/app/mutations/rolloverBudget";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPreviousMonth } from "@/lib/utils";



export function BudgetRolloverButton({ month }: { month: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Placeholder: Assume current month always has a budget for now
  const currentMonthHasBudget = true;

  const handleRollover = async () => {
    setLoading(true);
    const fromDate = getPreviousMonth(month);
    console.log("🚀 ~ handleRollover ~ fromDate:", fromDate)
    const toDate = month;
    console.log("🚀 ~ handleRollover ~ toDate:", toDate)
    if (!fromDate || !toDate) {
      toast.error("Invalid month for rollover.");
      setLoading(false);
      return;
    }
    const result = await rolloverBudget({ fromDate, toDate });
    setLoading(false);
    setOpen(false);
    if (result?.success) {
      router.refresh();
    } else {
      toast.error(result?.error?.message || "Failed to roll over budget.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="default" disabled={loading}>Roll Over Previous Month</Button>
      </AlertDialogTrigger>
      {currentMonthHasBudget && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite Current Budget?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite your current month&apos;s budget with the previous month&apos;s categories, line items, and planned amounts. This action cannot be undone. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollover} disabled={loading}>
              {loading ? "Rolling Over..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}

