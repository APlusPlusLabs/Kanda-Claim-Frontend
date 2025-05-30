"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { AssignAssessorDialog } from "@/components/assign-assessor-dialog"
import { RequestInfoDialog } from "@/components/request-info-dialog"
import { useToast } from "@/components/ui/use-toast"

// Mock data for charts and analytics
const claimsOverTimeData = [
  { month: "Jan", claims: 45 },
  { month: "Feb", claims: 52 },
  { month: "Mar", claims: 48 },
  { month: "Apr", claims: 61 },
  { month: "May", claims: 55 },
  { month: "Jun", claims: 67 },
  { month: "Jul", claims: 72 },
]

const claimsByTypeData = [
  { name: "Collision", value: 42 },
  { name: "Theft", value: 12 },
  { name: "Natural Disaster", value: 6 },
  { name: "Fire", value: 8 },
  { name: "Vandalism", value: 14 },
  { name: "Other", value: 18 },
]

const claimsByStatusData = [
  { name: "Approved", value: 55 },
  { name: "Rejected", value: 12 },
  { name: "Pending", value: 23 },
  { name: "In Review", value: 10 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function InsurerDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [newClaims, setNewClaims] = useState([
    {
      id: "CL-2023-001",
      vehicle: "Toyota RAV4",
      date: "2025-12-15",
      status: "New",
      customer: "Mugisha Nkusi",
      estimatedAmount: 450000,
    },
    {
      id: "CL-2023-002",
      vehicle: "Suzuki Swift",
      date: "2025-11-28",
      status: "New",
      customer: "Uwase Marie",
      estimatedAmount: 280000,
    },
  ])

  const [inProgressClaims, setInProgressClaims] = useState([
    {
      id: "CL-2023-003",
      vehicle: "Honda Civic",
      date: "2025-10-05",
      status: "Assessment",
      customer: "Kamanzi Eric",
      estimatedAmount: 320000,
      assessor: "Habimana Jean",
    },
    {
      id: "CL-2023-004",
      vehicle: "Nissan X-Trail",
      date: "2025-09-20",
      status: "Repair",
      customer: "Mutesi Sarah",
      estimatedAmount: 520000,
      garage: "Kigali Auto Services",
    },
  ])

  const [completedClaims, setCompletedClaims] = useState([
    {
      id: "CL-2023-005",
      vehicle: "Mazda CX-5",
      date: "2025-08-15",
      status: "Completed",
      customer: "Nshimiyimana Claude",
      finalAmount: 380000,
      paymentStatus: "Paid",
    },
  ])

  const { toast } = useToast()
  const [assignAssessorOpen, setAssignAssessorOpen] = useState(false)
  const [requestInfoOpen, setRequestInfoOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<{
    id: string
    customer: string
  } | null>(null)

  // Calculate key metrics
  const totalClaims = newClaims.length + inProgressClaims.length + completedClaims.length
  const totalPayout = completedClaims.reduce((sum, claim) => sum + claim.finalAmount, 0)
  const avgProcessingDays = 12 // This would be calculated from actual data in a real app
  const fraudDetectionRate = 8.5 // Percentage of claims flagged for potential fraud

  // Handle view details button
  const handleViewDetails = (claimId: string) => {
    router.push(`/dashboard/insurer/claims/${claimId}`)
  }

  const handleAssignAssessor = (claimId: string, customer: string) => {
    setSelectedClaim({ id: claimId, customer })
    setAssignAssessorOpen(true)
  }

  const handleRequestInfo = (claimId: string, customer: string) => {
    setSelectedClaim({ id: claimId, customer })
    setRequestInfoOpen(true)
  }

  const handleAssignAssessorSubmit = (assessorId: string, date: Date, notes: string) => {
    // In a real app, this would call an API to assign the assessor
    console.log("Assigning assessor", { assessorId, date, notes, claimId: selectedClaim?.id })

    // Update the UI to reflect the change
    setNewClaims(
      (prevClaims) =>
        prevClaims
          .map((claim) => {
            if (claim.id === selectedClaim?.id) {
              // Move the claim to in-progress
              setInProgressClaims((prev) => [
                ...prev,
                {
                  ...claim,
                  status: "Assessment",
                  assessor: assessors.find((a) => a.id === assessorId)?.name || "Unknown",
                },
              ])
              // Return null to filter it out from newClaims in the next step
              return null
            }
            return claim
          })
          .filter(Boolean) as typeof newClaims,
    )

    toast({
      title: "Assessor assigned",
      description: `An assessor has been assigned to claim #${selectedClaim?.id}`,
    })
  }

  const handleRequestInfoSubmit = (message: string, documents: string[]) => {
    // In a real app, this would call an API to send the request
    console.log("Requesting info", { message, documents, claimId: selectedClaim?.id })

    toast({
      title: "Information requested",
      description: `Additional information has been requested for claim #${selectedClaim?.id}`,
    })
  }

  const assessors = [
    { id: "1", name: "Habimana Jean", specialization: "Vehicle Damage", availability: "High" },
    { id: "2", name: "Uwase Marie", specialization: "Theft Claims", availability: "Medium" },
    { id: "3", name: "Mugisha Eric", specialization: "Accident Investigation", availability: "Low" },
    { id: "4", name: "Nkusi David", specialization: "Vehicle Damage", availability: "High" },
  ]

  return (
    <DashboardLayout
      user={{
        name: user?.name ? `${user.name} ` : "user name",
        role: user?.role?.name+" @ "+ user?.tenant?.name,
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Assessments", href: "/dashboard/insurer/assessments", icon: <FileText className="h-5 w-5" /> },
        {
          name: "Multi-Signature Claims",
          href: "/dashboard/insurer/multi-signature-claims",
          icon: <FileText className="h-5 w-5" />,
        },
        { name: "Bids", href: "/dashboard/insurer/bids", icon: <FileText className="h-5 w-5" /> },
        { name: "Documents", href: "/dashboard/insurer/documents", icon: <FileText className="h-5 w-5" /> },
        { name: "Analytics", href: "/dashboard/insurer/analytics", icon: <BarChart3 className="h-5 w-5" /> },
        { name: "Users", href: "/dashboard/insurer/users", icon: <Users className="h-5 w-5" /> },
        
        { name: "Garages Partners", href: "/dashboard/insurer/garages", icon: <Wrench className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/insurer/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/insurer/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/insurer/profile", icon: <User className="h-5 w-5" /> },
        { name: "Logout", href: "/login", icon: <LogOut className="h-5 w-5" />}
      ]}
   //   actions={[{ name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }]}
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
              <CardDescription className="text-2xl font-bold text-purple-900">3</CardDescription>
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
                      data={claimsByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {claimsByTypeData.map((entry, index) => (
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

          <Card>
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
          </Card>
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
                        <h3 className="text-lg font-semibold">Claim #{claim.id}</h3>
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
                      <Button size="sm" onClick={() => handleAssignAssessor(claim.id, claim.customer)}>
                        Assign Assessor
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRequestInfo(claim.id, claim.customer)}>
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
                        <h3 className="text-lg font-semibold">Claim #{claim.id}</h3>
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
                        <h3 className="text-lg font-semibold">Claim #{claim.id}</h3>
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

        {/* Upcoming Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Activities</CardTitle>
            <CardDescription>Scheduled assessments and reviews for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-md">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-medium">Assessment for Claim #CL-2023-003</h4>
                    <span className="text-sm text-muted-foreground">Tomorrow, 10:00 AM</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Assessor: Habimana Jean</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 text-purple-700 p-2 rounded-md">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-medium">Review Investigation Report for Claim #CL-2023-006</h4>
                    <span className="text-sm text-muted-foreground">Friday, 2:00 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Investigator: Nshimiyimana Claude</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      Set Reminder
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest actions and updates on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-700 p-2 rounded-md">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-medium">Claim #CL-2023-008 approved</h4>
                    <span className="text-sm text-muted-foreground">Today, 9:15 AM</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Approved by: Jean-Paul Mugisha</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/insurer/claims/CL-2023-008">View Claim</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-md">
                  <FileSignature className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-medium">New multi-signature claim created</h4>
                    <span className="text-sm text-muted-foreground">Yesterday, 3:45 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Created by: Marie Uwimana</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/insurer/multi-signature-claims">View Claim</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 text-purple-700 p-2 rounded-md">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-medium">New assessor registered</h4>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">User: Emmanuel Hakizimana</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/insurer/users">View Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-amber-100 text-amber-700 p-2 rounded-md">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-medium">Potential fraud detected</h4>
                    <span className="text-sm text-muted-foreground">3 days ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Claim #CL-2023-007 flagged for review</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/insurer/claims/CL-2023-007">Investigate</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" className="w-full sm:w-auto">
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
            claimId={selectedClaim.id}
            onAssign={handleAssignAssessorSubmit}
          />
          <RequestInfoDialog
            open={requestInfoOpen}
            onOpenChange={setRequestInfoOpen}
            claimId={selectedClaim.id}
            customerName={selectedClaim.customer}
            onRequest={handleRequestInfoSubmit}
          />
        </>
      )}
    </DashboardLayout>
  )
}
