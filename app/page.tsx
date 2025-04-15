import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {  Plus, CalendarIcon, Wallet, CreditCard, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const budgetData = {
  summary: {
    planned: 3000,
    spent: 1850,
    remaining: 1150,
  },
  categories: [
    { name: "Housing", planned: 1200, spent: 1200, remaining: 0, color: "bg-blue-500" },
    { name: "Food", planned: 500, spent: 320, remaining: 180, color: "bg-green-500" },
    { name: "Transportation", planned: 300, spent: 150, remaining: 150, color: "bg-yellow-500" },
    { name: "Entertainment", planned: 200, spent: 180, remaining: 20, color: "bg-purple-500" },
    { name: "Utilities", planned: 400, spent: 0, remaining: 400, color: "bg-red-500" },
    { name: "Savings", planned: 400, spent: 0, remaining: 400, color: "bg-teal-500" },
  ],
  recentTransactions: [
    { id: 1, date: "2024-04-12", description: "Grocery Store", category: "Food", amount: 85.42 },
    { id: 2, date: "2024-04-10", description: "Monthly Rent", category: "Housing", amount: 1200 },
    { id: 3, date: "2024-04-08", description: "Gas Station", category: "Transportation", amount: 45.3 },
    { id: 4, date: "2024-04-05", description: "Movie Tickets", category: "Entertainment", amount: 32.5 },
    { id: 5, date: "2024-04-03", description: "Restaurant", category: "Food", amount: 68.25 },
  ],
}
export default function Home() {
  const { planned, spent, remaining } = budgetData.summary
  const percentSpent = Math.round((spent / planned) * 100)
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

          {/* Overall Budget Progress */}
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

       {/* Budget Summary Cards */}
       <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${planned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total budget for this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${spent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{percentSpent}% of your budget used</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${remaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{100 - percentSpent}% of your budget left</p>
          </CardContent>
        </Card>
      </div>

      <div>
        pie chart breakdown
      </div>
   
    </main>
  );
}
