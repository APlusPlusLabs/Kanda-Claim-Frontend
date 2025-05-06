"use client"

import { useState } from "react"
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
import { useAuth } from "@/lib/auth-hooks"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { DatePickerWithLimits } from "@/components/date-picker-with-limits"

export default function ScheduleAssessment() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("10:00")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    toast({
      title: "Assessment Scheduled",
      description: `Assessment for claim ${id} has been scheduled for ${format(scheduledDate, "MMM d, yyyy")} at ${time}.`,
    })

    router.push(`/dashboard/assessor/assessments/${id}`)
  }

  // Mock assessment data
  const assessment = {
    id: id,
    claimId: "CL-2025-001",
    vehicle: "Toyota RAV4",
    date: "2025-03-15",
    status: "Pending",
    customer: "Mugisha Nkusi",
    insurer: "Sanlam Alianz",
    location: "Kigali, Nyarugenge",
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Habimana Jean",
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
      ]}
      actions={[{ name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }]}
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
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePickerWithLimits date={scheduledDate} setDate={setScheduledDate} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} required />
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
            <Button type="submit">Schedule Assessment</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
