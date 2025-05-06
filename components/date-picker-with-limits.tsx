"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithLimitsProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  placeholder?: string
}

export function DatePickerWithLimits({
  date,
  setDate,
  className,
  placeholder = "Select date",
}: DatePickerWithLimitsProps) {
  // Set maximum date to December 31, 2025
  const maxDate = new Date(2025, 11, 31) // Month is 0-indexed, so 11 is December

  // Default to current date if no date is provided
  React.useEffect(() => {
    if (!date) {
      setDate(new Date())
    }
  }, [date, setDate])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          fromDate={new Date(2020, 0, 1)} // Reasonable past date
          toDate={maxDate} // Maximum allowed date
        />
      </PopoverContent>
    </Popover>
  )
}
