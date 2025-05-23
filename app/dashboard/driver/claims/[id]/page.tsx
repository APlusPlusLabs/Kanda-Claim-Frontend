"use client"

import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Car,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  FileImage,
  FileIcon as FilePdf,
  ArrowLeft,
  MessageSquareText,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
// import { ErrorBoundary } from 'react-error-boundary';

// const ErrorFallback = ({ error }) => (
//   <div>
//     <h2>Something went wrong</h2>
//     <p>{error.message}</p>
//   </div>
// );
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";
type Vehicle = {
  id: string;
  tenant_id: string;
  user_id: string;
  license_plate: string;
  make: string;
  model: string;
  year: string;
  vin: string;
  created_at?: string;
  updated_at?: string;
}

interface DocCategory {
  id: string; name: string;
};

interface Document {
  id: string;
  file_name: string;
  mime_type: string;
  file_path: string;
  created_at: string;
  category: DocCategory;
}

interface Activity {
  id: string;
  event: string;
  status: string;
  created_at: string;
}
interface Message {
  id: string;
  sender: string;
  content: string;
  date: string;
}

interface Claim {
  id: string;
  tenant_id: string;
  user_id: string;
  claim_type_id: string;
  code: string;
  amount: number;
  approved_amount: string;
  currency: string;
  status: string;
  priority: string;
  policy_number: string;
  accident_date: string;
  accident_time: string;
  location: string;
  description: string;
  rejection_reason?: string;
  note?: string;
  driver_details?: any;
  vehicles: Vehicle[];
  police_assignment?: any[];
  injuries?: any[];
  damages?: any[];
  garages?: any[];
  documents: Document[];
  messages: Message[];
  assessments: any[];
  activities: Activity[];
  insurer: { name: string };
  progress: number;
  created_at?: string;
  updated_at?: string;
}
const defaultClaim: Claim = {
  id: "",
  tenant_id: "",
  user_id: "",
  claim_type_id: "",
  code: "",
  amount: 0,
  approved_amount: "0",
  currency: "RWF",
  status: "",
  priority: "",
  policy_number: "",
  accident_date: "",
  accident_time: "",
  location: "",
  description: "",
  vehicles: [],
  documents: [],
  messages: [],
  activities: [],
  insurer: { name: "" },
  progress: 0,
  assessments: []
};
interface Props {
  params: Promise<{ id: string }>;
}
export default function ClaimDetailsPage({ params }: Props) {
  const router = useRouter()
  const { id } = use(params);

  const { toast } = useToast();
  const { user, apiRequest } = useAuth();
  const [claim, setClaim] = useState<Claim>(defaultClaim);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details")
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // In a real app, you would fetch this data from an API based on the ID
  const fetchClaim = useCallback(async () => {

    try {
      setLoading(true);
      const response = await apiRequest(`${API_URL}claims/${id}`, "GET");
      setClaim(response.data || null);
    } catch (error: any) {
      if (Array.isArray(error.errors)) {
        error.errors.forEach((er: string) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: er,
          });
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch claim data",
        });
      }
      console.error("Error fetching claim:", error);
      setClaim(defaultClaim);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, id, toast]);

  useEffect(() => {
    if (user) {
      fetchClaim();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You have to sign in to use the driver panel",
      });
      router.push("/login");
    }
  }, [user, fetchClaim, router, toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-10 w-1/4 rounded"></div>
        <div className="animate-pulse bg-muted h-64 w-full rounded"></div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-muted-foreground">Failed to load claim data.</p>
        <Button onClick={() => router.push("/dashboard/driver/claims")} className="mt-4">
          Back to Claims
        </Button>
      </div>
    );
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

  const getDocumentIcon = (type: any) => {
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
    // <ErrorBoundary FallbackComponent={ErrorFallback}>
    <DashboardLayout
      user={{
        name: user?.name||'Driver name',
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
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Claim #{claim.code}</h1>
            {getStatusBadge(claim.status)}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/driver/messages")}>
              <MessageSquareText className="mr-2 h-4 w-4" /> Contact Insurer
            </Button>
            {claim.status !== "Completed" && claim.status !== "Rejected" && (
              <Button onClick={() => router.push(`/dashboard/driver/claims/edit/${claim.id}`)}>
                <FileText className="mr-2 h-4 w-4" /> Update Claim
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {claim?.vehicles?.[0]?.model} {claim?.vehicles?.[0]?.make} - {claim?.vehicles?.[0]?.year} ({claim?.vehicles?.[0]?.license_plate})
                </h2>
                <p className="text-sm text-muted-foreground">Incident Happened on {claim.accident_date.substring(0, 10) + ' at ' + claim.accident_time}</p>
                <p className="text-sm text-muted-foreground">Submitted on {claim.created_at?.substring(0, 10)}</p>
              </div>
              <div className="mt-2 md:mt-0 flex flex-col items-end">
                <div className="text-sm">
                  <span className="text-muted-foreground">Insurer:</span> {claim.insurer.name}
                </div>
                <div className="text-sm mt-1">
                  <span className="text-muted-foreground">
                    {claim.status === "Completed" ? "Final Amount:" : "Estimated Amount:"}
                  </span>{" "}
                  {claim.amount.toLocaleString()} {claim?.currency}
                </div>
              </div>
            </div>

            {claim.status !== "Completed" && claim.status !== "Rejected" && (
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Claim Progress</span>
                  <span>{claim.progress}%</span>
                </div>
                <Progress value={claim.progress} className="h-2" />
              </div>
            )}

            <p className="text-sm mb-6">{claim.description}</p>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Claim Details</TabsTrigger>
                <TabsTrigger value="documents">Documents ({claim.documents?.length})</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="messages">Messages ({claim.messages?.length})</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Claim Information</h3>
                      <div className="bg-muted p-3 rounded-md space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Claim Code/ID:</div>
                          <div>{claim.code}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Status:</div>
                          <div>{claim.status}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Submission Date:</div>
                          <div>{claim.created_at?.substring(0, 10)}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Insurer:</div>
                          <div>{claim.insurer.name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Estimated Amount:</div>
                          <div>{claim.amount.toLocaleString()} {claim.currency}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Vehicle Information</h3>
                      <div className="bg-muted p-3 rounded-md space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Vehicle:</div>
                          <div>{claim?.vehicles[0]?.make + ' ' + claim?.vehicles[0]?.model}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Vehicle Year:</div>
                          <div>{claim?.vehicles[0]?.year}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Plate Number:</div>
                          <div>{claim?.vehicles[0]?.license_plate}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Incident Description</h3>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">{claim.description}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="documents">
                {claim.documents?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {claim.documents.map((doc) => (
                        <Card key={doc.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            {doc.mime_type.startsWith('image/') ? (
                              <div
                                className="cursor-pointer"
                                onClick={() => {
                                  const imageUrl = `${STORAGES_URL + doc.file_path}` || `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(doc.file_name)}`;
                                  console.log("Setting image URL:", imageUrl);
                                  setSelectedImage(imageUrl);
                                }}
                              >

                                <AspectRatio ratio={4 / 3} className="bg-muted">
                                  <img
                                    src={`${STORAGES_URL + doc.file_path}`}
                                    alt={`Document: ${doc.category?.name} ${doc.mime_type}`}
                                    className="object-cover w-full h-full"
                                  />
                                </AspectRatio>
                              </div>
                            ) : (
                              <div className="h-[200px] flex items-center justify-center bg-muted">
                                <FilePdf className="h-16 w-16 text-red-500" />
                              </div>
                            )}
                            <div className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {getDocumentIcon(doc.mime_type)}
                                  <span className="ml-2 text-sm font-medium truncate max-w-[150px]">{doc.category?.name} {doc.mime_type}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => window.open(doc.file_path, "_blank")}
                                  aria-label={`Download ${doc.category?.name} ${doc.mime_type}`}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Uploaded: {format(new Date(doc.created_at), "yyyy-MM-dd")}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" /> Upload Additional Documents
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Documents</h3>
                    <p className="text-muted-foreground">No documents have been uploaded for this claim.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timeline">
                {claim.activities?.length > 0 ? (
                  <div className="space-y-4">
                    {claim.activities.map((item) => (
                      <div key={item.id} className="flex">
                        <div className="mr-3">{getTimelineStatusIcon(item.status)}</div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-medium">{item.event}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(item.created_at), "yyyy-MM-dd")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Timeline Events</h3>
                    <p className="text-muted-foreground">No activities have been recorded for this claim.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="messages">
                <div className="space-y-4">
                  {claim.messages.length > 0 ? (
                    claim.messages.map((message, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <div className="font-medium">{message.sender}</div>
                            <div className="text-xs text-muted-foreground">{message.date}</div>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquareText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Messages</h3>
                      <p className="text-muted-foreground">You haven't received any messages about this claim yet.</p>
                    </div>
                  )}
                  <Button onClick={() => router.push("/dashboard/driver/messages")} className="w-full">
                    <MessageSquareText className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="contact">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Claims Agent</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <span className="font-medium">Name:</span> {claimsAgent.name}
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Phone:</span> {claimsAgent.phone}
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Email:</span> {claimsAgent.email}
                                  </div>
                                </div>
                              </CardContent>
                            </Card> */}

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Assessor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {claim.assessments?.map((assement, i) => (
                          <div key={i} className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">Name:</span> {assement.assessor.first_name} {assement.assessor.last_name}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Phone:</span> {assement.assessor.phone}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Email:</span> {assement.assessor.email}
                            </div>
                          </div>))}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Garage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {claim.garages?.map((garage, i) => (
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Name:</span> {garage.name}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Address:</span> {garage.address}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Phone:</span> {garage.phone}
                          </div>
                        </div>))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          {selectedImage && (
            <div className="relative">
              <img src={selectedImage || "/placeholder.svg"} alt="Document preview" className="w-full h-auto" />
              <Button
                className="absolute top-2 right-2"
                variant="secondary"
                size="icon"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
    // </ErrorBoundary>
  )
}
