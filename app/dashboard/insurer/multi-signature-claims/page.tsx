"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileSignature, Clock, CheckCircle2, XCircle, Eye, Plus, Filter } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { MultiSignatureWorkflow } from "@/components/e-signature/multi-signature-workflow"
import type { SignatureInfo } from "@/components/e-signature/signature-display"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
// Mock data for multi-signature claims
const mockClaims = [
  {
    id: "MS-2023-001",
    title: "High-Value Vehicle Damage Claim",
    claimId: "37837-3873873kjkdj-uuiui",
    code: "CL-2023-042",
    date: "2025-12-10",
    status: "pending_approval",
    customer: "Mugisha Jean",
    amount: 2500000,
    workflow_type: 'sequential',
    description: "Luxury vehicle damage requiring multiple approvals due to high claim amount",
    approvers: [
      {
        id: "1",
        name: "Uwimana Marie",
        role: "Claims Manager",
        status: "approved",
        timestamp: new Date("2025-12-11T10:30:00"),
        signature:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t3UFu20YUgOHnUTZZpgfoMbJMT9BeIL1BewQDWWaZHiG9QXuE9AYtUCDZZJngGSQQEJAVW7LGQ/L7F4Yt2xLJx8fHGZK2m6enp6vNZvPXZrP5Y7vdXnlMCBAgUCGw2+3+3W63f19fX/+z2+3+vLq6+uf5+fnr8/Pz5vHx8Z/r6+s/t9vt71VzNgcCBAicEtjtdl+22+0/T09PXzebzdfN4+Pj1+12e7vZbG5DCAgQIFAusNvtvm232y+bh4eHL5vt9vrL5uHh4fPNzc1tuYQJESBA4LTA58+fP282m9vN/f39p5ubm7vTh/iEAAECNQL39/ef7u7u7jb39/ef7u7u7mqmawYECBA4LXB3d3d3f3//6ZxgHR9nv7+/v/UYESBAoELg9vb2y+3t7e05wToe3N/f33qMCBAgUCFwTrCOB/f39/cVEzYHAgQInBM8wSJAYDiBc4J1fCXw4eHBY0WAwGgCJXcJj0/e39/fj7ZY8yVAYCyBkoP7x8P7+/v7sZZrtgQIjCZwTrCOx7Du7+/vRluu+RIgMJbAOcE6vnh/f39/N9ZyzZYAgdEEzgnW8aD+/f393WjLNV8CBMYSOCdYx1cJ7+/v78ZartlOKuBK+0kXdqJlnROsE4f7iMCIAv7B5IirPm/O5wTr+NLN8XhWxXs3z5uxowmMIVDyTvdjLNMsCYwtUBKs8VdvBQRGEihbwJFWbK4ECJQESLAIEBhOQLCGW7kFExAsz4HhBARruJVbMAHB8hwYTkCwhlv5cAv2TvfDLfnsBS8ZrLNn4AACBMYWEKyx92/2BIYTEKzhVm7BBAQr9jnwm8nYvZtdTECwYvYCFbN3s4sJCFbMXqBi9m52MQHBitkLVMzezS4mIFgxe4GK2bvZxQQEK2YvUDF7N7uYgGDF7AUqZu9mFxMQrJi9QMXs3exiAoIVsxeomL2bXUxAsGL2AhWzd7OLCQhWzF6gYvZudjEBwYrZC1TM3s0uJiBYMXuBitm72cUEBCtmL1AxezebQGAJr8ZPsGwTJkBgIQHBWgjaZRMgkBEQrIyjqxAgsBCBYC0E7bIJEMgICFbG0VUIEFgIQLAWgj7nsl3lPkfJMQTOFxCs861KjnSVu4TRJAicLyBY51uVHOkqdwmjSRA4X0Cwzrcq+cRV7hJGkyBwvoBgnW9V8omr3CWMJkHgfAHBOt+q5BNXuUsYTYLA+QKCdb5VySeucpcwmgSB8wUE63yrsk9c5S6jNBEC5wkI1nlOZUe5yl1GaSIEzhMQrPOcyo5ylbuM0kQInCcgWOc5lR3lKncZpYkQOE9AsM5zKjvKVe4yShMhcJ6AYJ3nVHaUq9xllCZC4DwBwTrPqewoV7nLKE2EwHkCgnWeU9lRrnKXUZoIgfMEBOs8p7KjXOUuozQRAucJCNZ5TmVHucpdRmkiBM4TEKzznMqOcpW7jNJECJwnIFjnOZUd5Sp3GaWJEDhP4H9Z7r9g5zS8AQAAAABJRU5ErkJggg==",
      },
      {
        id: "2",
        name: "Nkusi Emmanuel",
        role: "Finance Director",
        status: "pending",
        timestamp: null,
        signature: null,
      },
      {
        id: "3",
        name: "Hakizimana Jean-Paul",
        role: "Chief Operations Officer",
        status: "pending",
        timestamp: null,
        signature: null,
      },
    ],
  },
]

