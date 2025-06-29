"use client"

import { useState, useEffect, use } from "react"
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
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";

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
const assignFormDataSchama = z.object({
  department_id: z.string().min(1, { message: "Department is required" }), // Changed from 2
  assessor_id: z.string().min(1, { message: "Agent/Assessor is required" }), // Changed from 16
  notes: z.string().optional(),
});

interface Props {
  params: Promise<{ id: string }>;
}
export default function BidDetailsPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter()
  const { user, apiRequest } = useAuth()
  const { toast } = useToast()
  const [awardDialogOpen, setAwardDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<BidSubmission | null>(null)
  const [bid, setBid] = useState<Bid | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  // Fetch bid data
  useEffect(() => {
    const fetchBidData = async () => {
      setIsLoading(true)
      try {
        const response = await apiRequest(`${API_URL}bids/${id}/${user.tenant_id}`, "GET");

        const interestedGarages = Array.from(
          new Set(response.submissions?.map((sub: { garage_id: string }) => sub.garage_id) || [])
        );
        const activities = await apiRequest(`${API_URL}bid-activities-by-tenant/${id}/${user.tenant_id}`, "GET");
        const bidWithInterests = {
          ...response,
          interested_garages: interestedGarages,
          activities: activities
        };

        setBid(bidWithInterests);
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
    setSelectedSubmission(submission);
    setAwardDialogOpen(true);
  };
  // Handle awarding bid
  const handleAssignAssessor = (submission: BidSubmission) => {
    setSelectedSubmission(submission);
    setIsAssignDialogOpen(true);
  };

  // Confirm award
  const confirmAward = async () => {
    if (!selectedSubmission || !bid || !user?.id || !user?.tenant_id) return;

    try {
      const payload = {
        submission_id: selectedSubmission.id,
        tenant_id: user.tenant_id,
        user_id: user.id,
      };

      const response = await apiRequest(`${API_URL}bids/${bid.id}/award`, "POST", payload);

      // Update local state
      setBid(response.bid);

      toast({
        title: "Bid Awarded",
        description: `The bid has been awarded to ${selectedSubmission.garage.name}.`,
      });

      setAwardDialogOpen(false);
      setSelectedSubmission(null);
    } catch (error: any) {
      console.error("Error awarding bid:", error);
      toast({
        title: "Error Awarding Bid",
        description: error.response?.data?.message || "There was an error awarding the bid. Please try again.",
        variant: "destructive",
      });
    }
  }
  const handleViewGarage = (garageId: string, garageName: string) => {
    router.push(`/dashboard/insurer/garages/${garageId}`);
    toast({
      title: "View Garage Profile",
      description: `Viewing profile for ${garageName}`,
    });
  };

  const assignForm = useForm<z.infer<typeof assignFormDataSchama>>({
    resolver: zodResolver(assignFormDataSchama),
    defaultValues: {
      department_id: user.tenant.departments?.[0]?.id?.toString() || '',
      assessor_id: user?.tenant?.users?.[0]?.id?.toString() || '',
      notes: ''
    },
  });

  const onSubmitAssignClaim = async (values: z.infer<typeof assignFormDataSchama>) => {
    try {
      const newAssignment = await apiRequest(`${API_URL}claims/assign/${bid?.claim_id}`, "POST", {
        department_id: values.department_id,
        assessor_id: values.assessor_id,
        tenant_id: user?.tenant_id,
        user_id: user?.id,
        claim_id: bid?.claim_id,
        notes: values.notes
      });

      const updatedClaim = {
        ...bid?.claim,
        department_id: values.department_id,
        assignment: newAssignment
      }
      setSelectedClaim(updatedClaim)
      setIsAssignDialogOpen(false)
      toast({
        title: "Assigned successfully",
        description: `Successfully been assigned agent & department to claim ${bid?.claim.code}.`,
      });

      assignForm.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to assign department & user to claim.",
      });
    }
  };
  if (isLoading) {
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
              <BreadcrumbLink>Bid #{bid.code}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Bid #{bid.code}</h1>
              <Badge variant={getStatusBadge(bid.status).variant} className="capitalize">
                {getStatusBadge(bid.status).icon}
                {bid.status.replace("-", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created on {new Date(bid.created_at).toLocaleDateString()} by {bid.user.info}
            </p>
          </div>
          <div className="flex gap-2">
            {bid.submissions?.length > 0 && (
              <Button asChild>
                <Link href={`/dashboard/insurer/bids/${bid.id}/compare`}>Compare Bids ({bid.submissions?.length})</Link>
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
                          {bid.vehicle_info.make} {bid.vehicle_info.model} ({bid.vehicle_info.year})
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Plate</div>
                      <div className="text-sm">{bid.vehicle_info.license_plate}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Damage Description</h3>
                  <p>{bid.damage_description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Scope of Work</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {bid.scope_of_work.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Cost Estimate</h3>
                  <div className="text-2xl font-bold">{bid.estimated_cost.toLocaleString()} RWF</div>
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
                      {bid.photos?.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={STORAGES_URL + photo.file_path || "/placeholder.svg"}
                            alt={`Damage photo ${index + 1}`}
                            className="w-full h-40 object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
                            <Button size="sm" variant="secondary" onClick={() => window.open(STORAGES_URL + photo.file_path, '_blank')}>
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => window.open(STORAGES_URL + photo.file_path, '_blank')}>
                              <Download className="h-4 w-4 mr-1" /> Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="documents" className="mt-4">
                    <div className="space-y-2">
                      {bid.documents?.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span>Document {index + 1}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => window.open(STORAGES_URL + doc.file_path, '_blank')}>
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              const link = document.createElement('a');
                              link.href = STORAGES_URL + doc.file_path;
                              link.download = doc.file_path.substring(doc.file_path.indexOf('/')) || 'download';
                              document.body.appendChild(link);
                              link.target = '_blank';
                              link.click();
                              document.body.removeChild(link);
                            }}>
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
                <CardDescription>Submissions from interested garages ({bid.submissions?.length})</CardDescription>
              </CardHeader>
              <CardContent>
                {bid.submissions?.length > 0 ? (
                  <div className="space-y-4">
                    {bid.submissions?.map((submission) => (
                      <Card key={submission.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{submission.garage.name}</CardTitle>
                            <Badge variant={submission.status === "accepted" ? "success" : "outline"}>
                              {submission.status === "accepted" ? "Accepted" : "Pending"}
                            </Badge>
                          </div>
                          <CardDescription>
                            Submitted on {new Date(submission.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm font-medium">Total Cost</div>
                              <div className="text-xl font-bold">{submission.proposed_cost.toLocaleString()} RWF</div>
                              <div className="text-sm text-muted-foreground">
                                {submission.estimated_completion_time} to
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
                                {submission.cost_breakdown.map((item, index) => (
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
                                    {submission.proposed_cost.toLocaleString()}
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
                              toast({
                                title: "View Garage Profile",
                                description: `Viewing profile for ${submission.garage.name}`,
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
                                description: `Messaging ${submission.garage.name}`,
                              })
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" /> Message
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => { handleAssignAssessor(submission) }}
                            disabled={
                              bid.status === "awarded" || bid.status === "completed" || bid.status === "cancelled"
                            }
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Assign Assessor
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
                <CardDescription>{bid.interested_garages?.length || 0} garage(s) interested</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bid.interested_garages?.length > 0 ? (
                    bid.interested_garages.map((garage_id) => {
                      const submission = bid.submissions?.find((s) => s.garage_id === garage_id);
                      const garage = submission?.garage;
                      return (
                        <div key={garage_id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarFallback>
                                {garage?.name ? garage.name.slice(0, 2).toUpperCase() : "GA"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{garage?.name || "Unknown Garage"}</div>
                              <div className="text-sm text-muted-foreground">
                                {submission ? "Submitted bid" : "Expressed interest"}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewGarage(garage_id, garage?.name || "Unknown Garage")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })
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
                    {bid.activities?.map((activity) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="mt-1">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{activity.user?.info.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="space-y-1">

                          <p className="text-sm">{activity.event}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                          <p className="text-sm">
                            By: <span className="font-medium">{activity.user?.info}</span>{" "}
                            {/* <span className="text-muted-foreground">({activity.user?.role})</span> */}
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
      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Claim</DialogTitle>
            <DialogDescription>Assign this claim to a department and responsible person.</DialogDescription>
          </DialogHeader>
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit(onSubmitAssignClaim)} className="space-y-4 py-4">
              <div className="space-y-4 py-4">
                <FormField
                  control={assignForm.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel htmlFor="department_id">Department</FormLabel>
                        <Select
                          name="department_id"
                          defaultValue={user.tenant.departments?.[0]?.id?.toString()}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assigned department" />
                          </SelectTrigger>
                          <SelectContent>
                            {user.tenant.departments?.map((department) => (
                              <SelectItem key={department.id} value={department.id.toString()}>
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={assignForm.control}
                  name="assessor_id"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel htmlFor="assessor_id">Responsible Person</FormLabel>
                        <Select
                          name="assessor_id"
                          defaultValue={user?.tenant?.users?.[0]?.id?.toString()}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assigned person" />
                          </SelectTrigger>
                          <SelectContent>
                            {user?.tenant?.users?.map((uza) => (
                              <SelectItem key={uza.id} value={uza.id.toString()}>
                                {uza.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={assignForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel htmlFor="notes">Any Note?</FormLabel>
                        <Textarea
                          {...field}
                          rows={2}
                          placeholder="Optional notes..."
                        />
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Assign</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
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
