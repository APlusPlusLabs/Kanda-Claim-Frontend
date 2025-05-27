"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
// Define the assessment type based on your data structure
interface Assessment {
  id: string
  code: string
  claimId: string
  vehicle: string
  date: string
  customer: string
  insurer: string
  location: string
  scheduled_date?: string
  status: string
  priority?: string
  estimatedAmount?: number
}

export default function AssessorDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  // State for all assessments and processed data
  const [assignments, setAssignments] = useState<any[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  // API request function (you'll need to implement this based on your setup)
  const apiRequest = async (url: string, method: string) => {
    // Replace with your actual API request implementation
    const response = await fetch(url, { method })
    if (!response.ok) throw new Error('API request failed')
    return response.json()
  }

  const fetchAndProcessAssignments = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const response = await apiRequest(`${API_URL}assignment-by-user/${user?.id}`, "GET")
      const assignmentsData = response?.data || response || []

      setAssignments(assignmentsData)

      const processedAssessments = assignmentsData.map((assign: any) => {
        const claim = assign.claim
        const vehicle = claim?.vehicles?.[0]

        return {
          ...claim,
          ...assign,
          id: assign.id,
          code: assign.code,
          claimId: claim?.code || 'N/A',
          vehicle: vehicle ? `${vehicle.model} ${vehicle.make} ${vehicle.year}` : 'No vehicle info',
          date: claim?.accident_date,
          customer: claim?.user?.name || 'Unknown',
          insurer: claim?.tenant?.name || 'Unknown',
          location: claim?.location,
          scheduled_date: assign.scheduled_date,
          status: assign.status,
          // You might want to add priority logic based on your business rules
          priority: determinePriority(assign, claim),
          // Add estimated amount if available in your data
          estimatedAmount: assign.estimated_amount || claim?.estimated_amount,
        }
      })

      console.log('Processed Assessments:', processedAssessments)
      setAssessments(processedAssessments)

    } catch (error: any) {
      if (Array.isArray(error.errors)) {
        error.errors.forEach((er: string) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: er,
          })
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch assignments data",
        })
      }
      console.error("Error fetching assignments:", error)
      setAssignments([])
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  // Helper function to determine priority based on your business logic
  const determinePriority = (assign: any, claim: any) => {
    // Implement your priority logic here
    // This is just an example - adjust based on your requirements
    if (claim?.severity === 'high' || assign?.urgent) return 'High'
    if (claim?.severity === 'medium') return 'Medium'
    return 'Low'
  }

  useEffect(() => {
    if (user) {
      fetchAndProcessAssignments()
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You have to sign in to use this panel",
      })
      router.push("/login")
    }
  }, [user, router, toast])

  // Filter assessments by status
  const pendingAssessments = assessments.filter(a => a.status?.toLowerCase() === 'pending')
  const scheduledAssessments = assessments.filter(a => a.status?.toLowerCase() === 'scheduled')
  const completedAssessments = assessments.filter(a => a.status?.toLowerCase() === 'completed')

  if (loading) {
    return (
      <DashboardLayout
        user={{
          name: user?.name ? `${user.name}` : "User name",
          role: user?.role?.name,
          avatar: user?.avatar ? user?.avatar : "/placeholder.svg?height=40&width=40",
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading your assessments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      user={{
        name: user?.name ? `${user.name}` : "User name",
        role: user?.role?.name,
        avatar: user?.avatar ? user?.avatar : "/placeholder.svg?height=40&width=40",
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
                {pendingAssessments.length}
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
                {scheduledAssessments.length}
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
            {pendingAssessments.length > 0 ? (
              pendingAssessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Assessment #{assessment.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          Claim #{assessment.claimId} • {new Date(assessment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0 space-x-2">
                        <Badge className="w-fit" variant="secondary">
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
            {scheduledAssessments.length > 0 ? (
              scheduledAssessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Assessment #{assessment.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          Claim #{assessment.claimId} • {new Date(assessment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0 space-x-2">
                        <Badge className="w-fit" variant="default">
                          <Calendar className="h-3 w-3 mr-1" /> {assessment.status}
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
                        <span className="text-muted-foreground">Scheduled Date:</span>{" "}
                        {assessment.scheduled_date ? new Date(assessment.scheduled_date).toLocaleDateString() : 'Not set'}
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
                        <h3 className="text-lg font-semibold">Assessment #{assessment.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          Claim #{assessment.claimId} • {new Date(assessment.date).toLocaleDateString()}
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
                      {assessment.estimatedAmount && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Estimated Amount:</span>{" "}
                          {assessment.estimatedAmount.toLocaleString()} RWF
                        </div>
                      )}
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