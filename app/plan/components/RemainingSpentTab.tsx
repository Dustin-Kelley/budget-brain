'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { budgetData } from '../../data';

export const RemainingSpentTab = () => {
  const [showSpent, setShowSpent] = useState(false);

  const totalIncome = budgetData.income.reduce(
    (total, income) => total + income.amount,
    0
  );
  const spent = budgetData.transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  const remaining = totalIncome - spent;
  const percentRemaining = Math.round((remaining / totalIncome) * 100);
  const percentSpent = Math.round((spent / totalIncome) * 100);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Label htmlFor="view-mode">Show Spent</Label>
        <Switch
          id="view-mode"
          checked={showSpent}
          onCheckedChange={setShowSpent}
        />
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {showSpent ? 'Spent' : 'Remaining'}
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="text-2xl font-bold">
            ${showSpent ? spent.toLocaleString() : remaining.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {showSpent ? percentSpent : percentRemaining}% of your budget{' '}
            {showSpent ? 'spent' : 'remaining'}
          </p>
          <Progress
            value={showSpent ? percentSpent : percentRemaining}
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {budgetData.categories.map((category) => {
          const remaining = category.planned_amount - category.spent_amount;
          const percentRemaining = Math.round(
            (remaining / category.planned_amount) * 100
          );
          const percentSpent = Math.round(
            (category.spent_amount / category.planned_amount) * 100
          );
          const categorySubcategories = budgetData.lineItems.filter(
            (sub) => sub.category_id === category.id
          );

          return (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {category.name}
                  </CardTitle>
                  <div
                    className={`h-3 w-3 rounded-full ${category.color}`}
                  ></div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>
                    {showSpent ? 'Spent' : 'Remaining'}: $
                    {showSpent ? category.spent_amount : remaining}
                  </span>
                  <span>{showSpent ? percentSpent : percentRemaining}%</span>
                </div>
                <Progress
                  value={showSpent ? percentSpent : percentRemaining}
                  className="h-2"
                />
                <div className="space-y-2 mt-4">
                  {categorySubcategories.map((subcategory) => {
                    const subcategoryTransactions = budgetData.transactions.filter(
                      (t) => t.subcategory_id === subcategory.id
                    );
                    const subcategorySpent = subcategoryTransactions.reduce(
                      (acc, t) => acc + t.amount,
                      0
                    );
                    const subcategoryRemaining =
                      subcategory.planned_amount - subcategorySpent;
                    const subcategoryPercentRemaining = Math.round(
                      (subcategoryRemaining / subcategory.planned_amount) * 100
                    );
                    const subcategoryPercentSpent = Math.round(
                      (subcategorySpent / subcategory.planned_amount) * 100
                    );

                    return (
                      <div
                        key={subcategory.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {subcategory.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            $
                            {showSpent
                              ? subcategorySpent
                              : subcategoryRemaining}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {showSpent
                              ? subcategoryPercentSpent
                              : subcategoryPercentRemaining}
                            %
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex w-full justify-between text-xs text-muted-foreground">
                  <span>Budget: ${category.planned_amount}</span>
                  <span>
                    {showSpent ? 'Spent' : 'Remaining'}: $
                    {showSpent ? category.spent_amount : remaining}
                  </span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
};