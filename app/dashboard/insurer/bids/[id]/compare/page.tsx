"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, CheckCircle2, FileText } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
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


const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";
// Mock bid data
const mockBid: Bid = {
  id: "BID-2023-002",
  claim_id: "CL-2023-002",
  vehicle_info: {
    make: "Honda",
    model: "Civic",
    year: "2019",
    license_plate: "RAB 456B",
    vin: "2FMDK48C13BA54321",
  },
  damage_description: "Side panel dents and scratches from parking incident",
  scope_of_work: ["Repair side panel dents", "Repaint affected areas"],
  estimated_cost: 280000,
  photos: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
  documents: ["/damage-report.pdf"],
  status: "in-progress",
  created_at: "2023-11-28T14:15:00Z",
  updated_at: "2023-12-01T09:45:00Z",
  created_by: "Jane Smith",
  interested_garages: ["Garage-001", "Garage-003", "Garage-004"],
  submissions: [
    {
      id: "SUB-001",
      bid_id: "BID-2023-002",
      garage_id: "Garage-001",
      garage: { name: "Kigali Auto Services" },
      cost_breakdown: [
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
      proposed_cost: 300000,
      estimated_completion_time: '5days',
      notes: "We can start work immediately upon approval",
      created_at: "2023-12-01T09:45:00Z",
      status: "pending",
    },
    {
      id: "SUB-002",
      bid_id: "BID-2023-002",
      garage_id: "Garage-003",
      garage: { name: "Glass Experts" },
      cost_breakdown: [
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
      proposed_cost: 310000,
      estimated_completion_time: '7days',
      notes: "We can start work next week",
      created_at: "2023-12-02T14:30:00Z",
      status: "pending",
    },
  ],
  activities: [],
  code: "KLM-0011-shhs",
  claim: undefined
}
interface Props {
  params: Promise<{ id: string }>;
}
export default function CompareBidsPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter()
  const { user, apiRequest } = useAuth()
  const { toast } = useToast()
  const [awardDialogOpen, setAwardDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<BidSubmission | null>(null)
  const [bid, setBid] = useState<Bid>()
  const [isLoading, setIsLoading] = useState(true)
  // Fetch bid data
  useEffect(() => {
    const fetchBidData = async () => {
      setIsLoading(true)
      try {
        const response = await apiRequest(`${API_URL}bids/${id}/${user.tenant_id}`, "GET");
        setBid(response)
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

    if (id) {
      fetchBidData()
    }
  }, [id, toast])
  // Handle awarding bid
  const handleAwardBid = (submission: BidSubmission) => {
    setSelectedSubmission(submission)
    setAwardDialogOpen(true)
  }

  // Confirm award
  const confirmAward = () => {
    if (!selectedSubmission) return

    // In a real app, you would call an API to award the bid
    toast({
      title: "Bid Awarded",
      description: `The bid has been awarded to ${selectedSubmission.garage.name}.`,
    })

    setAwardDialogOpen(false)

    // Redirect to the bids page
    router.push(`/dashboard/insurer/bids/${id}`)
  }
  if (!bid) {
    return (
      <DashboardLayout
        user={{
          name: user.name,
          role: "Insurance Company",
          avatar: "/placeholder.svg?height=40&width=40",
        }}
        navigation={[
          { name: "Dashboard", href: "/dashboard/insurer", icon: null },
          { name: "Claims", href: "/dashboard/insurer/claims", icon: null },
          { name: "Bids", href: "/dashboard/insurer/bids", icon: null },
          { name: "Documents", href: "/dashboard/insurer/documents", icon: null },
        ]}
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
        name: user?.name,
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: null },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: null },
        { name: "Bids", href: "/dashboard/insurer/bids", icon: null },
        { name: "Documents", href: "/dashboard/insurer/documents", icon: null },
      ]}
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
              <BreadcrumbLink href={`/dashboard/insurer/bids/${id}`}>Bid #{bid.code}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Compare Bids</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Compare Bids</h1>
            <p className="text-muted-foreground">Compare submissions for Bid #{bid.code}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/insurer/bids/${id}`}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Bid Details
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bid Submissions Comparison</CardTitle>
            <CardDescription>Compare submissions from {bid.submissions?.length} garages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Comparison Criteria</TableHead>
                    {bid.submissions?.map((submission) => (
                      <TableHead key={submission.id}>{submission.garage.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Cost</TableCell>
                    {bid.submissions?.map((submission) => (
                      <TableCell key={submission.id} className="font-bold">
                        {submission.proposed_cost.toLocaleString()} RWF
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Completion Time</TableCell>
                    {bid.submissions?.map((submission) => (
                      <TableCell key={submission.id}>
                        {submission.estimated_completion_time}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Submitted On</TableCell>
                    {bid.submissions?.map((submission) => (
                      <TableCell key={submission.id}>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Notes</TableCell>
                    {bid.submissions?.map((submission) => (
                      <TableCell key={submission.id}>{submission.notes}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Actions</TableCell>
                    {bid.submissions?.map((submission) => (
                      <TableCell key={submission.id}>
                        <Button
                          onClick={() => handleAwardBid(submission)}
                          disabled={bid.status === "awarded" || bid.status === "completed"}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Award Bid
                        </Button>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Item</TableHead>
                    {bid.submissions?.map((submission) => (
                      <TableHead key={submission.id}>{submission.garage.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Dynamically create rows for each unique item across all submissions */}
                  {Array.from(
                    new Set(bid.submissions?.flatMap((submission) => submission.cost_breakdown.map((item) => item.item))),
                  ).map((item) => (
                    <TableRow key={item}>
                      <TableCell className="font-medium">{item}</TableCell>
                      {bid.submissions?.map((submission) => {
                        const costItem = submission.cost_breakdown.find((i) => i.item === item)
                        return (
                          <TableCell key={submission.id}>
                            {costItem ? (
                              <div>
                                <div>{costItem.cost.toLocaleString()} RWF</div>
                                <div className="text-xs text-muted-foreground">{costItem.description}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total</TableCell>
                    {bid.submissions?.map((submission) => (
                      <TableCell key={submission.id} className="font-bold">
                        {submission.proposed_cost.toLocaleString()} RWF
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Award Bid Dialog */}
      <Dialog open={awardDialogOpen} onOpenChange={setAwardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Bid</DialogTitle>
            <DialogDescription>
              Are you sure you want to award this bid to {selectedSubmission?.garage.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Garage</div>
                <div className="font-bold">{selectedSubmission?.garage.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Total Cost</div>
                <div className="font-bold">{selectedSubmission?.proposed_cost.toLocaleString()} RWF</div>
              </div>
              <div>
                <div className="text-sm font-medium">Estimated Completion Time</div>
                <div>
                  {selectedSubmission?.estimated_completion_time}
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
