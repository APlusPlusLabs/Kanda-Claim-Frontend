"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ChevronLeft,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Building,
  Eye,
  Download,
  MessageSquare,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { Bid, BidSubmission } from "@/lib/types/bidding"

// Mock bid data - in a real app, this would be fetched from an API based on the ID
const mockBid: Bid = {
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
  photos: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
  documents: ["/damage-report.pdf"],
  status: "in-progress",
  createdAt: "2025-11-28T14:15:00Z",
  updatedAt: "2025-12-01T09:45:00Z",
  createdBy: "Jane Smith",
  interestedGarages: ["Garage-001", "Garage-003", "Garage-004"],
  submissions: [
    {
      id: "SUB-001",
      bidId: "BID-2025-002",
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
      submittedAt: "2025-12-01T09:45:00Z",
      status: "pending",
    },
    {
      id: "SUB-002",
      bidId: "BID-2025-002",
      garageId: "Garage-003",
      garageName: "Glass Experts",
      costBreakdown: [
        {
          item: "Side panel repair",
          cost: 130000,
          description: "Repair dents on driver side panel",
        },
        {
          item: "Painting",
          cost: 120000,
          description: "Paint matching and blending",
        },
        {
          item: "Labor",
          cost: 60000,
          description: "Labor costs",
        },
      ],
      totalCost: 310000,
      estimatedCompletionTime: {
        value: 7,
        unit: "days",
      },
      notes: "We can start work next week",
      submittedAt: "2023-12-02T14:30:00Z",
      status: "pending",
    },
  ],
  activities: [
    {
      id: "ACT-002",
      bidId: "BID-2025-002",
      activityType: "bid_created",
      description: "Bid was created",
      performedBy: {
        id: "USER-002",
        name: "Jane Smith",
        role: "Insurance Agent",
      },
      timestamp: "2025-11-28T14:15:00Z",
    },
    {
      id: "ACT-003",
      bidId: "BID-2025-002",
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
      bidId: "BID-2025-002",
      activityType: "bid_submitted",
      description: "Bid submission received",
      performedBy: {
        id: "GARAGE-001",
        name: "Kigali Auto Services",
        role: "Garage",
      },
      timestamp: "2023-12-01T09:45:00Z",
    },
    {
      id: "ACT-005",
      bidId: "BID-2025-002",
      activityType: "garage_interested",
      description: "Garage expressed interest",
      performedBy: {
        id: "GARAGE-003",
        name: "Glass Experts",
        role: "Garage",
      },
      timestamp: "2023-12-01T15:10:00Z",
    },
    {
      id: "ACT-006",
      bidId: "BID-2025-002",
      activityType: "bid_submitted",
      description: "Bid submission received",
      performedBy: {
        id: "GARAGE-003",
        name: "Glass Experts",
        role: "Garage",
      },
      timestamp: "2023-12-02T14:30:00Z",
    },
  ],
}

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

