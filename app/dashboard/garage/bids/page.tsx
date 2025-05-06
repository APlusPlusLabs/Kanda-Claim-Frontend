"use client"

import { useState } from "react"
import Link from "@/Next.js/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Calendar, Car, Clock, DollarSign, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { DateRangePicker } from "@/components/date-range-picker"
import type { Bid } from "@/lib/types/bidding"

// Mock data for bids
const mockBids: Bid[] = [
  {
    id: "BID-2025-001",
    claimId: "CL-2025-001",
    vehicleInfo: {
      make: "Toyota",
      model: "RAV4",
      year: "2020",
      licensePlate: "RAC 123A",
      vin: "1HGCM82633A123456",
    },
    damageDescription: "Front bumper damage and headlight broken due to collision",
    scopeOfWork: ["Replace front bumper", "Replace left headlight", "Paint matching"],
    estimatedCost: 450000,
    photos: ["/placeholder.svg?height=200&width=300"],
    documents: ["/damage-report.pdf"],
    status: "open",
    createdAt: "2025-03-15T10:30:00Z",
    updatedAt: "2025-03-15T10:30:00Z",
    createdBy: "John Doe",
    interestedGarages: [],
    submissions: [],
    activities: [],
  },
  {
    id: "BID-2025-002",
    claimId: "CL-2025-002",
    vehicleInfo: {
      make: "Honda",
      model: "Civic",
      year: "2019",
      licensePlate: "RAB 456B",
      vin: "2FMDK48C13BA54321",
    },
    damageDescription: "Side panel dents and scratches from parking incident",
    scopeOfWork: ["Repair side panel dents", "Repaint affected areas"],
    estimatedCost: 280000,
    photos: ["/placeholder.svg?height=200&width=300"],
    documents: ["/damage-report.pdf"],
    status: "in-progress",
    createdAt: "2025-02-28T14:15:00Z",
    updatedAt: "2025-03-01T09:45:00Z",
    createdBy: "Jane Smith",
    interestedGarages: ["Garage-001"],
    submissions: [],
    activities: [],
  },
  {
    id: "BID-2025-003",
    claimId: "CL-2025-003",
    vehicleInfo: {
      make: "Nissan",
      model: "X-Trail",
      year: "2021",
      licensePlate: "RAD 789C",
      vin: "3VWFE21C04M123789",
    },
    damageDescription: "Rear bumper damage and broken taillight from rear-end collision",
    scopeOfWork: ["Replace rear bumper", "Replace right taillight", "Paint matching"],
    estimatedCost: 380000,
    photos: ["/placeholder.svg?height=200&width=300"],
    documents: ["/damage-report.pdf"],
    status: "awarded",
    createdAt: "2025-01-05T11:20:00Z",
    updatedAt: "2025-01-10T15:30:00Z",
    createdBy: "Robert Johnson",
    interestedGarages: ["Garage-001"],
    awardedTo: "Garage-001",
    submissions: [
      {
        id: "SUB-2025-002",
        bidId: "BID-2025-003",
        garageId: "Garage-001",
        garageName: "Kigali Auto Services",
        costBreakdown: [
          {
            item: "Rear bumper replacement",
            cost: 200000,
            description: "OEM rear bumper replacement",
          },
          {
            item: "Taillight replacement",
            cost: 80000,
            description: "OEM right taillight assembly",
          },
          {
            item: "Painting",
            cost: 70000,
            description: "Paint matching and blending",
          },
          {
            item: "Labor",
            cost: 60000,
            description: "Labor costs",
          },
        ],
        totalCost: 410000,
        estimatedCompletionTime: {
          value: 1,
          unit: "weeks",
        },
        notes: "We have all parts in stock and can begin immediately",
        submittedAt: "2025-01-08T14:25:00Z",
        status: "accepted",
      },
    ],
    activities: [],
  },
  {
    id: "BID-2024-004",
    claimId: "CL-2024-004",
    vehicleInfo: {
      make: "Mazda",
      model: "CX-5",
      year: "2023",
      licensePlate: "RAE 234D",
      vin: "4S3BK675XW6987654",
    },
    damageDescription: "Windshield cracked due to stone impact",
    scopeOfWork: ["Replace windshield"],
    estimatedCost: 180000,
    photos: ["/placeholder.svg?height=200&width=300"],
    documents: ["/damage-report.pdf"],
    status: "completed",
    createdAt: "2024-12-20T09:10:00Z",
    updatedAt: "2024-12-25T16:45:00Z",
    createdBy: "Sarah Williams",
    interestedGarages: ["Garage-001"],
    awardedTo: "Garage-001",
    completedAt: "2024-12-25T16:45:00Z",
    submissions: [
      {
        id: "SUB-2024-003",
        garageId: "Garage-001",
        garageName: "Kigali Auto Services",
        costBreakdown: [
          {
            item: "Windshield replacement",
            cost: 150000,
            description: "OEM windshield with installation",
          },
          {
            item: "Labor",
            cost: 30000,
            description: "Labor costs",
          },
        ],
        totalCost: 180000,
        estimatedCompletionTime: {
          value: 2,
          unit: "days",
        },
        notes: "Same day service available",
        submittedAt: "2024-12-21T10:15:00Z",
        status: "accepted",
      },
    ],
    activities: [],
  },
]

