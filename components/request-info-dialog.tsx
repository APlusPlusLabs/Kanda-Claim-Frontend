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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/lib/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";

const requestInfoSchema = z.object({
  message: z.string().min(1, { message: "Message is required" }),
  documents: z.array(z.string()).min(1, { message: "At least one document must be selected" }),
});

interface RequestInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: any;
  onRequestSuccess: () => void; // Added callback
}

export function RequestInfoDialog({ open, onOpenChange, claim, onRequestSuccess }: RequestInfoDialogProps) {
  const { user, apiRequest } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const documentOptions = [
    { id: "photos", label: "Additional Photos of Damage" },
    { id: "police_report", label: "Police Report" },
    { id: "repair_quotes", label: "Repair Quotes" },
    { id: "driver_license", label: "Driver's License Copy" },
    { id: "witness_statements", label: "Witness Statements" },
    { id: "medical_reports", label: "Medical Reports (if applicable)" },
  ];

  const form = useForm<z.infer<typeof requestInfoSchema>>({
    resolver: zodResolver(requestInfoSchema),
    defaultValues: {
      message: "",
      documents: [],
    },
  });

  const handleSubmit = async (values: z.infer<typeof requestInfoSchema>) => {
    setIsSubmitting(true);
    try {
      await apiRequest(`${API_URL}claims/${user?.tenant_id}/request-info/${claim.id}`, "POST", {
        message: values.message,
        documents: values.documents,
        tenant_id: user?.tenant_id,
        user_id: user?.id,
        claim_id: claim.id,
      });

      onRequestSuccess(); // Trigger refresh
      onOpenChange(false);
      toast({
        title: "Information requested",
        description: `Request sent for claim #${claim.id}`,
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Additional Information</DialogTitle>
          <DialogDescription>
            Request additional information or documents for claim #{claim.id}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="documents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Documents</FormLabel>
                  <div className="grid gap-2">
                    {documentOptions.map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={doc.id}
                          checked={field.value.includes(doc.id)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, doc.id]
                              : field.value.filter((id: string) => id !== doc.id);
                            field.onChange(newValue);
                          }}
                        />
                        <Label htmlFor={doc.id} className="font-normal">
                          {doc.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    {...field}
                    placeholder="Explain what additional information you need and why"
                    rows={4}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending Request..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}