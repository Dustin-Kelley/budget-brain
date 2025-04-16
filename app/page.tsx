import {  Plus, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthlyBudgetProgress } from "./components/MonthlyBudgetProgress";
import { Suspense } from "react";
import { BudgetSummary } from "./components/BudgetSummary";

export default function Home() {

  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget Dashboard</h1>
          <p className="text-muted-foreground">Track and manage your monthly budget</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            April 2024
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <MonthlyBudgetProgress />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <BudgetSummary />
      </Suspense>

      <div>
        pie chart breakdown
      </div>
   
    </main>
  );
}
