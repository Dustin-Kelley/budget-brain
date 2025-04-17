"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

interface MonthSelectorProps {
  currentMonth: string
}

export function MonthSelector({ currentMonth }: MonthSelectorProps) {
  const router = useRouter()
  const params = useSearchParams()
  const currentYear = new Date().getFullYear()

  const handleMonthSelect = (month: string) => {
    const newParams = new URLSearchParams(params)
    newParams.set("month", month)
    router.push(`?${newParams.toString()}`)
  }

  return (
    <div className="flex flex-col gap-1">
      <Select defaultValue={currentMonth} onValueChange={handleMonthSelect}>
        <SelectTrigger className="w-[180px]">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              {month} {currentYear}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 