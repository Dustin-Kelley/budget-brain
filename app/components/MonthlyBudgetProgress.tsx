import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getMonthlyBudgetProgress } from "../queries/getMonthlyBudgetProgress";

export const MonthlyBudgetProgress = async () => {

  const {planned, spent, percentSpent} = await getMonthlyBudgetProgress();


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