export default function MultiSignatureClaimsPage() {
  const router = useRouter()

  const { user, apiRequest } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState();
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [selectedClaim, setSelectedClaim] = useState<(typeof mockClaims)[0] | null>(null)
  const [showWorkflow, setShowWorkflow] = useState(false)
  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const response = await apiRequest(`${API_URL}claims/${user.tenant_id}/multi-signature?status=${statusFilter}&date=${dateFilter}`, "GET");
        setClaims(response);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load claims", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [statusFilter, dateFilter]);
  if (!claims) {
    return <>No CLaims Yet.</>
  }
  const handleViewClaim = (claim: (typeof mockClaims)[0]) => {
    setSelectedClaim(claim)
    setShowWorkflow(true)
  }

  const handleWorkflowComplete = async (approvers: SignatureInfo[]) => {
    setShowWorkflow(false)
    try {
      approvers.forEach(async apr => {
        const response = await apiRequest(`${API_URL}claims/${user.tenant_id}/approve/${selectedClaim.claimId}/${apr.id}`, "POST", {
          id: apr.id,
          name: apr.name,
          rejection_reason: apr.rejectReason,
          status: apr.status,
          user_id: user.id,
          signture: apr.signature
        });
      });

      toast({
        title: "Workflow updated",
        description: "The multi-signature workflow has been updated successfully",
      })
    } catch (error: any) {

      toast({
        title: "Error",
        description: JSON.stringify(error),
        variant: 'destructive'
      })
    }
  }

  const handleCreateNew = () => {
    router.push("/dashboard/insurer/multi-signature-claims/new")
  }

  const filteredClaims = claims.filter((claim) => {
    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "pending") return false
      if (statusFilter === "approved") return false
      if (statusFilter === "rejected") return false
    }

    // Filter by date (simplified for demo)
    if (dateFilter !== "all") {
      const claimDate = new Date(claim.date)
      const today = new Date()
      const lastWeek = new Date()
      lastWeek.setDate(today.getDate() - 7)
      const lastMonth = new Date()
      lastMonth.setMonth(today.getMonth() - 1)

      if (dateFilter === "week" && claimDate < lastWeek) return false
      if (dateFilter === "month" && claimDate < lastMonth) return false
    }

    return true
  })

  return (
    <DashboardLayout
      user={{
        name: user.name,
        role: user.role.name + " @ " + user.tenant.name,
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <FileSignature className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileSignature className="h-5 w-5" /> },
        {
          name: "Multi-Signature Claims",
          href: "/dashboard/insurer/multi-signature-claims",
          icon: <FileSignature className="h-5 w-5" />,
        },
        { name: "Bids", href: "/dashboard/insurer/bids", icon: <FileSignature className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Multi-Signature Claims</h1>
            <p className="text-muted-foreground">
              Manage claims that require multiple approvals from different stakeholders
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date Range</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="date">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Claims Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Claims</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {/* <TabsContent value="all" className="space-y-4">
            {loading ? (
              // Loading skeletons
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <Skeleton className="h-6 w-48 mb-2" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-24 mt-2 md:mt-0" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : filteredClaims.length > 0 ? (
              filteredClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{claim.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Claim: {claim.code} • {claim.date}
                        </p>
                      </div>
                      <Badge
                        className="mt-2 md:mt-0 w-fit"
                        variant={
                          claim.status === "approved"
                            ? "default"
                            : claim.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {claim.status === "pending_approval"
                          ? "Pending Approval"
                          : claim.status === "approved"
                            ? "Approved"
                            : "Rejected"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {claim.customer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Amount:</span> {claim.amount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{claim.description}</p>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Approval Status:</div>
                      <div className="flex flex-wrap gap-2">
                        {claim.approvers.map((approver) => (
                          <Badge
                            key={approver.id}
                            variant={
                              approver.status === "approved"
                                ? "outline"
                                : approver.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              approver.status === "approved"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : approver.status === "rejected"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : ""
                            }
                          >
                            {approver.name} ({approver.role}):&nbsp;
                            {approver.status === "approved" ? (
                              <CheckCircle2 className="h-3 w-3 inline ml-1" />
                            ) : approver.status === "rejected" ? (
                              <XCircle className="h-3 w-3 inline ml-1" />
                            ) : (
                              <Clock className="h-3 w-3 inline ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => handleViewClaim(claim)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Workflow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <FileSignature className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Claims Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No multi-signature claims match your current filters.
                    </p>
                    <Button
                      onClick={() => {
                        setStatusFilter("all")
                        setDateFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent> */}


<TabsContent value="all" className="space-y-4">
  {loading ? (
    // Loading skeletons
    Array(3)
      .fill(0)
      .map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24 mt-2 md:mt-0" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))
  ) : filteredClaims.length > 0 ? (
    filteredClaims.map((claim) => (
      <Card key={claim.id}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{claim.title}</h3>
              <p className="text-sm text-muted-foreground">
                Claim: {claim.code} • {claim.date}
              </p>
            </div>
            <Badge
              className="mt-2 md:mt-0 w-fit"
              variant={
                claim.status === "approved"
                  ? "default"
                  : claim.status === "rejected"
                    ? "destructive"
                    : "secondary"
              }
            >
              {claim.status === "pending_approval"
                ? "Pending Approval"
                : claim.status === "approved"
                  ? "Approved"
                  : "Rejected"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Customer:</span> {claim.customer}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Amount:</span> {claim.amount.toLocaleString()} RWF
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{claim.description}</p>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Approval Status:</div>
            <div className="flex flex-wrap gap-2">
              {claim.approvers.map((approver) => (
                <Badge
                  key={approver.id}
                  variant={
                    approver.status === "approved"
                      ? "outline"
                      : approver.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                  className={
                    approver.status === "approved"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : approver.status === "rejected"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : ""
                  }
                >
                  {approver.name} ({approver.role}):&nbsp;
                  {approver.status === "approved" ? (
                    <CheckCircle2 className="h-3 w-3 inline ml-1" />
                  ) : approver.status === "rejected" ? (
                    <XCircle className="h-3 w-3 inline ml-1" />
                  ) : (
                    <Clock className="h-3 w-3 inline ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={() => handleViewClaim(claim)}>
              <Eye className="mr-2 h-4 w-4" />
              View Workflow
            </Button>
          </div>
        </CardContent>
      </Card>
    ))
  ) : (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <FileSignature className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Claims Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No multi-signature claims match your current filters.
          </p>
          <Button
            onClick={() => {
              setStatusFilter("all")
              setDateFilter("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )}
</TabsContent>

<TabsContent value="pending" className="space-y-4">
  {loading ? (
    // Loading skeletons
    Array(3)
      .fill(0)
      .map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24 mt-2 md:mt-0" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))
  ) : filteredClaims.filter(claim => claim.status === "pending_approval").length > 0 ? (
    filteredClaims
      .filter(claim => claim.status === "pending_approval")
      .map((claim) => (
        <Card key={claim.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{claim.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Claim: {claim.code} • {claim.date}
                </p>
              </div>
              <Badge className="mt-2 md:mt-0 w-fit" variant="secondary">
                Pending Approval
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Customer:</span> {claim.customer}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Amount:</span> {claim.amount.toLocaleString()} RWF
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{claim.description}</p>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Approval Progress:</div>
              <div className="flex flex-wrap gap-2">
                {claim.approvers.map((approver) => (
                  <Badge
                    key={approver.id}
                    variant={
                      approver.status === "approved"
                        ? "outline"
                        : approver.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                    className={
                      approver.status === "approved"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : approver.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : ""
                    }
                  >
                    {approver.name} ({approver.role}):&nbsp;
                    {approver.status === "approved" ? (
                      <CheckCircle2 className="h-3 w-3 inline ml-1" />
                    ) : approver.status === "rejected" ? (
                      <XCircle className="h-3 w-3 inline ml-1" />
                    ) : (
                      <Clock className="h-3 w-3 inline ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => handleViewClaim(claim)}>
                <Eye className="mr-2 h-4 w-4" />
                Review
              </Button>
              <Button onClick={() => handleViewClaim(claim)}>
                <FileSignature className="mr-2 h-4 w-4" />
                Process Approval
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
          <h3 className="text-lg font-semibold mb-2">No Pending Claims</h3>
          <p className="text-sm text-muted-foreground mb-4">
            All multi-signature claims have been processed or there are no pending approvals.
          </p>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Claim
          </Button>
        </div>
      </CardContent>
    </Card>
  )}
</TabsContent>

<TabsContent value="approved" className="space-y-4">
  {loading ? (
    // Loading skeletons
    Array(3)
      .fill(0)
      .map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24 mt-2 md:mt-0" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))
  ) : filteredClaims.filter(claim => claim.status === "approved").length > 0 ? (
    filteredClaims
      .filter(claim => claim.status === "approved")
      .map((claim) => (
        <Card key={claim.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{claim.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Claim: {claim.code} • {claim.date}
                </p>
              </div>
              <Badge className="mt-2 md:mt-0 w-fit bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Approved
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Customer:</span> {claim.customer}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Amount:</span> {claim.amount.toLocaleString()} RWF
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{claim.description}</p>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Approval History:</div>
              <div className="flex flex-wrap gap-2">
                {claim.approvers
                  .filter(approver => approver.status === "approved")
                  .map((approver) => (
                    <Badge
                      key={approver.id}
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {approver.name} ({approver.role})
                      <CheckCircle2 className="h-3 w-3 inline ml-1" />
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => handleViewClaim(claim)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              <Button variant="outline">
                <FileSignature className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ))
  ) : (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Approved Claims</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No multi-signature claims have been fully approved yet.
          </p>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Claim
          </Button>
        </div>
      </CardContent>
    </Card>
  )}
</TabsContent>

<TabsContent value="rejected" className="space-y-4">
  {loading ? (
    // Loading skeletons
    Array(3)
      .fill(0)
      .map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24 mt-2 md:mt-0" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))
  ) : filteredClaims.filter(claim => claim.status === "rejected").length > 0 ? (
    filteredClaims
      .filter(claim => claim.status === "rejected")
      .map((claim) => (
        <Card key={claim.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{claim.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Claim: {claim.code} • {claim.date}
                </p>
              </div>
              <Badge className="mt-2 md:mt-0 w-fit" variant="destructive">
                <XCircle className="mr-1 h-3 w-3" />
                Rejected
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Customer:</span> {claim.customer}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Amount:</span> {claim.amount.toLocaleString()} RWF
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{claim.description}</p>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Rejection Details:</div>
              <div className="flex flex-wrap gap-2">
                {claim.approvers.map((approver) => (
                  <Badge
                    key={approver.id}
                    variant={
                      approver.status === "approved"
                        ? "outline"
                        : approver.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                    className={
                      approver.status === "approved"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : approver.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : ""
                    }
                  >
                    {approver.name} ({approver.role}):&nbsp;
                    {approver.status === "approved" ? (
                      <CheckCircle2 className="h-3 w-3 inline ml-1" />
                    ) : approver.status === "rejected" ? (
                      <XCircle className="h-3 w-3 inline ml-1" />
                    ) : (
                      <Clock className="h-3 w-3 inline ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => handleViewClaim(claim)}>
                <Eye className="mr-2 h-4 w-4" />
                View Rejection Details
              </Button>
              <Button variant="outline">
                <FileSignature className="mr-2 h-4 w-4" />
                Resubmit Claim
              </Button>
            </div>
          </CardContent>
        </Card>
      ))
  ) : (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <XCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Rejected Claims</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No multi-signature claims have been rejected.
          </p>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Claim
          </Button>
        </div>
      </CardContent>
    </Card>
  )}
</TabsContent>
        </Tabs>

        {/* Multi-Signature Workflow Dialog */}
        {showWorkflow && selectedClaim && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Multi-Signature Workflow</CardTitle>
              <CardDescription>
                Claim #{selectedClaim.code} - {selectedClaim.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultiSignatureWorkflow
                claimId={selectedClaim.id}
                claimTitle={selectedClaim.title}
                approvers={selectedClaim.approvers}
                onComplete={handleWorkflowComplete}
                sequential={selectedClaim.workflow_type === 'sequential' ? true : false}
              />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowWorkflow(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
