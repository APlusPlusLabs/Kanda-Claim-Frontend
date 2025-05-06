"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardCheck,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"

export default function AssessorDashboard() {
  const { user } = useAuth()
  const [pendingAssessments, setPendingAssessments] = useState([
    {
      id: "ASS-2023-001",
      claimId: "CL-2023-001",
      vehicle: "Toyota RAV4",
      date: "2023-12-15",
      status: "Pending",
      customer: "Mugisha Nkusi",
      insurer: "Sanlam Alianz",
      location: "Kigali, Nyarugenge",
      priority: "High",
    },
    {
      id: "ASS-2023-002",
      claimId: "CL-2023-002",
      vehicle: "Suzuki Swift",
      date: "2023-11-28",
      status: "Scheduled",
      customer: "Uwase Marie",
      insurer: "Sanlam Alianz",
      location: "Kigali, Kicukiro",
      priority: "Medium",
      scheduledDate: "2023-12-20",
    },
  ])

  const [completedAssessments, setCompletedAssessments] = useState([
    {
      id: "ASS-2023-003",
      claimId: "CL-2023-003",
      vehicle: "Honda Civic",
      date: "2023-10-05",
      status: "Completed",
      customer: "Kamanzi Eric",
      insurer: "Sanlam Alianz",
      location: "Kigali, Gasabo",
      estimatedAmount: 320000,
    },
  ])

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
          <h1 className="text-3xl font-bold">Assessor Dashboard</h1>
          <Button asChild>
            <Link href="/dashboard/assessor/assessments">View All Assessments</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Assessments</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {pendingAssessments.filter((a) => a.status === "Pending").length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Awaiting your assessment</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Assessments</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {pendingAssessments.filter((a) => a.status === "Scheduled").length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Upcoming scheduled assessments</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Assessments</CardTitle>
              <CardDescription className="text-2xl font-bold">{completedAssessments.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Total assessments completed</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Assessments</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Assessments</TabsTrigger>
            <TabsTrigger value="completed">Completed Assessments</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAssessments.filter((a) => a.status === "Pending").length > 0 ? (
              pendingAssessments
                .filter((a) => a.status === "Pending")
                .map((assessment) => (
                  <Card key={assessment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Assessment #{assessment.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Claim #{assessment.claimId} • {assessment.date}
                          </p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-2">
                          <Badge className="w-fit" variant="secondary">
                            {assessment.status}
                          </Badge>
                          <Badge
                            className="w-fit"
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Vehicle:</span> {assessment.vehicle}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Customer:</span> {assessment.customer}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Insurer:</span> {assessment.insurer}
                        </div>
                      </div>

                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Location:</span> {assessment.location}
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/assessor/assessments/${assessment.id}/schedule`}>
                            Schedule Assessment
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/assessor/assessments/${assessment.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Assessments</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any pending assessments at the moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {pendingAssessments.filter((a) => a.status === "Scheduled").length > 0 ? (
              pendingAssessments
                .filter((a) => a.status === "Scheduled")
                .map((assessment) => (
                  <Card key={assessment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Assessment #{assessment.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Claim #{assessment.claimId} • {assessment.date}
                          </p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-2">
                          <Badge className="w-fit" variant="default">
                            <Calendar className="h-3 w-3 mr-1" /> {assessment.status}
                          </Badge>
                          <Badge
                            className="w-fit"
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Vehicle:</span> {assessment.vehicle}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Customer:</span> {assessment.customer}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Scheduled Date:</span> {assessment.scheduledDate}
                        </div>
                      </div>

                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Location:</span> {assessment.location}
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/assessor/assessments/${assessment.id}/submit`}>
                            Complete Assessment
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/assessor/assessments/${assessment.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Scheduled Assessments</h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any scheduled assessments at the moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedAssessments.length > 0 ? (
              completedAssessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Assessment #{assessment.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Claim #{assessment.claimId} • {assessment.date}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0 w-fit" variant="outline">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {assessment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Vehicle:</span> {assessment.vehicle}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {assessment.customer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimated Amount:</span>{" "}
                        {assessment.estimatedAmount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Location:</span> {assessment.location}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/assessor/assessments/${assessment.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Completed Assessments</h3>
                    <p className="text-sm text-muted-foreground">You don't have any completed assessments yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
