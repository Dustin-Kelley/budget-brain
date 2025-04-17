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

export function MonthSelector({ currentMonth }: { currentMonth: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const currentYear = new Date().getFullYear()
  const thisMonth = new Date().toLocaleString('default', { month: 'long' })


  const handleMonthSelect = (month: string) => {
    const newParams = new URLSearchParams(params)
    newParams.set("month", month)
    router.push(`?${newParams.toString()}`)
  }

  return (
    <div className="flex flex-col gap-1">
      <Select defaultValue={thisMonth} onValueChange={handleMonthSelect}>
        <SelectTrigger className="w-[180px]">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <SelectValue className="text-black" placeholder="Select month" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {months.map((month) => (
            <SelectItem key={`${month}-${currentYear}`} value={`${month}-${currentYear}`}>
              {month} {currentYear}
            </SelectItem>
          ))}
          {months.map((month) => (
            <SelectItem key={`${month}-${currentYear + 1}`} value={`${month}-${currentYear + 1}`}>
              {month} {currentYear + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 