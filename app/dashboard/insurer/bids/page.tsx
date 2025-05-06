"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Plus,
  Search,
  Car,
  Clock,
  DollarSign,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { DateRangePicker } from "@/components/date-range-picker"
import type { Bid } from "@/lib/types/bidding"
import { useToast } from "@/components/ui/use-toast"

// Mock data for bids
const mockBids: Bid[] = [
  {
    id: "BID-2023-001",
    claimId: "CL-2023-001",
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
    createdAt: "2023-12-15T10:30:00Z",
    updatedAt: "2023-12-15T10:30:00Z",
    createdBy: "John Doe",
    interestedGarages: ["Garage-001", "Garage-002"],
    submissions: [],
    activities: [
      {
        id: "ACT-001",
        bidId: "BID-2023-001",
        activityType: "bid_created",
        description: "Bid was created",
        performedBy: {
          id: "USER-001",
          name: "John Doe",
          role: "Insurance Agent",
        },
        timestamp: "2023-12-15T10:30:00Z",
      },
    ],
  },
  {
    id: "BID-2023-002",
    claimId: "CL-2023-002",
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
    createdAt: "2023-11-28T14:15:00Z",
    updatedAt: "2023-12-01T09:45:00Z",
    createdBy: "Jane Smith",
    interestedGarages: ["Garage-001", "Garage-003", "Garage-004"],
    submissions: [
      {
        id: "SUB-001",
        bidId: "BID-2023-002",
        garageId: "Garage-001",
        garageName: "Kigali Auto Services",
        costBreakdown: [
          {
            item: "Side panel repair",
            cost: 150000,
            description: "Repair dents on driver side panel",
          },
          {
            item: "Painting",
            cost: 100000,
            description: "Paint matching and blending",
          },
          {
            item: "Labor",
            cost: 50000,
            description: "Labor costs",
          },
        ],
        totalCost: 300000,
        estimatedCompletionTime: {
          value: 5,
          unit: "days",
        },
        notes: "We can start work immediately upon approval",
        submittedAt: "2023-12-01T09:45:00Z",
        status: "pending",
      },
    ],
    activities: [
      {
        id: "ACT-002",
        bidId: "BID-2023-002",
        activityType: "bid_created",
        description: "Bid was created",
        performedBy: {
          id: "USER-002",
          name: "Jane Smith",
          role: "Insurance Agent",
        },
        timestamp: "2023-11-28T14:15:00Z",
      },
      {
        id: "ACT-003",
        bidId: "BID-2023-002",
        activityType: "garage_interested",
        description: "Garage expressed interest",
        performedBy: {
          id: "GARAGE-001",
          name: "Kigali Auto Services",
          role: "Garage",
        },
        timestamp: "2023-11-29T10:20:00Z",
      },
      {
        id: "ACT-004",
        bidId: "BID-2023-002",
        activityType: "bid_submitted",
        description: "Bid submission received",
        performedBy: {
          id: "GARAGE-001",
          name: "Kigali Auto Services",
          role: "Garage",
        },
        timestamp: "2023-12-01T09:45:00Z",
      },
    ],
  },
  {
    id: "BID-2023-003",
    claimId: "CL-2023-003",
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
    createdAt: "2023-10-05T11:20:00Z",
    updatedAt: "2023-10-10T15:30:00Z",
    createdBy: "Robert Johnson",
    interestedGarages: ["Garage-002", "Garage-005"],
    awardedTo: "Garage-002",
    submissions: [
      {
        id: "SUB-002",
        bidId: "BID-2023-003",
        garageId: "Garage-002",
        garageName: "Rwanda Motors",
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
        submittedAt: "2023-10-08T14:25:00Z",
        status: "accepted",
      },
    ],
    activities: [
      {
        id: "ACT-005",
        bidId: "BID-2023-003",
        activityType: "bid_created",
        description: "Bid was created",
        performedBy: {
          id: "USER-003",
          name: "Robert Johnson",
          role: "Insurance Agent",
        },
        timestamp: "2023-10-05T11:20:00Z",
      },
      {
        id: "ACT-006",
        bidId: "BID-2023-003",
        activityType: "bid_awarded",
        description: "Bid was awarded to Rwanda Motors",
        performedBy: {
          id: "USER-003",
          name: "Robert Johnson",
          role: "Insurance Agent",
        },
        timestamp: "2023-10-10T15:30:00Z",
      },
    ],
  },
  {
    id: "BID-2023-004",
    claimId: "CL-2023-004",
    vehicleInfo: {
      make: "Mazda",
      model: "CX-5",
      year: "2018",
      licensePlate: "RAE 234D",
      vin: "4S3BK675XW6987654",
    },
    damageDescription: "Windshield cracked due to stone impact",
    scopeOfWork: ["Replace windshield"],
    estimatedCost: 180000,
    photos: ["/placeholder.svg?height=200&width=300"],
    documents: ["/damage-report.pdf"],
    status: "completed",
    createdAt: "2023-09-20T09:10:00Z",
    updatedAt: "2023-09-25T16:45:00Z",
    createdBy: "Sarah Williams",
    interestedGarages: ["Garage-003"],
    awardedTo: "Garage-003",
    completedAt: "2023-09-25T16:45:00Z",
    submissions: [
      {
        id: "SUB-003",
        bidId: "BID-2023-004",
        garageId: "Garage-003",
        garageName: "Glass Experts",
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
        submittedAt: "2023-09-21T10:15:00Z",
        status: "accepted",
      },
    ],
    activities: [
      {
        id: "ACT-007",
        bidId: "BID-2023-004",
        activityType: "bid_created",
        description: "Bid was created",
        performedBy: {
          id: "USER-004",
          name: "Sarah Williams",
          role: "Insurance Agent",
        },
        timestamp: "2023-09-20T09:10:00Z",
      },
      {
        id: "ACT-008",
        bidId: "BID-2023-004",
        activityType: "bid_completed",
        description: "Repair work completed",
        performedBy: {
          id: "GARAGE-003",
          name: "Glass Experts",
          role: "Garage",
        },
        timestamp: "2023-09-25T16:45:00Z",
      },
    ],
  },
  {
    id: "BID-2023-005",
    claimId: "CL-2023-005",
    vehicleInfo: {
      make: "Suzuki",
      model: "Swift",
      year: "2019",
      licensePlate: "RAF 567E",
      vin: "5YJSA1DN5DFP12345",
    },
    damageDescription: "Engine overheating issue",
    scopeOfWork: ["Diagnose engine issue", "Replace radiator if needed", "Check cooling system"],
    estimatedCost: 250000,
    photos: ["/placeholder.svg?height=200&width=300"],
    documents: ["/damage-report.pdf"],
    status: "cancelled",
    createdAt: "2023-08-15T13:40:00Z",
    updatedAt: "2023-08-18T11:25:00Z",
    createdBy: "Michael Brown",
    interestedGarages: [],
    submissions: [],
    activities: [
      {
        id: "ACT-009",
        bidId: "BID-2023-005",
        activityType: "bid_created",
        description: "Bid was created",
        performedBy: {
          id: "USER-005",
          name: "Michael Brown",
          role: "Insurance Agent",
        },
        timestamp: "2023-08-15T13:40:00Z",
      },
      {
        id: "ACT-010",
        bidId: "BID-2023-005",
        activityType: "bid_cancelled",
        description: "Bid was cancelled due to policy coverage issues",
        performedBy: {
          id: "USER-005",
          name: "Michael Brown",
          role: "Insurance Agent",
        },
        timestamp: "2023-08-18T11:25:00Z",
      },
    ],
  },
]

