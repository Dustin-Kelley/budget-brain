import { CalendarIcon, Plus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data - replace with your actual data
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

export default function BudgetPage() {


  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plan</h1>
          <p className="text-muted-foreground">Plan your budget</p>
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

      {/* Budget Details */}  
      <Tabs defaultValue="planned">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="remaining">Remaining</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="planned" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {budgetData.categories.map((category) => {
              const percentSpent = Math.round((category.spent / category.planned) * 100)
              return (
                <Card key={category.name}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                      <div className={`h-3 w-3 rounded-full ${category.color}`}></div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Spent: ${category.spent}</span>
                      <span>{percentSpent}%</span>
                    </div>
                    <Progress value={percentSpent} className={`h-2`} />
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex w-full justify-between text-xs text-muted-foreground">
                      <span>Budget: ${category.planned}</span>
                      <span>Remaining: ${category.remaining}</span>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="remaining" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {budgetData.categories.map((category) => {
              const percentSpent = Math.round((category.spent / category.planned) * 100)
              return (
                <Card key={category.name}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                      <div className={`h-3 w-3 rounded-full ${category.color}`}></div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Spent: ${category.spent}</span>
                      <span>{percentSpent}%</span>
                    </div>
                    <Progress value={percentSpent} className={`h-2`} />
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex w-full justify-between text-xs text-muted-foreground">
                      <span>Budget: ${category.planned}</span>
                      <span>Remaining: ${category.remaining}</span>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest spending activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {budgetData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="rounded-full px-2 py-1 text-xs bg-muted">{transaction.category}</div>
                      <div className="font-medium">-${transaction.amount.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="#">View All Transactions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