export default function GarageBidsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined)

  // Filter bids based on search term, status, and date range
  const filteredBids = mockBids.filter((bid) => {
    const matchesSearch =
      searchTerm === "" ||
      bid.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.vehicleInfo.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.vehicleInfo.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.vehicleInfo.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || bid.status === statusFilter

    const matchesDateRange =
      !dateRange || (new Date(bid.createdAt) >= dateRange.from && new Date(bid.createdAt) <= dateRange.to)

    return matchesSearch && matchesStatus && matchesDateRange
  })

  // Group bids by status and interest
  const openBids = filteredBids.filter((bid) => bid.status === "open" && !bid.interestedGarages.includes("Garage-001"))
  const interestedBids = filteredBids.filter(
    (bid) => bid.interestedGarages.includes("Garage-001") && bid.status !== "awarded" && bid.status !== "completed",
  )
  const awardedBids = filteredBids.filter((bid) => bid.awardedTo === "Garage-001" && bid.status !== "completed")
  const completedBids = filteredBids.filter((bid) => bid.awardedTo === "Garage-001" && bid.status === "completed")

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return { variant: "outline" as const, icon: <AlertCircle className="h-3 w-3 mr-1" /> }
      case "in-progress":
        return { variant: "secondary" as const, icon: <Clock className="h-3 w-3 mr-1" /> }
      case "awarded":
        return { variant: "default" as const, icon: <CheckCircle2 className="h-3 w-3 mr-1" /> }
      case "completed":
        return { variant: "success" as const, icon: <CheckCircle2 className="h-3 w-3 mr-1" /> }
      case "cancelled":
        return { variant: "destructive" as const, icon: <XCircle className="h-3 w-3 mr-1" /> }
      default:
        return { variant: "outline" as const, icon: null }
    }
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Kigali Auto Services",
        role: "Garage",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/garage", icon: null },
        { name: "Repairs", href: "/dashboard/garage/repairs", icon: null },
        { name: "Bids", href: "/dashboard/garage/bids", icon: null },
        { name: "Schedule", href: "/dashboard/garage/schedule", icon: null },
      ]}
      actions={[]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Repair Bids</h1>
            <p className="text-muted-foreground">Browse and submit bids for vehicle repairs</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by ID, claim, vehicle..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="awarded">Awarded</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <DateRangePicker date={dateRange} setDate={setDateRange} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bids Tabs */}
        <Tabs defaultValue="open" className="space-y-4">
          <TabsList>
            <TabsTrigger value="open">Open Bids ({openBids.length})</TabsTrigger>
            <TabsTrigger value="interested">Interested ({interestedBids.length})</TabsTrigger>
            <TabsTrigger value="awarded">Awarded ({awardedBids.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4">
            {openBids.length > 0 ? (
              openBids.map((bid) => (
                <Card key={bid.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">Bid #{bid.id}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created on {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button asChild>
                        <Link href={`/dashboard/garage/bids/${bid.id}`}>View Details</Link>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.vehicleInfo.make} {bid.vehicleInfo.model} ({bid.vehicleInfo.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicleInfo.licensePlate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">Estimated: {bid.estimatedCost.toLocaleString()} RWF</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">{bid.scopeOfWork.length} repair items</div>
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
                    <h3 className="text-lg font-semibold mb-2">No Open Bids</h3>
                    <p className="text-sm text-muted-foreground mb-4">There are currently no open bids available.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="interested" className="space-y-4">
            {interestedBids.length > 0 ? (
              interestedBids.map((bid) => (
                <Card key={bid.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">Bid #{bid.id}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                          {bid.submissions.some((s) => s.garageId === "Garage-001") ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Bid Submitted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Interested
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created on {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!bid.submissions.some((s) => s.garageId === "Garage-001") && (
                          <Button asChild>
                            <Link href={`/dashboard/garage/bids/${bid.id}/submit`}>Submit Bid</Link>
                          </Button>
                        )}
                        <Button variant="outline" asChild>
                          <Link href={`/dashboard/garage/bids/${bid.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.vehicleInfo.make} {bid.vehicleInfo.model} ({bid.vehicleInfo.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicleInfo.licensePlate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">Estimated: {bid.estimatedCost.toLocaleString()} RWF</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">{bid.scopeOfWork.length} repair items</div>
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
                    <h3 className="text-lg font-semibold mb-2">No Interested Bids</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't expressed interest in any bids yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="awarded" className="space-y-4">
            {awardedBids.length > 0 ? (
              awardedBids.map((bid) => (
                <Card key={bid.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">Bid #{bid.id}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                          <Badge variant="success" className="bg-green-50 text-green-700 border-green-200">
                            Awarded to You
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Awarded on {new Date(bid.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/garage/bids/${bid.id}`}>View Details</Link>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.vehicleInfo.make} {bid.vehicleInfo.model} ({bid.vehicleInfo.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicleInfo.licensePlate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Your bid:{" "}
                          {bid.submissions.find((s) => s.garageId === "Garage-001")?.totalCost.toLocaleString()} RWF
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Estimated completion:{" "}
                          {bid.submissions.find((s) => s.garageId === "Garage-001")?.estimatedCompletionTime.value}{" "}
                          {bid.submissions.find((s) => s.garageId === "Garage-001")?.estimatedCompletionTime.unit}
                        </div>
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
                    <h3 className="text-lg font-semibold mb-2">No Awarded Bids</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any bids that have been awarded to you yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBids.length > 0 ? (
              completedBids.map((bid) => (
                <Card key={bid.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">Bid #{bid.id}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Completed on {new Date(bid.completedAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/garage/bids/${bid.id}`}>View Details</Link>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.vehicleInfo.make} {bid.vehicleInfo.model} ({bid.vehicleInfo.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicleInfo.licensePlate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Final amount:{" "}
                          {bid.submissions.find((s) => s.garageId === "Garage-001")?.totalCost.toLocaleString()} RWF
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Duration:{" "}
                          {new Date(bid.completedAt!).getTime() - new Date(bid.updatedAt).getTime() > 0
                            ? Math.ceil(
                                (new Date(bid.completedAt!).getTime() - new Date(bid.updatedAt).getTime()) /
                                  (1000 * 60 * 60 * 24),
                              )
                            : 1}{" "}
                          days
                        </div>
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
                    <h3 className="text-lg font-semibold mb-2">No Completed Bids</h3>
                    <p className="text-sm text-muted-foreground">You don't have any completed bids yet.</p>
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
