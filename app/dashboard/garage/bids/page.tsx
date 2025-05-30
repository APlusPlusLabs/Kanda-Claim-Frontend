"use client"

import { useEffect, useState } from "react"
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
import { useAuth } from "@/lib/auth-provider"
import { DateRangePicker } from "@/components/date-range-picker"
import type { Bid } from "@/lib/types/bidding"
import { toast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";

export default function GarageBidsPage() {
  const router = useRouter()
  const { user, apiRequest } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined)

  const [bids, setBids] = useState<Bid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const loadBids = async () => {
      setIsLoading(true)
      try {
        const response = await apiRequest(`${API_URL}bids/${user.tenant_id}`, "GET");
        setBids(response)
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

  // Group bids by status and interest
  const openBids = filteredBids.filter((bid) => bid.status === "open" && !bid.interested_garages?.includes("Garage-001"))
  const interestedBids = filteredBids.filter(
    (bid) => bid.interested_garages?.includes("Garage-001") && bid.status !== "awarded" && bid.status !== "completed",
  )
  const awardedBids = filteredBids.filter((bid) => bid.awarded_to === "Garage-001" && bid.status !== "completed")
  const completedBids = filteredBids.filter((bid) => bid.awarded_to === "Garage-001" && bid.status === "completed")

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
        name: user?.name,
        role: "Garage",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/garage", icon: null },
        { name: "Repairs", href: "/dashboard/garage/repairs", icon: null },
        { name: "Bids", href: "/dashboard/garage/bids", icon: null },
        { name: "Schedule", href: "/dashboard/garage/schedule", icon: null },
      ]}
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
                          <h3 className="text-lg font-semibold">Bid #{bid.code}</h3>
                          <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                            {getStatusBadge(bid.status).icon}
                            {bid.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created on {new Date(bid.created_at).toLocaleDateString()}
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">Estimated: {bid.estimated_cost.toLocaleString()} RWF</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">{bid.scope_of_work.length} repair items</div>
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
            {interestedBids?.length > 0 ? (
              interestedBids?.map((bid) => (
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
                          {bid.submissions?.some((s) => s.garage_id === "Garage-001") ? (
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
                          Created on {new Date(bid.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!bid.submissions?.some((s) => s.garage_id === "Garage-001") && (
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicle_info.license_plate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">Estimated: {bid.estimated_cost.toLocaleString()} RWF</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">{bid.scope_of_work.length} repair items</div>
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
            {awardedBids?.length > 0 ? (
              awardedBids?.map((bid) => (
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
                          Awarded on {new Date(bid.updated_at).toLocaleDateString()}
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicle_info.license_plate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Your bid:{" "}
                          {bid.submissions?.find((s) => s.garage_id === "Garage-001")?.proposed_cost.toLocaleString()} RWF
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Estimated completion:{" "}
                          {bid.submissions?.find((s) => s.garage_id === "Garage-001")?.estimated_completion_time}{" "}
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
            {completedBids?.length > 0 ? (
              completedBids?.map((bid) => (
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
                          Completed on {new Date(bid.completed_at!).toLocaleDateString()}
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                          <div className="text-xs text-muted-foreground">{bid.vehicle_info.license_plate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Final amount:{" "}
                          {bid.submissions?.find((s) => s.garage_id === "Garage-001")?.proposed_cost.toLocaleString()} RWF
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          Duration:{" "}
                          {new Date(bid.completed_at!).getTime() - new Date(bid.updated_at).getTime() > 0
                            ? Math.ceil(
                              (new Date(bid.completed_at!).getTime() - new Date(bid.updated_at).getTime()) /
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
