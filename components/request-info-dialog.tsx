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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface RequestInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  claimId: string
  customerName: string
  onRequest: (message: string, documents: string[]) => void
}

export function RequestInfoDialog({ open, onOpenChange, claimId, customerName, onRequest }: RequestInfoDialogProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestedDocuments, setRequestedDocuments] = useState<string[]>([])

  const documentOptions = [
    { id: "photos", label: "Additional Photos of Damage" },
    { id: "police_report", label: "Police Report" },
    { id: "repair_quotes", label: "Repair Quotes" },
    { id: "driver_license", label: "Driver's License Copy" },
    { id: "witness_statements", label: "Witness Statements" },
    { id: "medical_reports", label: "Medical Reports (if applicable)" },
  ]

  const handleDocumentChange = (documentId: string, checked: boolean) => {
    if (checked) {
      setRequestedDocuments([...requestedDocuments, documentId])
    } else {
      setRequestedDocuments(requestedDocuments.filter((id) => id !== documentId))
    }
  }

  const handleSubmit = async () => {
    if (!message && requestedDocuments.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a message or select documents to request",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onRequest(message, requestedDocuments)

      toast({
        title: "Information requested",
        description: `Request sent to ${customerName} for claim #${claimId}`,
      })

      // Reset form
      setMessage("")
      setRequestedDocuments([])

      // Close dialog
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
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
          <DialogTitle>Request Additional Information</DialogTitle>
          <DialogDescription>
            Request additional information or documents from {customerName} for claim #{claimId}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Required Documents</Label>
            <div className="grid gap-2">
              {documentOptions.map((doc) => (
                <div key={doc.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={doc.id}
                    checked={requestedDocuments.includes(doc.id)}
                    onCheckedChange={(checked) => handleDocumentChange(doc.id, checked as boolean)}
                  />
                  <Label htmlFor={doc.id} className="font-normal">
                    {doc.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Explain what additional information you need and why"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Sending Request..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
