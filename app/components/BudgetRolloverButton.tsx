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

// TODO: Add 'month' prop when integrating with backend logic
export function BudgetRolloverButton({ month }: { month: string | undefined }) {
  const [open, setOpen] = useState(false);
  // Placeholder: Assume current month always has a budget for now
  const currentMonthHasBudget = true;
  console.log(month);

  const handleRollover = () => {
    // TODO: Call server function to perform rollover
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="default">Roll Over Previous Month</Button>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollover}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
} 