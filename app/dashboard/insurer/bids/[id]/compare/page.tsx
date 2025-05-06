"use client"

import { useState } from "react"
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
import { ChevronLeft, CheckCircle2 } from "lucide-react"
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

// Mock bid data
const mockBid: Bid = {
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
  photos: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
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
    {
      id: "SUB-002",
      bidId: "BID-2023-002",
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
  activities: [],
}

export default function CompareBidsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [awardDialogOpen, setAwardDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<BidSubmission | null>(null)

  // In a real app, you would fetch the bid data from the API
  const bid = mockBid

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
      description: `The bid has been awarded to ${selectedSubmission.garageName}.`,
    })

    setAwardDialogOpen(false)

    // Redirect to the bids page
    router.push(`/dashboard/insurer/bids/${params.id}`)
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
              <BreadcrumbLink href={`/dashboard/insurer/bids/${params.id}`}>Bid #{params.id}</BreadcrumbLink>
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
            <p className="text-muted-foreground">Compare submissions for Bid #{bid.id}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/insurer/bids/${params.id}`}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Bid Details
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bid Submissions Comparison</CardTitle>
            <CardDescription>Compare submissions from {bid.submissions.length} garages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Comparison Criteria</TableHead>
                    {bid.submissions.map((submission) => (
                      <TableHead key={submission.id}>{submission.garageName}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Cost</TableCell>
                    {bid.submissions.map((submission) => (
                      <TableCell key={submission.id} className="font-bold">
                        {submission.totalCost.toLocaleString()} RWF
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Completion Time</TableCell>
                    {bid.submissions.map((submission) => (
                      <TableCell key={submission.id}>
                        {submission.estimatedCompletionTime.value} {submission.estimatedCompletionTime.unit}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Submitted On</TableCell>
                    {bid.submissions.map((submission) => (
                      <TableCell key={submission.id}>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Notes</TableCell>
                    {bid.submissions.map((submission) => (
                      <TableCell key={submission.id}>{submission.notes}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Actions</TableCell>
                    {bid.submissions.map((submission) => (
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
                    {bid.submissions.map((submission) => (
                      <TableHead key={submission.id}>{submission.garageName}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Dynamically create rows for each unique item across all submissions */}
                  {Array.from(
                    new Set(bid.submissions.flatMap((submission) => submission.costBreakdown.map((item) => item.item))),
                  ).map((item) => (
                    <TableRow key={item}>
                      <TableCell className="font-medium">{item}</TableCell>
                      {bid.submissions.map((submission) => {
                        const costItem = submission.costBreakdown.find((i) => i.item === item)
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
                    {bid.submissions.map((submission) => (
                      <TableCell key={submission.id} className="font-bold">
                        {submission.totalCost.toLocaleString()} RWF
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
