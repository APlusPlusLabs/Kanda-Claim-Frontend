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
import { useToast } from "@/components/ui/use-toast"
import { Claim, Vehicle } from "@/lib/types/claims"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

interface VehiclePickupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  vehicle: Vehicle
  apiRequest: (url: string, method: string, body?: any) => Promise<any>
  tenant_id: string,
  claim: Claim
}

export function VehiclePickupDialog({ open, onOpenChange, onConfirm, vehicle, apiRequest, tenant_id, claim }: VehiclePickupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleConfirm = async () => {
    setIsSubmitting(true)

    try {
      const endpoint = `${API_URL}claims/${vehicle.id}/pickup`
      const response = await apiRequest(endpoint, "POST")

      toast({
        title: "Vehicle Pickup Confirmed",
        description: "Your vehicle has been marked as picked up.",
      })

      onOpenChange(false)
      onConfirm()
    } catch (error) {
      console.error("Error confirming vehicle pickup:", error)
      toast({
        title: "Error",
        description: "There was an error confirming your vehicle pickup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
              <div>{vehicle.make}</div>
              <div className="text-muted-foreground">Model:</div>
              <div>{vehicle.model}</div>
              <div className="text-muted-foreground">Plate Number:</div>
              <div>{vehicle.license_plate}</div>
              <div className="text-muted-foreground">Garage:</div>
              <div className="flex flex-row">{claim.garages?.map(gr => (<strong>{gr.name}</strong>))}</div>
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