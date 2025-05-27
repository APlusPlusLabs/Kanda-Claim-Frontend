"use client"

import { useEffect, useState } from "react"
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
import { useAuth } from "@/lib/auth-provider"
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns"
import { DatePickerWithLimits } from "@/components/date-picker-with-limits"
import { toast } from "@/components/ui/use-toast"
import router from "next/router"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
export default function AssessorSchedule() {
  const { user, apiRequest } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [schedules, setSchedules] = useState<any[]>([])
  const fetchAndProcessSchedules = async () => {
    try {
      const response = await apiRequest(`${API_URL}schedules-by-user/${user?.id}`, "GET");
      const schedulesData = response?.data || response || [];

      const processedSchedules = schedulesData.map((sched: any) => {
        const claim = sched.assessment.claim;
        const vehicle = sched.assessment.vehicle;

        return {
          ...claim,
          ...sched,
          id: sched.id,
          code: sched.assessment.code,
          claimId: claim?.code || 'N/A',
          vehicle: vehicle ? `${vehicle.model} ${vehicle.make} ${vehicle.year}` : 'No vehicle info',
          customer: claim?.user?.name || 'Unknown',
          insurer: claim?.tenant?.name || 'Unknown',
          scheduled_date: sched.scheduled_date,
          status: sched.status,
          date: sched.scheduled_at, 
          location: sched.location,
          priority: claim.priority,
        };
      });

      console.log('Processed Schedules:', processedSchedules);
      setSchedules(processedSchedules);

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
          description: "Failed to fetch schedules data",
        });
      }
      console.error("Error fetching schedules:", error);
      setSchedules([]);
      setSchedules([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAndProcessSchedules();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You have to sign in to use this panel",
      });
      router.push("/login");
    }
  }, [user, router, toast]);
  // In a real app, you would fetch this data from an API


  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const prevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  const getSchedulesForDay = (day: string | number | Date) => {
    return schedules.filter((assessment) => isSameDay(assessment.date, day))
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
                    {getSchedulesForDay(day).length > 0 ? (
                      getSchedulesForDay(day).map((assessment) => (
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
            <CardTitle>Upcoming Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedules.length > 0 ? (
                schedules
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
                          <h3 className="font-medium">Schedule #{assessment.code}</h3>
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
                            <Link href={`/dashboard/assessor/assessments`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Schedules</h3>
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
