// components/FeedbackModal.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { useAuth } from "@/lib/auth-provider";
import { Claim } from "@/lib/types/claims";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
const feedbackSchema = z.object({
  overall_rating: z.number().min(1).max(5),
  process_rating: z.number().min(1).max(5).optional(),
  communication_rating: z.number().min(1).max(5).optional(),
  speed_rating: z.number().min(1).max(5).optional(),
  feedback_text: z.string().optional(),
  allow_contact: z.boolean().default(true),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: Claim | null;
  onFeedbackSubmitted: () => void;
}

export function FeedbackModal({ open, onOpenChange, claim, onFeedbackSubmitted }: FeedbackModalProps) {
  const { user, apiRequest } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      overall_rating: 5,
      process_rating: 5,
      communication_rating: 5,
      speed_rating: 5,
      feedback_text: "",
      allow_contact: true,
    },
  });

  // Load existing feedback when modal opens
  useEffect(() => {
    if (open && claim?.id) {
      loadExistingFeedback();
    }
  }, [open, claim?.id]);

  const loadExistingFeedback = async () => {
    if (!claim?.id) return;

    try {
      const feedback = await apiRequest(`${API_URL}claim-feedbacks/claim/${claim.id}`, "GET");
      if (feedback && feedback.length > 0) {
        const existingFeedback = feedback[0];
        setExistingFeedback(existingFeedback);
        
        // Populate form with existing feedback
        form.setValue("overall_rating", existingFeedback.overall_rating);
        form.setValue("process_rating", existingFeedback.process_rating || 5);
        form.setValue("communication_rating", existingFeedback.communication_rating || 5);
        form.setValue("speed_rating", existingFeedback.speed_rating || 5);
        form.setValue("feedback_text", existingFeedback.feedback_text || "");
        form.setValue("allow_contact", existingFeedback.allow_contact ?? true);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    }
  };

  const onSubmit = async (data: FeedbackForm) => {
    if (!claim?.id) return;

    setIsSubmitting(true);
    try {
      const payload = {
        claim_id: claim.id,
        ...data,
        feedback_type: "post_completion",
        submitted_via: "web",
        user_id: user.id,
        tenant_id: user.tenant_id,
      };

      if (existingFeedback) {
        await apiRequest(`${API_URL}claim-feedbacks/${existingFeedback.id}`, "PUT", payload);
        toast({
          title: "Feedback Updated",
          description: "Thank you for updating your feedback!",
        });
      } else {
        // Create new feedback
        await apiRequest(`${API_URL}claim-feedbacks`, "POST", payload);
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback!",
        });
      }

      onFeedbackSubmitted();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({value}/5)</span>
      </div>
    </div>
  );

  if (!claim) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingFeedback ? "Update Your Feedback" : "Rate Your Experience"}
          </DialogTitle>
          <DialogDescription>
            Please share your experience with claim #{claim.code}. Your feedback helps us improve our service.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Overall Rating */}
            <FormField
              control={form.control}
              name="overall_rating"
              render={({ field }) => (
                <FormItem>
                  <StarRating
                    value={field.value}
                    onChange={field.onChange}
                    label="Overall Experience *"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="process_rating"
                render={({ field }) => (
                  <FormItem>
                    <StarRating
                      value={field.value || 5}
                      onChange={field.onChange}
                      label="Claim Process"
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communication_rating"
                render={({ field }) => (
                  <FormItem>
                    <StarRating
                      value={field.value || 5}
                      onChange={field.onChange}
                      label="Communication"
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="speed_rating"
                render={({ field }) => (
                  <FormItem>
                    <StarRating
                      value={field.value || 5}
                      onChange={field.onChange}
                      label="Processing Speed"
                    />
                  </FormItem>
                )}
              />
            </div>

            {/* Feedback Text */}
            <FormField
              control={form.control}
              name="feedback_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us more about your experience..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your detailed feedback helps us understand what we're doing well and where we can improve.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Allow Contact */}
            <FormField
              control={form.control}
              name="allow_contact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Allow us to contact you for follow-up (optional)
                    </FormLabel>
                    <FormDescription>
                      We may reach out if we need clarification on your feedback.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingFeedback ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    {existingFeedback ? "Update Feedback" : "Submit Feedback"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}