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
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/star-rating"
import { Building2, ThumbsUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface GarageRatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  garageDetails: {
    name: string
    address: string
  }
}

export function GarageRatingDialog({ open, onOpenChange, garageDetails }: GarageRatingDialogProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a star rating before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Thank you for your feedback!",
        description: "Your rating has been submitted successfully.",
      })
      onOpenChange(false)
      // Reset form
      setRating(0)
      setFeedback("")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            Rate Your Garage Experience
          </DialogTitle>
          <DialogDescription>
            Please rate your experience with {garageDetails.name} and provide any feedback.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Garage Rating</h4>
            <div className="flex justify-center py-2">
              <StarRating rating={rating} setRating={setRating} size="lg" />
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Additional Feedback (Optional)</h4>
            <Textarea
              placeholder="Share your experience with the garage..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <ThumbsUp className="mr-2 h-4 w-4" />
                Submit Rating
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
