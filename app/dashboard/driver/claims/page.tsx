"use client"

import { useState } from "react"
import Link from "@/Next.js/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Car,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  FileImage,
  FileIcon as FilePdf,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Update the mock claims data to be within a reasonable timeframe (not going beyond April 2025)
const mockClaims = [
  {
    id: "CL-2025-001",
    vehicle: "Toyota RAV4",
    plateNumber: "RAA 123A",
    date: "2025-03-15",
    status: "In Progress",
    progress: 45,
    insurer: "Sanlam Alianz",
    amount: 450000,
    description: "Front bumper damage due to collision with another vehicle at Kimironko junction.",
    documents: [
      { name: "Accident_Scene.jpg", type: "image" },
      { name: "Police_Report.pdf", type: "pdf" },
      { name: "Damage_Photos.jpg", type: "image" },
    ],
    timeline: [
      { date: "2025-03-15", event: "Claim submitted", status: "complete" },
      { date: "2025-03-16", event: "Claim received by Sanlam Alianz", status: "complete" },
      { date: "2025-03-18", event: "Assessment scheduled", status: "complete" },
      { date: "2025-03-20", event: "Assessment completed", status: "complete" },
      { date: "2025-03-22", event: "Repair approval", status: "in-progress" },
      { date: "2025-03-25", event: "Repairs begin", status: "pending" },
      { date: "2025-03-30", event: "Repairs complete", status: "pending" },
      { date: "2025-04-05", event: "Claim closed", status: "pending" },
    ],
  },
  {
    id: "CL-2025-002",
    vehicle: "Suzuki Swift",
    plateNumber: "RAB 456B",
    date: "2025-02-28",
    status: "Assessment",
    progress: 25,
    insurer: "Sanlam Alianz",
    amount: 280000,
    description: "Side mirror and door damage from parking incident at Kigali Heights.",
    documents: [
      { name: "Damage_Photos.jpg", type: "image" },
      { name: "Driver_License.pdf", type: "pdf" },
    ],
    timeline: [
      { date: "2025-02-28", event: "Claim submitted", status: "complete" },
      { date: "2025-03-01", event: "Claim received by Sanlam Alianz", status: "complete" },
      { date: "2025-03-05", event: "Assessment scheduled", status: "in-progress" },
      { date: "2025-03-10", event: "Assessment completed", status: "pending" },
      { date: "2025-03-15", event: "Repair approval", status: "pending" },
    ],
  },
  {
    id: "CL-2025-003",
    vehicle: "Honda Civic",
    plateNumber: "RAC 789C",
    date: "2025-01-05",
    status: "Completed",
    progress: 100,
    insurer: "Sanlam Alianz",
    amount: 320000,
    description: "Rear bumper damage from being hit while parked at Nyabugogo bus station.",
    documents: [
      { name: "Accident_Scene.jpg", type: "image" },
      { name: "Repair_Invoice.pdf", type: "pdf" },
      { name: "Final_Assessment.pdf", type: "pdf" },
    ],
    timeline: [
      { date: "2025-01-05", event: "Claim submitted", status: "complete" },
      { date: "2025-01-06", event: "Claim received by Sanlam Alianz", status: "complete" },
      { date: "2025-01-08", event: "Assessment scheduled", status: "complete" },
      { date: "2025-01-10", event: "Assessment completed", status: "complete" },
      { date: "2025-01-12", event: "Repair approval", status: "complete" },
      { date: "2025-01-15", event: "Repairs begin", status: "complete" },
      { date: "2025-01-25", event: "Repairs complete", status: "complete" },
      { date: "2025-01-30", event: "Claim closed", status: "complete" },
    ],
  },
  {
    id: "CL-2024-004",
    vehicle: "Toyota Corolla",
    plateNumber: "RAD 101D",
    date: "2024-12-12",
    status: "Rejected",
    progress: 0,
    insurer: "Sanlam Alianz",
    amount: 0,
    description: "Windshield crack from road debris on Kigali-Musanze highway.",
    documents: [
      { name: "Damage_Photos.jpg", type: "image" },
      { name: "Rejection_Letter.pdf", type: "pdf" },
    ],
    timeline: [
      { date: "2024-12-12", event: "Claim submitted", status: "complete" },
      { date: "2024-12-13", event: "Claim received by Sanlam Alianz", status: "complete" },
      { date: "2024-12-15", event: "Claim review", status: "complete" },
      { date: "2024-12-20", event: "Claim rejected - Not covered under policy", status: "rejected" },
    ],
  },
]

