"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/lib/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";

const assignFormDataSchema = z.object({
  department_id: z.string().min(1, { message: "Department is required" }),
  assessor_id: z.string().min(1, { message: "Assessor is required" }),
  notes: z.string().optional(),
});

interface AssignAssessorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: any;
  onAssignSuccess: () => void; // Added callback
}

export function AssignAssessorDialog({ open, onOpenChange, claim, onAssignSuccess }: AssignAssessorDialogProps) {
  const { user, apiRequest } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [assessors, setAssessors] = useState([]);

  const assignForm = useForm<z.infer<typeof assignFormDataSchema>>({
    resolver: zodResolver(assignFormDataSchema),
    defaultValues: {
      department_id: "",
      assessor_id: "",
      notes: "",
    },
  });

  // Fetch departments and assessors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const depts = await apiRequest(`${API_URL}departments-by-tenant/${user.tenant_id}`, "GET");
        setDepartments(depts);
        const users = await apiRequest(`${API_URL}users/${user.tenant_id}/assessors`, "GET");
        setAssessors(users);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch departments or assessors.",
        });
      }
    };
    if (open && user?.tenant_id) {
      fetchData();
    }
  }, [open, user?.tenant_id]);

  const onSubmitAssignClaim = async (values: z.infer<typeof assignFormDataSchema>) => {
    if (!claim) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`${API_URL}claims/assign/${claim.id}`, "POST", {
        department_id: values.department_id,
        assessor_id: values.assessor_id,
        tenant_id: user?.tenant_id,
        user_id: user?.id,
        claim_id: claim.id,
        notes: values.notes,
      });

      onAssignSuccess(); // Trigger refresh
      onOpenChange(false);
      toast({
        title: "Assigned successfully",
        description: `Assessor assigned to claim #${claim.id}.`,
      });
      assignForm.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to assign assessor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Assessor</DialogTitle>
          <DialogDescription>
            Assign an assessor to claim #{claim.id}. The assessor will be notified.
          </DialogDescription>
        </DialogHeader>
        <Form {...assignForm}>
          <form onSubmit={assignForm.handleSubmit(onSubmitAssignClaim)} className="space-y-4 py-4">
            <FormField
              control={assignForm.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={assignForm.control}
              name="assessor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessor" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessors.map((assessor: any) => (
                        <SelectItem key={assessor.id} value={assessor.id}>
                          {assessor.first_name} {assessor.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={assignForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <Textarea {...field} rows={2} placeholder="Optional notes..." />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}