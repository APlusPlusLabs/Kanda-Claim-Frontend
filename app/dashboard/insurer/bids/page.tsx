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
import { useAuth } from "@/lib/auth-provider"
import { DateRangePicker } from "@/components/date-range-picker"
import type { Bid } from "@/lib/types/bidding"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const STORAGES_URL = process.env.NEXT_PUBLIC_STORAGES_URL


export default function BidsPage() {
  const router = useRouter()
  const { user, apiRequest } = useAuth()
  const { toast } = useToast()
  const [bids, setBids] = useState<Bid[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBids = async () => {
      setIsLoading(true)
      try {
        const response = await apiRequest(`${API_URL}bids/${user.tenant_id}`, "GET");
        const processedBids = response.map((bid: Bid) => ({
          ...bid,
          interested_garages: Array.from(
            new Set(bid.submissions?.map((sub: { garage_id: string }) => sub.garage_id) || [])
          ),
        }));

        setBids(processedBids);
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
      bid.claim_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.vehicle_info.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.vehicle_info.model.toLowerCase().includes(searchTerm.toLowerCase()) 

    const matchesStatus = statusFilter === "all" || bid.status === statusFilter

    const matchesDateRange =
      !dateRange || (new Date(bid.created_at) >= dateRange.from && new Date(bid.created_at) <= dateRange.to)

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
        name: user.name,
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <FileText className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Bids", href: "/dashboard/insurer/bids", icon: <FileText className="h-5 w-5" /> },
        { name: "Documents", href: "/dashboard/insurer/documents", icon: <FileText className="h-5 w-5" /> },
      ]}
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
                          <h3 className="text-lg font-semibold">Bid #{bid.code}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Claim #{bid.claim.code} • Created on {new Date(bid.created_at).toLocaleDateString()}
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicle_info.licensePlate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Estimated: {bid.estimated_cost.toLocaleString()} RWF
                          {bid.submissions?.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions?.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.interested_garages?.length} interested garage(s)
                          {bid.awarded_to && (
                            <div className="text-xs text-muted-foreground">
                              Awarded to:{" "}
                              {bid.submissions?.find((s) => s.garage_id === bid.awarded_to)?.garage?.name || "Unknown"}
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
                          <h3 className="text-lg font-semibold">Bid #{bid.code}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Claim #{bid.claim.code} • Created on {new Date(bid.created_at).toLocaleDateString()}
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicle_info.licensePlate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Estimated: {bid.estimated_cost.toLocaleString()} RWF
                          {bid.submissions?.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions?.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">{bid.interested_garages?.length} interested garage(s)</div>
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
                          <h3 className="text-lg font-semibold">Bid #{bid.code}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Claim #{bid.claim.code} • Created on {new Date(bid.created_at).toLocaleDateString()}
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Estimated: {bid.estimated_cost.toLocaleString()} RWF
                          {bid.submissions?.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions?.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">{bid.interested_garages?.length} interested garage(s)</div>
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
                          <h3 className="text-lg font-semibold">Bid #{bid.code}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Claim #{bid.claim.code} • Created on {new Date(bid.created_at).toLocaleDateString()}
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Estimated: {bid.estimated_cost.toLocaleString()} RWF
                          {bid.submissions?.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions?.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.interested_garages?.length} interested garage(s)
                          {bid.awarded_to && (
                            <div className="text-xs text-muted-foreground">
                              Awarded to:{" "}
                              {bid.submissions?.find((s) => s.garage_id === bid.awarded_to)?.garage?.name || "Unknown"}
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
                          <h3 className="text-lg font-semibold">Bid #{bid.code}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Claim #{bid.claim.code} • Created on {new Date(bid.created_at).toLocaleDateString()}
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicle_info.licensePlate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Estimated: {bid.estimated_cost.toLocaleString()} RWF
                          {bid.submissions?.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions?.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.interested_garages?.length} interested garage(s)
                          {bid.awarded_to && (
                            <div className="text-xs text-muted-foreground">
                              Awarded to:{" "}
                              {bid.submissions?.find((s) => s.garage_id === bid.awarded_to)?.garage?.name || "Unknown"}
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
                          <h3 className="text-lg font-semibold">Bid #{bid.code}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Claim #{bid.claim.code} • Created on {new Date(bid.created_at).toLocaleDateString()}
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicle_info.licensePlate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Estimated: {bid.estimated_cost.toLocaleString()} RWF
                          {bid.submissions?.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {bid.submissions?.length} bid submission(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {bid.interested_garages?.length} interested garage(s)
                          {bid.awarded_to && (
                            <div className="text-xs text-muted-foreground">
                              Awarded to:{" "}
                              {bid.submissions?.find((s) => s.garage_id === bid.awarded_to)?.garage?.name || "Unknown"}
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
