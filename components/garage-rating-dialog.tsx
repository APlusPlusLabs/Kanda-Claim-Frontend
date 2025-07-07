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
import { Garage } from "@/lib/types/claims"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

interface GarageRatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  garage: Garage
  apiRequest: (url: string, method: string, body?: any) => Promise<any>
  tenant_id: string
  user_id: string
}

export function GarageRatingDialog({ open, onOpenChange, garage, apiRequest, tenant_id, user_id }: GarageRatingDialogProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a star rating before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const reviewData = {
        garage_id: garage.id,
        rating: rating,
        comment: feedback || null,
        tenant_id,
        user_id
      }

      const response = await apiRequest(`${API_URL}api/garage-reviews`, "POST", reviewData)

      toast({
        title: "Thank you for your feedback!",
        description: "Your rating has been submitted successfully.",
      })

      onOpenChange(false)
      setRating(0)
      setFeedback("")
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "There was an error submitting your review. Please try again.",
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
            <Building2 className="h-5 w-5 text-blue-500" />
            Rate Your Garage Experience
          </DialogTitle>
          <DialogDescription>
            Please rate your experience with {garage.name} and provide any feedback.
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