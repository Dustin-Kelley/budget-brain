import React from 'react'
import { MonthSelector } from './MonthSelector'
import { AddExpenseForm } from './AddExpenseForm'

export function BudgetHeader({ month }: { month: string }) {
  return (
    <div className='flex flex-col md:flex-row gap-2 justify-between'>
    <div>
      <h1 className='text-3xl font-bold text-primary tracking-tight'>
        {month}
      </h1>
      <p className='text-muted-foreground'>Budget Overview</p>
    </div>
    <div className='flex items-center gap-2'>
      <MonthSelector selectedMonth={month} />
      <AddExpenseForm />
    </div>
  </div>
  )
}
