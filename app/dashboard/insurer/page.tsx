"use client"

import { SetStateAction, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Calendar,
  ArrowRight,
  FileSignature,
  Wrench,
  Settings,
  UserCog,
  CreditCard,
} from "lucide-react"
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { AssignAssessorDialog } from "@/components/assign-assessor-dialog"
import { RequestInfoDialog } from "@/components/request-info-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Claim } from "@/lib/types/claims"
import KPICard from "@/components/KPICard"



const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function InsurerDashboard() {
  const router = useRouter()
  const { user, apiRequest } = useAuth()

  const [claimsOverTime, setClaimsOverTime] = useState([])
  const [claimsByType, setClaimsByType] = useState([])
  const [claimsByStatus, setClaimsByStatus] = useState({
    New: [],
    InProgress: [],
    Completed: [],
  })
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  const { toast } = useToast()
  const [assignAssessorOpen, setAssignAssessorOpen] = useState(false)
  const [requestInfoOpen, setRequestInfoOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<Claim>()
  const [newClaims, setNewClaims] = useState<any[]>([])
  const [multisignatureClaims, setMultisignatureClaims] = useState(0)


  const [inProgressClaims, setInProgressClaims] = useState<any[]>([])

  const [completedClaims, setCompletedClaims] = useState<any[]>([])

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  // Fetch claims data
  useEffect(() => {
    const fetchClaimsData = async () => {
      if (!user?.tenant_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "user and tenant required",
        });
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        //  setError(null)

        // get claims over time
        const overTimeData = await apiRequest(
          `${API_URL}claims/${user.tenant_id}/over-time?year=${year}`,
          "GET"
        )
        setClaimsOverTime(overTimeData)

        // get multisignatureClaims count
        const multisignatureClaimsCount = await apiRequest(
          `${API_URL}claims/${user.tenant_id}/multi-signature-count?year=${year}`,
          "GET"
        )
        setMultisignatureClaims(multisignatureClaimsCount)

        // get claims by type
        const byTypeData = await apiRequest(
          `${API_URL}claims/${user.tenant_id}/by-type?year=${year}`,
          "GET"
        )
        setClaimsByType(byTypeData)
        // get claims by status
        const byStatusData = await apiRequest(
          `${API_URL}claims/${user.tenant_id}/by-status?year=${year}`,
          "GET"
        )
        setClaimsByStatus({
          New: byStatusData.New || [],
          InProgress: byStatusData.InProgress || [],
          Completed: byStatusData.Completed || [],
        })
        setNewClaims(byStatusData.New || [])
        setInProgressClaims(byStatusData.InProgress || [])
        setCompletedClaims(byStatusData.Completed || [])
        // Fetch recent activities
        const recentActivitiesData = await apiRequest(
          `${API_URL}recent-activities-by-tenant/${user.tenant_id}`,
          "GET"
        );
        setRecentActivities(recentActivitiesData);

        // Fetch upcoming activities
        const upcomingActivitiesData = await apiRequest(
          `${API_URL}upcoming-activities-by-tenant/${user.tenant_id}`,
          "GET"
        );
        setUpcomingActivities(upcomingActivitiesData);
      } catch (err) {
        console.error("Error fetching claims:", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch claims data: " + err,
        });
      } finally {
        setLoading(false)
      }
    }

    fetchClaimsData()
  }, [user?.tenant_id, year])


  // Calculate key metrics
  const totalClaims = newClaims.length + inProgressClaims.length + completedClaims.length
  const totalPayout = completedClaims.reduce((sum, claim) => sum + claim.finalAmount, 0)
  const avgProcessingDays = 12 // This would be calculated from actual data in a real app
  const fraudDetectionRate = 8.5 // Percentage of claims flagged for potential fraud

  // Handle view details button
  const handleViewDetails = (claimId: string) => {
    router.push(`/dashboard/insurer/claims/${claimId}`)
  }

  const handleAssignAssessor = (claim: Claim) => {
    setSelectedClaim(claim)
    setAssignAssessorOpen(true)
  }

  const handleRequestInfo = (claim: Claim) => {
    setSelectedClaim(claim)
    setRequestInfoOpen(true)
  }

  const handleRequestInfoSubmit = (message: string, documents: string[]) => {
    // In a real app, this would call an API to send the request
    console.log("Requesting info", { message, documents, claimId: selectedClaim?.id })

    toast({
      title: "Information requested",
      description: `Additional information has been requested for claim #${selectedClaim?.id}`,
    })
  }
  const refreshClaimsData = async () => {
    try {
      const byStatusData = await apiRequest(
        `${API_URL}claims/${user?.tenant_id}/by-status?year=${year}`,
        "GET"
      );
      setClaimsByStatus({
        New: byStatusData.New || [],
        InProgress: byStatusData.InProgress || [],
        Completed: byStatusData.Completed || [],
      });
      setNewClaims(byStatusData.New || []);
      setInProgressClaims(byStatusData.InProgress || []);
      setCompletedClaims(byStatusData.Completed || []);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh claims data.",
      });
    }
  };
  return (
    <DashboardLayout
      user={{
        name: user.name,
        role: user.role.name + " @ " + user.tenant.name,
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Clients (Drivers)", href: "/dashboard/insurer/clients", icon: <Users className="h-5 w-5" /> },
        { name: "Assessments", href: "/dashboard/insurer/assessments", icon: <FileText className="h-5 w-5" /> },
        {
          name: "Multi-Signature Claims",
          href: "/dashboard/insurer/multi-signature-claims",
          icon: <FileText className="h-5 w-5" />,
        },
        { name: "Bids", href: "/dashboard/insurer/bids", icon: <FileText className="h-5 w-5" /> },
        { name: "Documents", href: "/dashboard/insurer/documents", icon: <FileText className="h-5 w-5" /> },
        { name: "Analytics", href: "/dashboard/insurer/analytics", icon: <BarChart3 className="h-5 w-5" /> },
        { name: "Company Staff & Users", href: "/dashboard/insurer/users", icon: <UserCog className="h-5 w-5" /> },

        { name: "Garages Partners", href: "/dashboard/insurer/garages", icon: <Wrench className="h-5 w-5" /> },

        { name: "Contracts", href: "/dashboard/insurer/contracts", icon: <FileText className="h-5 w-5" /> },
        { name: "Payments", href: "/dashboard/insurer/payments", icon: <CreditCard className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/insurer/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/insurer/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Settings", href: "/dashboard/insurer/settings", icon: <Settings className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/insurer/profile", icon: <User className="h-5 w-5" /> },
        { name: "Logout", href: "/login", icon: <LogOut className="h-5 w-5" /> }
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Insurer Dashboard</h1>
          <Link href="/dashboard/insurer/multi-signature-claims">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileSignature className="mr-2 h-4 w-4" />
              Multi-Signature Claims
            </Button>
          </Link>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Claims</CardTitle>
              <CardDescription className="text-2xl font-bold">{newClaims.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Awaiting review</div>
              <div className="mt-2">
                <Progress value={(newClaims.length / totalClaims) * 100} className="h-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <CardDescription className="text-2xl font-bold">{inProgressClaims.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Claims being processed</div>
              <div className="mt-2">
                <Progress value={(inProgressClaims.length / totalClaims) * 100} className="h-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CardDescription className="text-2xl font-bold">{completedClaims.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Claims finalized</div>
              <div className="mt-2">
                <Progress value={(completedClaims.length / totalClaims) * 100} className="h-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Payout</CardTitle>
              <CardDescription className="text-2xl font-bold">{totalPayout.toLocaleString()} RWF</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">For completed claims</div>
              <div className="mt-2 flex items-center text-xs">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500 font-medium">+12%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          {/* Add this new card */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Multi-Signature Claims</CardTitle>
              <CardDescription className="text-2xl font-bold text-purple-900">{multisignatureClaims}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-purple-700">Requires multiple approvals</div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/insurer/multi-signature-claims">View Claims</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Claims by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={claimsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {claimsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-end">
                <Button variant="link" size="sm" asChild>
                  <Link href="/dashboard/insurer/analytics">
                    View breakdown <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <KPICard></KPICard>
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Avg. Processing Time</span>
                  <span className="text-sm font-medium">{avgProcessingDays} days</span>
                </div>
                <Progress value={(avgProcessingDays / 20) * 100} className="h-2" />
                <div className="flex items-center mt-1 text-xs">
                  <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500 font-medium">-2.5 days</span>
                  <span className="text-muted-foreground ml-1">from last quarter</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Fraud Detection Rate</span>
                  <span className="text-sm font-medium">{fraudDetectionRate}%</span>
                </div>
                <Progress value={fraudDetectionRate * 10} className="h-2" />
                <div className="flex items-center mt-1 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500 font-medium">+1.2%</span>
                  <span className="text-muted-foreground ml-1">from last quarter</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Customer Satisfaction</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
                <div className="flex items-center mt-1 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500 font-medium">+3%</span>
                  <span className="text-muted-foreground ml-1">from last quarter</span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/insurer/analytics">View All KPIs</Link>
                </Button>
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Claims Tabs */}
        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="new">New Claims</TabsTrigger>
            <TabsTrigger value="inprogress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed Claims</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4">
            {newClaims.length > 0 ? (
              newClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim.vehicle} • {claim.date}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0 w-fit" variant="secondary">
                        {claim.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {claim.customer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimated Amount:</span>{" "}
                        {claim.estimatedAmount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button size="sm" onClick={() => handleAssignAssessor(claim)}>
                        Assign Assessor
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRequestInfo(claim)}>
                        Request Info
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(claim.id)}>
                        View Details
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
                    <h3 className="text-lg font-semibold mb-2">No New Claims</h3>
                    <p className="text-sm text-muted-foreground mb-4">You don't have any new claims at the moment.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inprogress" className="space-y-4">
            {inProgressClaims.length > 0 ? (
              inProgressClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim.vehicle} • {claim.date}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0 w-fit">{claim.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {claim.customer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimated Amount:</span>{" "}
                        {claim.estimatedAmount.toLocaleString()} RWF
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {claim.status === "Assessment" ? "Assessor:" : "Garage:"}
                        </span>{" "}
                        {claim.status === "Assessment" ? claim.assessor : claim.garage}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      {claim.status === "Assessment" ? (
                        <Button size="sm">Review Assessment</Button>
                      ) : (
                        <Button size="sm">Check Repair Status</Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(claim.id)}>
                        View Details
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
                    <h3 className="text-lg font-semibold mb-2">No Claims In Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any claims in progress at the moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedClaims.length > 0 ? (
              completedClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim.vehicle} • {claim.date}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0 space-x-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> {claim.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            claim.paymentStatus === "Paid"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          <DollarSign className="h-3 w-3 mr-1" /> {claim.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {claim.customer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Final Amount:</span>{" "}
                        {claim.finalAmount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(claim.id)}>
                        View Details
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
                    <h3 className="text-lg font-semibold mb-2">No Completed Claims</h3>
                    <p className="text-sm text-muted-foreground">You don't have any completed claims yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        {/* upcoming activities */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Activities</CardTitle>
            <CardDescription>Scheduled assessments and reviews for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingActivities.length > 0 ? (
                upcomingActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-md">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="font-medium">Assessment for Claim #{activity.description}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(activity.scheduled_at).toLocaleString('en-US', {
                            weekday: 'long',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assessor: {activity.assessor?.first_name} {activity.assessor?.last_name}
                      </p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No upcoming activities scheduled.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* recrnt activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest actions and updates on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-md ${activity.event.toLowerCase().includes('approved') ? 'bg-green-100 text-green-700' :
                        activity.event.toLowerCase().includes('created') ? 'bg-blue-100 text-blue-700' :
                          activity.event.toLowerCase().includes('flagged') ? 'bg-amber-100 text-amber-700' :
                            'bg-purple-100 text-purple-700'
                        }`}
                    >
                      {activity.event.toLowerCase().includes('approved') ? <CheckCircle2 className="h-5 w-5" /> :
                        activity.event.toLowerCase().includes('created') ? <FileSignature className="h-5 w-5" /> :
                          activity.event.toLowerCase().includes('flagged') ? <AlertTriangle className="h-5 w-5" /> :
                            <Users className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="font-medium">
                          {activity.event}
                          {/* {activity.event === 'approved' ? `Claim #${activity.description} approved` :
                            activity.event === 'created' ? `New ${activity.table_name === 'claims' ? 'claim' : 'activity'} created` :
                              activity.event === 'flagged' ? `Potential fraud detected in claim #${activity.description}` :
                                activity.description} */}
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        By: {activity.user?.first_name} {activity.user?.last_name}
                      </p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/insurer/${activity.table_name}/${activity.table_id}`}
                          >
                            View {activity.table_name === 'claims' ? 'Claim' : activity.table_name === 'assessments' ? 'Assessment' : 'Bid'}
                          </Link>
                          {/* <Link
                            href={`/dashboard/insurer/${activity.table_name === 'claims' ? 'claims' :
                              activity.table_name === 'assessments' ? 'assessments' :
                                'bids'
                              }/${activity.description}`}
                          >
                            View {activity.table_name === 'claims' ? 'Claim' : activity.table_name === 'assessments' ? 'Assessment' : 'Bid'}
                          </Link> */}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No recent activities found.</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/dashboard/insurer/notifications')}>
                View All Activities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedClaim && (
        <>
          <AssignAssessorDialog
            open={assignAssessorOpen}
            onOpenChange={setAssignAssessorOpen}
            claim={selectedClaim}
            onAssignSuccess={refreshClaimsData}
          />
          <RequestInfoDialog
            open={requestInfoOpen}
            onOpenChange={setRequestInfoOpen}
            claim={selectedClaim}
            onRequestSuccess={refreshClaimsData}
          />
        </>
      )}
    </DashboardLayout>
  )
}
