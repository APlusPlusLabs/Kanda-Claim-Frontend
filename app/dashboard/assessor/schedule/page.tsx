"use client"

import { useState } from "react"
import Link from "@/Next.js/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardCheck,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns"
import { DatePickerWithLimits } from "@/components/date-picker-with-limits"

export default function AssessorSchedule() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedDate, setSelectedDate] = useState(new Date())

  // In a real app, you would fetch this data from an API
  const [scheduledAssessments, setScheduledAssessments] = useState([
    {
      id: "ASS-2025-002",
      claimId: "CL-2025-002",
      vehicle: "Suzuki Swift",
      date: new Date(2025, 3, 2, 9, 0), // April 2, 2025, 9:00 AM
      customer: "Uwase Marie",
      insurer: "Sanlam Alianz",
      location: "Kigali, Kicukiro",
      priority: "Medium",
    },
    {
      id: "ASS-2025-005",
      claimId: "CL-2025-005",
      vehicle: "Hyundai Tucson",
      date: new Date(2025, 3, 5, 14, 0), // April 5, 2025, 2:00 PM
      customer: "Mutesi Sarah",
      insurer: "Sanlam Alianz",
      location: "Kigali, Nyarugenge",
      priority: "Low",
    },
    {
      id: "ASS-2025-007",
      claimId: "CL-2025-007",
      vehicle: "Toyota Corolla",
      date: new Date(2025, 3, 4, 11, 0), // April 4, 2025, 11:00 AM
      customer: "Hakizimana Jean",
      insurer: "Radiant Insurance",
      location: "Kigali, Gasabo",
      priority: "High",
    },
  ])

  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const prevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  const getAssessmentsForDay = (day) => {
    return scheduledAssessments.filter((assessment) => isSameDay(assessment.date, day))
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Schedule</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous Week
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              Next Week <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <DatePickerWithLimits date={selectedDate} setDate={setSelectedDate} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Week of {format(currentWeek, "MMMM d, yyyy")} -{" "}
              {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day) => (
                <div key={day.toString()} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted p-2 text-center font-medium">
                    {format(day, "EEE")}
                    <div className="text-sm">{format(day, "MMM d")}</div>
                  </div>
                  <div className="p-2 space-y-2 min-h-[150px]">
                    {getAssessmentsForDay(day).length > 0 ? (
                      getAssessmentsForDay(day).map((assessment) => (
                        <div key={assessment.id} className="text-xs p-2 rounded bg-primary/10 border border-primary/20">
                          <div className="font-medium">{format(assessment.date, "h:mm a")}</div>
                          <div className="truncate">{assessment.vehicle}</div>
                          <div className="truncate text-muted-foreground">{assessment.customer}</div>
                          <Link href={`/dashboard/assessor/assessments/${assessment.id}`}>
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                              View
                            </Button>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        No assessments
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledAssessments.length > 0 ? (
                scheduledAssessments
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-start space-x-4 border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Assessment #{assessment.id}</h3>
                          <Badge
                            variant={
                              assessment.priority === "High"
                                ? "destructive"
                                : assessment.priority === "Medium"
                                  ? "default"
                                  : "outline"
                            }
                          >
                            {assessment.priority} Priority
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assessment.vehicle} • {assessment.customer}
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{format(assessment.date, "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        <div className="mt-1 flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{assessment.location}</span>
                        </div>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/assessor/assessments/${assessment.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Assessments</h3>
                  <p className="text-sm text-muted-foreground">You don't have any scheduled assessments.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