export default function BidDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [awardDialogOpen, setAwardDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<BidSubmission | null>(null)
  const [bid, setBid] = useState<Bid | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch bid data
  useEffect(() => {
    const fetchBidData = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call to fetch the bid by ID
        await new Promise((resolve) => setTimeout(resolve, 800))

        // For demo purposes, we're using the mock data
        // In a real app, you would fetch the specific bid by ID from your API
        setBid(mockBid)
      } catch (error) {
        console.error("Error fetching bid:", error)
        toast({
          title: "Error Loading Bid",
          description: "There was an error loading the bid details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchBidData()
    }
  }, [params.id, toast])

  // Handle awarding bid
  const handleAwardBid = (submission: BidSubmission) => {
    setSelectedSubmission(submission)
    setAwardDialogOpen(true)
  }

  // Confirm award
  const confirmAward = async () => {
    if (!selectedSubmission || !bid) return

    try {
      // In a real app, you would call an API to award the bid
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the bid status locally
      setBid({
        ...bid,
        status: "awarded",
        awardedTo: selectedSubmission.garageId,
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: `ACT-${Date.now()}`,
            bidId: bid.id,
            activityType: "bid_awarded",
            description: `Bid was awarded to ${selectedSubmission.garageName}`,
            performedBy: {
              id: user?.id || "USER-UNKNOWN",
              name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Unknown User",
              role: "Insurance Agent",
            },
            timestamp: new Date().toISOString(),
          },
          ...bid.activities,
        ],
      })

      toast({
        title: "Bid Awarded",
        description: `The bid has been awarded to ${selectedSubmission.garageName}.`,
      })

      setAwardDialogOpen(false)
    } catch (error) {
      console.error("Error awarding bid:", error)
      toast({
        title: "Error Awarding Bid",
        description: "There was an error awarding the bid. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout
        user={{
          name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Sanlam Alianz",
          role: "Insurance Company",
          avatar: "/placeholder.svg?height=40&width=40",
        }}
        navigation={[
          { name: "Dashboard", href: "/dashboard/insurer", icon: null },
          { name: "Claims", href: "/dashboard/insurer/claims", icon: null },
          { name: "Bids", href: "/dashboard/insurer/bids", icon: null },
          { name: "Documents", href: "/dashboard/insurer/documents", icon: null },
        ]}
        actions={[]}
      >
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!bid) {
    return (
      <DashboardLayout
        user={{
          name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Sanlam Alianz",
          role: "Insurance Company",
          avatar: "/placeholder.svg?height=40&width=40",
        }}
        navigation={[
          { name: "Dashboard", href: "/dashboard/insurer", icon: null },
          { name: "Claims", href: "/dashboard/insurer/claims", icon: null },
          { name: "Bids", href: "/dashboard/insurer/bids", icon: null },
          { name: "Documents", href: "/dashboard/insurer/documents", icon: null },
        ]}
        actions={[]}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Bid Not Found</h1>
            <Button variant="outline" asChild>
              <Link href="/dashboard/insurer/bids">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back to Bids
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Bid Not Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The bid you are looking for does not exist or has been removed.
                </p>
                <Button asChild>
                  <Link href="/dashboard/insurer/bids">View All Bids</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Sanlam Alianz",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: null },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: null },
        { name: "Bids", href: "/dashboard/insurer/bids", icon: null },
        { name: "Documents", href: "/dashboard/insurer/documents", icon: null },
      ]}
      actions={[]}
    >
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/insurer">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/insurer/bids">Bids</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Bid #{params.id}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Bid #{bid.id}</h1>
              <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                {getStatusBadge(bid.status).icon}
                {bid.status.replace("-", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created on {new Date(bid.createdAt).toLocaleDateString()} by {bid.createdBy}
            </p>
          </div>
          <div className="flex gap-2">
            {bid.submissions.length > 0 && (
              <Button asChild>
                <Link href={`/dashboard/insurer/bids/${bid.id}/compare`}>Compare Bids ({bid.submissions.length})</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/dashboard/insurer/bids">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back to Bids
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bid Details */}
            <Card>
              <CardHeader>
                <CardTitle>Bid Details</CardTitle>
                <CardDescription>Details of the repair bid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Vehicle Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {bid.vehicleInfo.make} {bid.vehicleInfo.model} ({bid.vehicleInfo.year})
                        </div>
                        <div className="text-sm text-muted-foreground">{bid.vehicleInfo.licensePlate}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">VIN</div>
                      <div className="text-sm">{bid.vehicleInfo.vin}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Damage Description</h3>
                  <p>{bid.damageDescription}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Scope of Work</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {bid.scopeOfWork.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Cost Estimate</h3>
                  <div className="text-2xl font-bold">{bid.estimatedCost.toLocaleString()} RWF</div>
                </div>
              </CardContent>
            </Card>

            {/* Photos and Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Photos and Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="photos">
                  <TabsList>
                    <TabsTrigger value="photos">Photos ({bid.photos.length})</TabsTrigger>
                    <TabsTrigger value="documents">Documents ({bid.documents.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="photos" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {bid.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Damage photo ${index + 1}`}
                            className="w-full h-40 object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
                            <Button size="sm" variant="secondary">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Download className="h-4 w-4 mr-1" /> Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="documents" className="mt-4">
                    <div className="space-y-2">
                      {bid.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span>Document {index + 1}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4 mr-1" /> Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Bid Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Bid Submissions</CardTitle>
                <CardDescription>Submissions from interested garages ({bid.submissions.length})</CardDescription>
              </CardHeader>
              <CardContent>
                {bid.submissions.length > 0 ? (
                  <div className="space-y-4">
                    {bid.submissions.map((submission) => (
                      <Card key={submission.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{submission.garageName}</CardTitle>
                            <Badge variant={submission.status === "accepted" ? "success" : "outline"}>
                              {submission.status === "accepted" ? "Accepted" : "Pending"}
                            </Badge>
                          </div>
                          <CardDescription>
                            Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm font-medium">Total Cost</div>
                              <div className="text-xl font-bold">{submission.totalCost.toLocaleString()} RWF</div>
                              <div className="text-sm text-muted-foreground">
                                {submission.estimatedCompletionTime.value} {submission.estimatedCompletionTime.unit} to
                                complete
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Notes</div>
                              <p className="text-sm">{submission.notes}</p>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2">Cost Breakdown</div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="text-right">Cost (RWF)</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {submission.costBreakdown.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{item.item}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{item.cost.toLocaleString()}</TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell colSpan={2} className="font-bold">
                                    Total
                                  </TableCell>
                                  <TableCell className="text-right font-bold">
                                    {submission.totalCost.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // In a real app, you would navigate to the garage profile
                              toast({
                                title: "View Garage Profile",
                                description: `Viewing profile for ${submission.garageName}`,
                              })
                            }}
                          >
                            <Building className="h-4 w-4 mr-1" /> View Garage
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // In a real app, you would open a message dialog
                              toast({
                                title: "Message Garage",
                                description: `Messaging ${submission.garageName}`,
                              })
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" /> Message
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAwardBid(submission)}
                            disabled={
                              bid.status === "awarded" || bid.status === "completed" || bid.status === "cancelled"
                            }
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Award Bid
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">There are no submissions for this bid yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Interested Garages */}
            <Card>
              <CardHeader>
                <CardTitle>Interested Garages</CardTitle>
                <CardDescription>{bid.interestedGarages.length} garage(s) interested</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bid.interestedGarages.length > 0 ? (
                    bid.interestedGarages.map((garageId, index) => (
                      <div key={garageId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarFallback>{index === 0 ? "KA" : index === 1 ? "GE" : "RM"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {index === 0 ? "Kigali Auto Services" : index === 1 ? "Glass Experts" : "Rwanda Motors"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {bid.submissions.some((s) => s.garageId === garageId)
                                ? "Submitted bid"
                                : "Expressed interest"}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No garages have expressed interest yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {bid.activities.map((activity) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="mt-1">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{activity.performedBy.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.performedBy.name}</span>{" "}
                            <span className="text-muted-foreground">({activity.performedBy.role})</span>
                          </p>
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Award Bid Dialog */}
      <Dialog open={awardDialogOpen} onOpenChange={setAwardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Bid</DialogTitle>
            <DialogDescription>
              Are you sure you want to award this bid to {selectedSubmission?.garageName}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Garage</div>
                <div className="font-bold">{selectedSubmission?.garageName}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Total Cost</div>
                <div className="font-bold">{selectedSubmission?.totalCost.toLocaleString()} RWF</div>
              </div>
              <div>
                <div className="text-sm font-medium">Estimated Completion Time</div>
                <div>
                  {selectedSubmission?.estimatedCompletionTime.value} {selectedSubmission?.estimatedCompletionTime.unit}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAwardDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAward}>Confirm Award</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
