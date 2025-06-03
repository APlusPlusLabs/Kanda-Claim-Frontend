"use client"

import { use, useCallback, useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "@/Next.js/link"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ClipboardCheck, FileText, MessageSquare, Bell, User, LogOut } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { DatePickerWithLimits } from "@/components/date-picker-with-limits"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

interface Props {
  params: Promise<{ id: string }>;
}

export default function ScheduleAssessment({ params }: Props) {
  const router = useRouter()
  const { id } = use(params);

  const [scheduledDate, setScheduledDate] = useState<Date>(new Date())
  const [time, setTime] = useState("10:00")
  const [duration, setDuration] = useState(2)
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, apiRequest } = useAuth()
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const [assessment, setAssessment] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_URL}claim-assignments/${id}`, "GET");

      if (response) {
        const assign = response
        const claim = assign.claim
        const vehicle = claim.vehicles[0]
        const assessment = {
          ...claim,
          ...assign,
          id: assign.code,
          claimId: claim.code,
          vehicle: vehicle?.model + ' ' + vehicle?.make + ' ' + vehicle?.year,
          vehicleDetails: vehicle,
          date: claim.accident_date,
          customer: claim.user.name,
          customerDetails: claim.user,
          insurer: claim.tenant.name,
          priority: claim.priority,
          location: claim.location,
          scheduled_date: assign.scheduled_date,
          tenant_id: assign.tenant_id,
          tenant: assign.tenant,
          photos: assign.claim.documents,
        }
        setAssignment(assessment)
        setAssessment(assessment)

        // Pre-fill form if assessment is already scheduled
        if (assign.scheduled_date) {
          const scheduledDateTime = new Date(assign.scheduled_date)
          setScheduledDate(scheduledDateTime)
          setTime(format(scheduledDateTime, "HH:mm"))
        }
        if (assign.location) {
          setLocation(assign.location)
        }
        if (assign.notes) {
          setNotes(assign.notes)
        }
      }
    } catch (error: any) {
      if (Array.isArray(error.errors)) {
        error.errors.forEach((er: string) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: er,
          });
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch assignment data",
        });
      }
      console.error("Error fetching assignment:", error);
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, id, toast]);

  useEffect(() => {
    if (user) {
      fetchAssignment();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You have to sign in to use the driver panel",
      });
      router.push("/login");
    }
  }, [user, fetchAssignment, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const [hours, minutes] = time.split(':');
      const scheduleDateTime = new Date(scheduledDate);
      scheduleDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const data = {
        scheduled_date: scheduleDateTime.toISOString(),
        location: location.trim(),
        notes: notes.trim(),
        duration: duration,
        assessor_id: user.id,
        user_id: user.id,
        tenant_id: user.tenant_id,
        claim_id: assessment.claim.id
      };

      const endpoint = `${API_URL}claim-assignments/${id}/schedule`;
      const response = await apiRequest(endpoint, 'POST', data);

      if (response) {
        toast({
          title: "Assessment Scheduled",
          description: `Assessment for claim ${assessment.claimId} has been scheduled for ${format(scheduledDate, "MMM d, yyyy")} at ${time}.`,
        });
        router.push(`/dashboard/assessor/assessments/${id}`);
      }
    } catch (error: any) {
      console.error("Error scheduling assessment:", error);

      if (Array.isArray(error.errors)) {
        error.errors.forEach((er: string) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: er,
          });
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to schedule assessment. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-10 w-1/4 rounded"></div>
        <div className="animate-pulse bg-muted h-64 w-full rounded"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-muted-foreground">Failed to load Assessment data.</p>
        <Button onClick={() => router.push("/dashboard/assessor/assessments")} className="mt-4">
          Back to Assessments
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={{
        name: user.name,
        role: "Assessor",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/assessor", icon: <ClipboardCheck className="h-5 w-5" /> },
        { name: "Assessments", href: "/dashboard/assessor/assessments", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/assessor/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Schedule", href: "/dashboard/assessor/schedule", icon: <Calendar className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/assessor/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/assessor/profile", icon: <User className="h-5 w-5" /> },
        { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }
      ]}
    >
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/assessor">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/assessor/assessments">Assessments</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/assessor/assessments/${id}`}>{assessment.id}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Schedule</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold">Schedule Assessment</h1>
          <p className="text-muted-foreground">
            Schedule an assessment for claim #{assessment.claimId} - {assessment.vehicle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>Provide details for scheduling the assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <DatePickerWithLimits date={scheduledDate} setDate={setScheduledDate} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Duration <small>(how long will it take? in hours)</small></Label>
                  <Input
                    type="number"
                    id="duration" min={0} max={10}
                    placeholder="how long will it take? in hours (0-10)"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    type="text"
                    id="location"
                    placeholder="Enter the assessment location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/assessor/assessments/${id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Assessment"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}