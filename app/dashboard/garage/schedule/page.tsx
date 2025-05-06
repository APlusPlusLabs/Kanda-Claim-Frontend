"use client"

import { useState } from "react"
import { DatePickerWithLimits } from "@/components/date-picker-with-limits"

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Garage Schedule</h1>

      <div className="mb-4">
        <DatePickerWithLimits date={selectedDate} setDate={setSelectedDate} />
      </div>

      <div>
        <p>Selected Date: {selectedDate?.toLocaleDateString()}</p>
        {/* Add schedule display logic here based on the selected date */}
      </div>
    </div>
  )
}
