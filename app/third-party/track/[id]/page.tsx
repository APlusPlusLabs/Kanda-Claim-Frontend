"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  FileImage,
  FileIcon as FilePdf,
  Upload,
  File,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-provider"
import { format } from "date-fns"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/claims/photos/";

export default function ThirdPartyTrackPage() {
  const router = useRouter()
  const { apiRequest } = useAuth()
  const params = useParams()
  const { toast } = useToast()
  const [claim, setClaim] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [uploadType, setUploadType] = useState("")
  const [uploadDescription, setUploadDescription] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const searchParams = new URLSearchParams(window.location.search)
  const refNumber = searchParams.get("ref")

  useEffect(() => {
    const fetchClaim = async () => {
      setLoading(true);
      try {
        const response = await apiRequest(`${API_URL}third-party-claims/${params.id}`);
        setClaim(response);
      } catch (error) {
        console.error("Error fetching claim:", error);
        toast({
          title: "Error",
          description: "Failed to load claim details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [params.id]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
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
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setSelectedFiles(Array.from(files))
  }

  const handleUploadSubmit = () => {
    // In a real app, we would upload the files to an API
    // For now, we'll just show a success message
    toast({
      title: "Files Uploaded",
      description: "Your files have been uploaded successfully.",
    })
    setIsUploadDialogOpen(false)
    setSelectedFiles([])
    setUploadType("")
    setUploadDescription("")
  }

  const handleMessageSubmit = () => {
    if (!newMessage.trim()) return

    // In a real app, we would send the message to an API
    // For now, we'll just update the local state
    const updatedClaim = {
      ...claim,
      messages: [
        ...claim.messages,
        {
          date: new Date().toISOString().split("T")[0],
          from: "You",
          content: newMessage,
        },
      ],
    }

    setClaim(updatedClaim)
    setNewMessage("")
    setIsMessageDialogOpen(false)

    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading claim data...</p>
        </div>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <Button variant="ghost" onClick={() => router.push("/third-party")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Third-Party Portal
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Claim Not Found</CardTitle>
            <CardDescription className="text-center">
              We couldn't find a claim with the tracking ID: {params.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <p className="text-center mb-4">
              Please check the tracking ID and try again. If you continue to experience issues, please contact our
              support team.
            </p>
            <Button onClick={() => router.push("/third-party")}>Return to Third-Party Portal</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => router.push("/third-party")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Third-Party Portal
      </Button>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tracking Claim #{claim.tracking_id}</h1>
            <p className="text-muted-foreground">
              Submitted on {claim.submittedDate} • Last updated: {claim.lastUpdated}
            </p>
          </div>
          <div className="mt-4 md:mt-0">{getStatusBadge(claim.status)}</div>
        </div>
      </div>

      <div className="space-y-2 mb-8">
        <div className="flex justify-between text-sm">
          <span>Claim Progress</span>
          <span>{claim.progress}%</span>
        </div>
        <Progress value={claim.progress} className="h-2" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Upload Documents
        </Button>
        <Button variant="outline" onClick={() => setIsMessageDialogOpen(true)}>
          <Clock className="mr-2 h-4 w-4" /> Send Message
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Claim Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Claim Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tracking ID:</span>
                      <span>{claim.tracking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference Number:</span>
                      <span>{claim.code}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Claimant Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{claim.claimant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{claim.claimant.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{claim.claimant.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Policyholder Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span>
                        {claim.policyholder.vehicleMake} {claim.policyholder.vehicleModel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plate Number:</span>
                      <span>{claim.policyholder.vehiclePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Insurance Company:</span>
                      <span>{claim.policyholder.insuranceCompany}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{format(new Date(claim.incident.date), "yyyy-MM-dd")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{claim.incident.location}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm">{claim.incident.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Damages</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{claim.damages.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Amount:</span>
                      <span>{claim.damages.estimatedAmount} RWF</span>
                    </div>
                    <p>{claim.damages.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {claim.pendingRequests && claim.pendingRequests.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  The following information or documents have been requested by the claims department.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claim.pendingRequests.map((request: any) => (
                    <div key={request.id} className="flex items-start p-4 border rounded-md">
                      <div className="mr-4">
                        {request.status === "Pending" ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h3 className="font-medium">{request.type}</h3>
                          <div className="flex items-center mt-1 md:mt-0">
                            <span className="text-xs text-muted-foreground mr-2">Requested on {request.date}</span>
                            <Badge variant={request.status === "Pending" ? "outline" : "secondary"}>
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm">{request.description}</p>
                        {request.status === "Pending" && (
                          <Button size="sm" className="mt-2" onClick={() => setIsUploadDialogOpen(true)}>
                            <Upload className="mr-2 h-3 w-3" /> Upload Files
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Claim Timeline</CardTitle>
              <CardDescription>Track the progress of your claim through each stage of the process.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {claim.timeline.map((item: any, index: number) => (
                  <div key={index} className="flex">
                    <div className="mr-4">{getTimelineStatusIcon(item.status)}</div>
                    <div className="flex-1 pb-6 border-l pl-4 border-dashed">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <h3 className="font-medium">{item.event}</h3>
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>View and download documents related to your claim.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" /> Upload New Document
                  </Button>
                </div>

                <div className="border rounded-md divide-y">
                  {claim.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div className="flex flex-col items-center">
                        {/* {getDocumentIcon(doc.type)} */}
                        <img src={STORAGES_URL + doc.name} alt={doc.type} />
                        <span className="ml-2">{doc.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-4">Uploaded on {doc.uploadedAt}</span>
                        <Button variant="ghost" size="icon" onClick={() => window.location.assign(STORAGES_URL + doc.name)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => window.location.assign(STORAGES_URL + doc.name)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Communication history related to your claim.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setIsMessageDialogOpen(true)}>Send New Message</Button>
                </div>

                <div className="space-y-4">
                  {claim.messages.map((message: any, index: number) => (
                    <div
                      key={index}
                      className={`p-4 rounded-md ${message.from === "You"
                        ? "bg-primary/10 ml-8"
                        : message.isRequest
                          ? "bg-yellow-50 border-yellow-200 border"
                          : "bg-muted mr-8"
                        }`}
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{message.from}</span>
                        <span className="text-xs text-muted-foreground">{message.date}</span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.isRequest && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => setIsUploadDialogOpen(true)}
                        >
                          <Upload className="mr-2 h-3 w-3" /> Respond with Documents
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>Upload additional documents or photos related to your claim.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="upload-type">Document Type</Label>
              <select
                id="upload-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
              >
                <option value="">Select document type</option>
                <option value="Damage Photos">Damage Photos</option>
                <option value="Police Report">Police Report</option>
                <option value="Medical Report">Medical Report</option>
                <option value="Repair Estimate">Repair Estimate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-description">Description</Label>
              <Textarea
                id="upload-description"
                placeholder="Provide a brief description of the documents"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Files</Label>
              <Input id="file-upload" type="file" multiple onChange={handleFileChange} />
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Selected files:</p>
                  <ul className="text-sm space-y-1">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex items-center">
                        <File className="h-4 w-4 mr-2" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadSubmit} disabled={!uploadType || selectedFiles.length === 0}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>Send a message to the claims department regarding your claim.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMessageSubmit} disabled={!newMessage.trim()}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
