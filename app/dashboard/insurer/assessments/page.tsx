"use client"

import React, { useCallback, useEffect } from "react"

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
import { useAuth } from "@/lib/auth-provider"
import router from "next/router"
import { toast } from "sonner"
import { Assessment } from "@/lib/types/claims"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";
export default function AssessmentsPage() {
  const { toast } = useToast()
  const { user, apiRequest } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([])

  const fetchAndProcessAssessments = async () => {
    try {
      const response = await apiRequest(`${API_URL}assessments-by-tenant/${user.tenant_id}`, "GET");
      const assessmentsData = response?.data || response || [];


      const processedAssessments = assessmentsData.map((assme: any) => {
        const claim = assme.claim;
        const vehicle = claim?.vehicles?.[0];

        return {
          ...claim,
          ...assme,
          id: assme.id,
          code: assme.code,
          claimId: claim?.code || 'N/A',
          vehicle: vehicle ? `${vehicle.model} ${vehicle.make} ${vehicle.year}` : 'No vehicle info',
          date: claim?.accident_date,
          customer: claim?.user?.name || 'Unknown',
          insurer: claim?.tenant?.name || 'Unknown',
          location: claim?.location,
          scheduled_date: assme.scheduled_date,
          status: assme.status,
        };
      });

      console.log('Processed Assessments:', processedAssessments);
      setAssessments(processedAssessments);

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
          description: "Failed to fetch assessments data",
        });
      }
      console.error("Error fetching assessments:", error);
      setAssessments([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAndProcessAssessments();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You have to sign in to use this panel",
      });
      router.push("/login");
    }
  }, [user, router, toast]);
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
        name: user.name,
        role: "Insurer",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <ClipboardCheck className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Assessments", href: "/dashboard/insurer/assessments", icon: <FileText className="h-5 w-5" /> },
        { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }
      ]}
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
            {assessments.length > 0 ? (
              assessments.map((assessment) => <AssessmentCard key={assessment.id} assessment={assessment} />)
            ) : (
              <EmptyState
                icon={<Clock />}
                title="No Assessments Found"
                description="No assessments match your filters."
              />
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredAssessments.filter((a) => a.status === "pending").length > 0 ? (
              filteredAssessments
                .filter((a) => a.status === "pending")
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
            {filteredAssessments.filter((a) => a.status === "scheduled").length > 0 ? (
              filteredAssessments
                .filter((a) => a.status === "scheduled")
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
            {filteredAssessments.filter((a) => a.status === "completed").length > 0 ? (
              filteredAssessments
                .filter((a) => a.status === "completed")
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
            <h3 className="text-lg font-semibold">Assessment #{assessment.code}</h3>
            <p className="text-sm text-muted-foreground">
              Claim #{assessment.claimId} • {format(assessment.date, 'yyyy-MM-dd')}
            </p>
          </div>
          <div className="flex items-center mt-2 md:mt-0 space-x-2">
            <Badge
              className="w-fit"
              variant={
                assessment.status === "pending"
                  ? "secondary"
                  : assessment.status === "scheduled"
                    ? "default"
                    : "outline"
              }
            >
              {assessment.status === "scheduled" && <Calendar className="h-3 w-3 mr-1" />}
              {assessment.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {assessment.status}
            </Badge>
            {assessment.priority && (
              <Badge
                className="w-fit"
                variant={
                  assessment.priority === "high"
                    ? "destructive"
                    : assessment.priority === "medium"
                      ? "default"
                      : "outline"
                }
              >
                {assessment.priority} Priority
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
                <span className="text-muted-foreground">Scheduled Date:</span> {assessment.scheduled_date}
              </>
            ) : (
              <>
                <span className="text-muted-foreground">Assessor:</span> {assessment.assessor.name}
                {/* &nbsp;
                <span className="text-muted-foreground">Insurer:</span> {assessment.insurer} */}
              </>
            )}
          </div>
        </div>

        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">Location:</span> {assessment.location}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          {assessment.status === "pending" && (
            <Button size="sm" asChild>
              <Link href={`/dashboard/insurer/assessments/${assessment.id}/schedule`}>Schedule Assessment</Link>
            </Button>
          )}
          {assessment.status === "scheduled" && (
            <Button size="sm" asChild>
              <Link href={`/dashboard/insurer/assessments/${assessment.id}/submit`}>Complete Assessment</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/insurer/assessments/${assessment.id}`}>View Details</Link>
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
