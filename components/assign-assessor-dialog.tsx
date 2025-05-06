"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data for assessors
const assessors = [
  { id: "1", name: "Habimana Jean", specialization: "Vehicle Damage", availability: "High" },
  { id: "2", name: "Uwase Marie", specialization: "Theft Claims", availability: "Medium" },
  { id: "3", name: "Mugisha Eric", specialization: "Accident Investigation", availability: "Low" },
  { id: "4", name: "Nkusi David", specialization: "Vehicle Damage", availability: "High" },
]

interface AssignAssessorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  claimId: string
  onAssign: (assessorId: string, date: Date, notes: string) => void
}

export function AssignAssessorDialog({ open, onOpenChange, claimId, onAssign }: AssignAssessorDialogProps) {
  const [selectedAssessor, setSelectedAssessor] = useState("")
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedAssessor) {
      toast({
        title: "Error",
        description: "Please select an assessor",
        variant: "destructive",
      })
      return
    }

    if (!scheduledDate) {
      toast({
        title: "Error",
        description: "Please select a scheduled date",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onAssign(selectedAssessor, scheduledDate, notes)

      toast({
        title: "Assessor assigned",
        description: `Assessor has been assigned to claim #${claimId}`,
      })

      // Reset form
      setSelectedAssessor("")
      setScheduledDate(undefined)
      setNotes("")

      // Close dialog
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign assessor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Assessor</DialogTitle>
          <DialogDescription>
            Assign an assessor to claim #{claimId}. The assessor will be notified and the assessment will be scheduled.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="assessor">Select Assessor</Label>
            <Select value={selectedAssessor} onValueChange={setSelectedAssessor}>
              <SelectTrigger id="assessor">
                <SelectValue placeholder="Select an assessor" />
              </SelectTrigger>
              <SelectContent>
                {assessors.map((assessor) => (
                  <SelectItem key={assessor.id} value={assessor.id}>
                    <div className="flex flex-col">
                      <span>{assessor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {assessor.specialization} • Availability: {assessor.availability}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Schedule Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any specific instructions or notes for the assessor"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign Assessor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
