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
import { Car, CheckCircle2 } from "lucide-react"

interface VehiclePickupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  vehicleDetails: {
    make: string
    model: string
    plateNumber: string
    garage: string
  }
}

export function VehiclePickupDialog({ open, onOpenChange, onConfirm, vehicleDetails }: VehiclePickupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      onConfirm()
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-500" />
            Confirm Vehicle Pickup
          </DialogTitle>
          <DialogDescription>
            Please confirm that you have received your vehicle and that the repairs are satisfactory.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Vehicle Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Make:</div>
              <div>{vehicleDetails.make}</div>
              <div className="text-muted-foreground">Model:</div>
              <div>{vehicleDetails.model}</div>
              <div className="text-muted-foreground">Plate Number:</div>
              <div>{vehicleDetails.plateNumber}</div>
              <div className="text-muted-foreground">Garage:</div>
              <div>{vehicleDetails.garage}</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              "Processing..."
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Pickup
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
