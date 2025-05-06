"use client"

import React from "react"

import { useState } from "react"
import Link from "@/Next.js/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ClipboardCheck,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"

export default function AssessorAssessments() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [assessments, setAssessments] = useState([
    {
      id: "ASS-2025-001",
      claimId: "CL-2025-001",
      vehicle: "Toyota RAV4",
      date: "2025-03-15",
      status: "Pending",
      customer: "Mugisha Nkusi",
      insurer: "Sanlam Alianz",
      location: "Kigali, Nyarugenge",
      priority: "High",
    },
    {
      id: "ASS-2025-002",
      claimId: "CL-2025-002",
      vehicle: "Suzuki Swift",
      date: "2025-02-28",
      status: "Scheduled",
      customer: "Uwase Marie",
      insurer: "Sanlam Alianz",
      location: "Kigali, Kicukiro",
      priority: "Medium",
      scheduledDate: "2025-04-02",
    },
    {
      id: "ASS-2025-003",
      claimId: "CL-2025-003",
      vehicle: "Honda Civic",
      date: "2025-01-05",
      status: "Completed",
      customer: "Kamanzi Eric",
      insurer: "Sanlam Alianz",
      location: "Kigali, Gasabo",
      estimatedAmount: 320000,
    },
    {
      id: "ASS-2025-004",
      claimId: "CL-2025-004",
      vehicle: "Nissan X-Trail",
      date: "2025-03-10",
      status: "Pending",
      customer: "Ishimwe David",
      insurer: "Radiant Insurance",
      location: "Kigali, Gasabo",
      priority: "Medium",
    },
    {
      id: "ASS-2025-005",
      claimId: "CL-2025-005",
      vehicle: "Hyundai Tucson",
      date: "2025-03-25",
      status: "Scheduled",
      customer: "Mutesi Sarah",
      insurer: "Sanlam Alianz",
      location: "Kigali, Nyarugenge",
      priority: "Low",
      scheduledDate: "2025-04-05",
    },
    {
      id: "ASS-2024-006",
      claimId: "CL-2024-006",
      vehicle: "Kia Sportage",
      date: "2024-11-15",
      status: "Completed",
      customer: "Niyonzima Jean",
      insurer: "Radiant Insurance",
      location: "Kigali, Kicukiro",
      estimatedAmount: 450000,
    },
  ])

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.customer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || assessment.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

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
          <h1 className="text-3xl font-bold">All Assessments</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assessments..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredAssessments.length > 0 ? (
              filteredAssessments.map((assessment) => <AssessmentCard key={assessment.id} assessment={assessment} />)
            ) : (
              <EmptyState
                icon={<Clock />}
                title="No Assessments Found"
                description="No assessments match your filters."
              />
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredAssessments.filter((a) => a.status === "Pending").length > 0 ? (
              filteredAssessments
                .filter((a) => a.status === "Pending")
                .map((assessment) => <AssessmentCard key={assessment.id} assessment={assessment} />)
            ) : (
              <EmptyState
                icon={<Clock />}
                title="No Pending Assessments"
                description="You don't have any pending assessments that match your filters."
              />
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {filteredAssessments.filter((a) => a.status === "Scheduled").length > 0 ? (
              filteredAssessments
                .filter((a) => a.status === "Scheduled")
                .map((assessment) => <AssessmentCard key={assessment.id} assessment={assessment} />)
            ) : (
              <EmptyState
                icon={<Calendar />}
                title="No Scheduled Assessments"
                description="You don't have any scheduled assessments that match your filters."
              />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredAssessments.filter((a) => a.status === "Completed").length > 0 ? (
              filteredAssessments
                .filter((a) => a.status === "Completed")
                .map((assessment) => <AssessmentCard key={assessment.id} assessment={assessment} />)
            ) : (
              <EmptyState
                icon={<CheckCircle2 />}
                title="No Completed Assessments"
                description="You don't have any completed assessments that match your filters."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function AssessmentCard({ assessment }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Assessment #{assessment.id}</h3>
            <p className="text-sm text-muted-foreground">
              Claim #{assessment.claimId} • {assessment.date}
            </p>
          </div>
          <div className="flex items-center mt-2 md:mt-0 space-x-2">
            <Badge
              className="w-fit"
              variant={
                assessment.status === "Pending"
                  ? "secondary"
                  : assessment.status === "Scheduled"
                    ? "default"
                    : "outline"
              }
            >
              {assessment.status === "Scheduled" && <Calendar className="h-3 w-3 mr-1" />}
              {assessment.status === "Completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {assessment.status}
            </Badge>
            {assessment.priority && (
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
            )}
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
            {assessment.status === "Completed" ? (
              <>
                <span className="text-muted-foreground">Estimated Amount:</span>{" "}
                {assessment.estimatedAmount.toLocaleString()} RWF
              </>
            ) : assessment.status === "Scheduled" ? (
              <>
                <span className="text-muted-foreground">Scheduled Date:</span> {assessment.scheduledDate}
              </>
            ) : (
              <>
                <span className="text-muted-foreground">Insurer:</span> {assessment.insurer}
              </>
            )}
          </div>
        </div>

        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">Location:</span> {assessment.location}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          {assessment.status === "Pending" && (
            <Button size="sm" asChild>
              <Link href={`/dashboard/assessor/assessments/${assessment.id}/schedule`}>Schedule Assessment</Link>
            </Button>
          )}
          {assessment.status === "Scheduled" && (
            <Button size="sm" asChild>
              <Link href={`/dashboard/assessor/assessments/${assessment.id}/submit`}>Complete Assessment</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/assessor/assessments/${assessment.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon, title, description }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          {React.cloneElement(icon, { className: "h-12 w-12 text-muted-foreground mb-4" })}
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