export default function BidsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined)
  const [bids, setBids] = useState<Bid[]>(mockBids)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading bids from API
  useEffect(() => {
    const loadBids = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 800))
        setBids(mockBids)
      } catch (error) {
        console.error("Error loading bids:", error)
        toast({
          title: "Error Loading Bids",
          description: "There was an error loading the bids. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadBids()
  }, [toast])

  // Filter bids based on search term, status, and date range
  const filteredBids = bids.filter((bid) => {
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

  // Group bids by status for tabs
  const openBids = filteredBids.filter((bid) => bid.status === "open")
  const inProgressBids = filteredBids.filter((bid) => bid.status === "in-progress")
  const awardedBids = filteredBids.filter((bid) => bid.status === "awarded")
  const completedBids = filteredBids.filter((bid) => bid.status === "completed")
  const cancelledBids = filteredBids.filter((bid) => bid.status === "cancelled")

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

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateRange(undefined)
  }

  // Handle creating a new bid
  const handleCreateNewBid = () => {
    // Clear any stored bid data in session/local storage to ensure a fresh form
    sessionStorage.removeItem("currentBidDraft")
    localStorage.removeItem("currentBidDraft")

    // Clear any URL parameters or state that might be carried over
    const cleanUrl = "/dashboard/insurer/bids/new"

    // Navigate to the new bid page with a timestamp parameter to force a fresh load
    router.push(`${cleanUrl}?t=${Date.now()}`)
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Sanlam Alianz",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <FileText className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Bids", href: "/dashboard/insurer/bids", icon: <FileText className="h-5 w-5" /> },
        { name: "Documents", href: "/dashboard/insurer/documents", icon: <FileText className="h-5 w-5" /> },
      ]}
      actions={[]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Repair Bids</h1>
            <p className="text-muted-foreground">Manage and track repair bids for vehicle claims</p>
          </div>
          <Button onClick={handleCreateNewBid}>
            <Plus className="h-4 w-4 mr-2" /> Create New Bid
          </Button>
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
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Bids ({filteredBids.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({openBids.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressBids.length})</TabsTrigger>
            <TabsTrigger value="awarded">Awarded ({awardedBids.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBids.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledBids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredBids.length > 0 ? (
              filteredBids.map((bid) => (
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
                          Claim #{bid.claimId} • Created on {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/insurer/bids/${bid.id}`}>View Details</Link>
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
                          Estimated: {bid.estimatedCost.toLocaleString()} RWF
                          {bid.submissions.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.interestedGarages.length} interested garage(s)
                          {bid.awardedTo && (
                            <div className="text-xs text-muted-foreground">
                              Awarded to:{" "}
                              {bid.submissions.find((s) => s.garageId === bid.awardedTo)?.garageName || "Unknown"}
                            </div>
                          )}
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
                    <h3 className="text-lg font-semibold mb-2">No Bids Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all" || dateRange
                        ? "No bids match your current filters. Try adjusting your search criteria."
                        : "No bids have been created yet. Create your first bid to get started."}
                    </p>
                    {searchTerm || statusFilter !== "all" || dateRange ? (
                      <Button onClick={clearFilters}>Clear Filters</Button>
                    ) : (
                      <Button onClick={handleCreateNewBid}>
                        <Plus className="h-4 w-4 mr-2" /> Create New Bid
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : openBids.length > 0 ? (
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
                          Claim #{bid.claimId} • Created on {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/insurer/bids/${bid.id}`}>View Details</Link>
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
                          Estimated: {bid.estimatedCost.toLocaleString()} RWF
                          {bid.submissions.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">{bid.interestedGarages.length} interested garage(s)</div>
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
                    <p className="text-sm text-muted-foreground mb-4">
                      There are currently no open bids in the system.
                    </p>
                    <Button onClick={handleCreateNewBid}>
                      <Plus className="h-4 w-4 mr-2" /> Create New Bid
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Similar TabsContent for other status tabs */}
          <TabsContent value="in-progress" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : inProgressBids.length > 0 ? (
              inProgressBids.map((bid) => (
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
                          Claim #{bid.claimId} • Created on {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/insurer/bids/${bid.id}`}>View Details</Link>
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
                          Estimated: {bid.estimatedCost.toLocaleString()} RWF
                          {bid.submissions.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">{bid.interestedGarages.length} interested garage(s)</div>
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
                    <h3 className="text-lg font-semibold mb-2">No Bids In Progress</h3>
                    <p className="text-sm text-muted-foreground mb-4">There are currently no bids in progress.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Similar content for awarded, completed, and cancelled tabs */}
          <TabsContent value="awarded" className="space-y-4">
            {/* Similar structure as above */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : awardedBids.length > 0 ? (
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
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Claim #{bid.claimId} • Created on {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/insurer/bids/${bid.id}`}>View Details</Link>
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
                          Estimated: {bid.estimatedCost.toLocaleString()} RWF
                          {bid.submissions.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.interestedGarages.length} interested garage(s)
                          {bid.awardedTo && (
                            <div className="text-xs text-muted-foreground">
                              Awarded to:{" "}
                              {bid.submissions.find((s) => s.garageId === bid.awardedTo)?.garageName || "Unknown"}
                            </div>
                          )}
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
                    <p className="text-sm text-muted-foreground mb-4">There are currently no awarded bids.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {/* Similar structure as above */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : completedBids.length > 0 ? (
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
                          Claim #{bid.claimId} • Created on {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/insurer/bids/${bid.id}`}>View Details</Link>
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
                          Estimated: {bid.estimatedCost.toLocaleString()} RWF
                          {bid.submissions.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.interestedGarages.length} interested garage(s)
                          {bid.awardedTo && (
                            <div className="text-xs text-muted-foreground">
                              Awarded to:{" "}
                              {bid.submissions.find((s) => s.garageId === bid.awardedTo)?.garageName || "Unknown"}
                            </div>
                          )}
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
                    <p className="text-sm text-muted-foreground mb-4">There are currently no completed bids.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {/* Similar structure as above */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : cancelledBids.length > 0 ? (
              cancelledBids.map((bid) => (
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
                          Claim #{bid.claimId} • Created on {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/insurer/bids/${bid.id}`}>View Details</Link>
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
                          Estimated: {bid.estimatedCost.toLocaleString()} RWF
                          {bid.submissions.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.interestedGarages.length} interested garage(s)
                          {bid.awardedTo && (
                            <div className="text-xs text-muted-foreground">
                              Awarded to:{" "}
                              {bid.submissions.find((s) => s.garageId === bid.awardedTo)?.garageName || "Unknown"}
                            </div>
                          )}
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
                    <h3 className="text-lg font-semibold mb-2">No Cancelled Bids</h3>
                    <p className="text-sm text-muted-foreground mb-4">There are currently no cancelled bids.</p>
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