export default function DriverClaimsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Filter claims based on search query and status filter
  const filteredClaims = mockClaims.filter((claim) => {
    const matchesSearch =
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && claim.status !== "Completed" && claim.status !== "Rejected") ||
      (statusFilter === "completed" && claim.status === "Completed") ||
      (statusFilter === "rejected" && claim.status === "Rejected")

    return matchesSearch && matchesStatus
  })

  const activeClaims = filteredClaims.filter((claim) => claim.status !== "Completed" && claim.status !== "Rejected")
  const completedClaims = filteredClaims.filter((claim) => claim.status === "Completed")
  const rejectedClaims = filteredClaims.filter((claim) => claim.status === "Rejected")

  const openClaimDetails = (claim: any) => {
    setSelectedClaim(claim)
    setIsDetailsOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "Assessment":
        return <Badge className="bg-yellow-500">Assessment</Badge>
      case "Completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTimelineStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-300" />
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage className="h-5 w-5 text-blue-500" />
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Mugisha Nkusi",
        role: "Driver",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/driver", icon: <Car className="h-5 w-5" /> },
        { name: "My Claims", href: "/dashboard/driver/claims", icon: <FileText className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Claims</h1>
            <p className="text-muted-foreground mt-2">View and manage all your insurance claims</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/driver/claims/new">
              <Plus className="mr-2 h-4 w-4" /> New Claim
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search claims by ID, vehicle, or description..."
              className="max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Claims</SelectItem>
                  <SelectItem value="active">Active Claims</SelectItem>
                  <SelectItem value="completed">Completed Claims</SelectItem>
                  <SelectItem value="rejected">Rejected Claims</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Claims</CardTitle>
              <div className="text-2xl font-bold">{activeClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Claims in progress</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Claims</CardTitle>
              <div className="text-2xl font-bold">{completedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Successfully processed claims</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Claims</CardTitle>
              <div className="text-2xl font-bold">{rejectedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Claims that were not approved</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Claims ({filteredClaims.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeClaims.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedClaims.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedClaims.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredClaims.length > 0 ? (
              filteredClaims.map((claim) => (
                <Card key={claim.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Claim #{claim.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {claim.vehicle} ({claim.plateNumber}) • {claim.date}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0">{getStatusBadge(claim.status)}</div>
                      </div>

                      <p className="text-sm mb-4 line-clamp-2">{claim.description}</p>

                      {claim.status !== "Completed" && claim.status !== "Rejected" && (
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{claim.progress}%</span>
                          </div>
                          <Progress value={claim.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Insurer:</span> {claim.insurer}
                        </div>
                        <div className="text-sm mt-2 md:mt-0">
                          <span className="text-muted-foreground">
                            {claim.status === "Completed" ? "Final Amount:" : "Estimated Amount:"}
                          </span>{" "}
                          {claim.amount.toLocaleString()} RWF
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Button>
                        {claim.status === "In Progress" && (
                          <Button size="sm">
                            <FileText className="mr-2 h-4 w-4" /> Update Claim
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Claims Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any claims matching your search criteria.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/driver/claims/new">
                        <Plus className="mr-2 h-4 w-4" /> Submit New Claim
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeClaims.length > 0 ? (
              activeClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim.vehicle} ({claim.plateNumber}) • {claim.date}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">{getStatusBadge(claim.status)}</div>
                    </div>

                    <p className="text-sm mb-4">{claim.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{claim.progress}%</span>
                      </div>
                      <Progress value={claim.progress} className="h-2" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {claim.insurer}
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <span className="text-muted-foreground">Estimated Amount:</span> {claim.amount.toLocaleString()}{" "}
                        RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                      <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Update Claim
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
                    <h3 className="text-lg font-semibold mb-2">No Active Claims</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any active insurance claims at the moment.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/driver/claims/new">
                        <Plus className="mr-2 h-4 w-4" /> Submit New Claim
                      </Link>
                    </Button>
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
                          {claim.vehicle} ({claim.plateNumber}) • {claim.date}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0 w-fit bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                      </Badge>
                    </div>

                    <p className="text-sm mb-4">{claim.description}</p>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {claim.insurer}
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <span className="text-muted-foreground">Final Amount:</span> {claim.amount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
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
                    <p className="text-sm text-muted-foreground">You don't have any completed insurance claims yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedClaims.length > 0 ? (
              rejectedClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim.vehicle} ({claim.plateNumber}) • {claim.date}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0 w-fit" variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" /> Rejected
                      </Badge>
                    </div>

                    <p className="text-sm mb-4">{claim.description}</p>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {claim.insurer}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Rejected Claims</h3>
                    <p className="text-sm text-muted-foreground">You don't have any rejected insurance claims.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Claim Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            {selectedClaim && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Claim #{selectedClaim.id}</span>
                    {getStatusBadge(selectedClaim.status)}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedClaim.vehicle} ({selectedClaim.plateNumber}) • Submitted on {selectedClaim.date}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Claim Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Insurer:</span>
                        <span>{selectedClaim.insurer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{selectedClaim.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {selectedClaim.status === "Completed" ? "Final Amount:" : "Estimated Amount:"}
                        </span>
                        <span>{selectedClaim.amount.toLocaleString()} RWF</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-medium mt-4 mb-2">Description</h3>
                    <p className="text-sm">{selectedClaim.description}</p>

                    <h3 className="text-sm font-medium mt-4 mb-2">Documents</h3>
                    <div className="space-y-2">
                      {selectedClaim.documents.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            {getDocumentIcon(doc.type)}
                            <span className="ml-2">{doc.name}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Claim Timeline</h3>
                    <div className="space-y-4">
                      {selectedClaim.timeline.map((item: any, index: number) => (
                        <div key={index} className="flex">
                          <div className="mr-3">{getTimelineStatusIcon(item.status)}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.event}</p>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  {selectedClaim.status !== "Completed" && selectedClaim.status !== "Rejected" && (
                    <Button>
                      <FileText className="mr-2 h-4 w-4" /> Update Claim
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
