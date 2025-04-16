import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { budgetData } from "../data";

export const MonthlyBudgetProgress = () => {
//TODO: get the month and year from the url
//TODO: Query data from the database
  const planned = budgetData.income.reduce((acc, income) => acc + income.amount, 0)
  const spent = budgetData.transactions.reduce((acc, transaction) => acc + transaction.amount, 0)

  const percentSpent = Math.round((spent / planned) * 100)
  return (
          <Card>
        <CardHeader>
          <CardTitle>Overall Budget Progress</CardTitle>
          <CardDescription>Your spending progress for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>Spent: ${spent.toLocaleString()}</div>
              <div>{percentSpent}%</div>
            </div>
            <Progress value={percentSpent} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>$0</div>
              <div>${planned.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

