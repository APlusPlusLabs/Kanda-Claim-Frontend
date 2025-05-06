"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DatePickerWithLimits } from "@/components/date-picker-with-limits"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  dateRange?: DateRange
  onDateRangeChange?: (dateRange: DateRange) => void
}

function DateRangePickerComponent({ className, dateRange, onDateRangeChange }: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(dateRange)
  const [mounted, setMounted] = React.useState(false)
  const [from, setFrom] = React.useState<Date | undefined>(dateRange?.from)
  const [to, setTo] = React.useState<Date | undefined>(dateRange?.to)

  // Handle hydration mismatch by only rendering fully on the client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (dateRange) {
      setDate(dateRange)
      setFrom(dateRange.from)
      setTo(dateRange.to)
    }
  }, [dateRange])

  React.useEffect(() => {
    if (from && to) {
      handleDateChange({ from, to })
    } else if (from && !to) {
      handleDateChange({ from, to: undefined })
    } else if (!from && to) {
      handleDateChange({ from: undefined, to })
    } else {
      handleDateChange(undefined)
    }
  }, [from, to])

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
    if (onDateRangeChange && newDate) {
      onDateRangeChange(newDate)
    }
  }

  if (!mounted) {
    return (
      <div className={cn("grid gap-2", className)}>
        <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>Pick a date range</span>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center space-x-2">
        <DatePickerWithLimits date={from} setDate={(date) => setFrom(date)} placeholder="Start date" />
        <DatePickerWithLimits date={to} setDate={(date) => setTo(date)} placeholder="End date" />
      </div>
    </div>
  )
}

// Export both component names
export const DateRangePicker = DateRangePickerComponent
export const DatePickerWithRange = DateRangePickerComponent
