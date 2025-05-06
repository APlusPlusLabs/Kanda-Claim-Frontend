"use client"

import { useState } from "react"
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
import { useAuth } from "@/lib/auth-hooks"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"

export default function ClaimDetailsPage({ params }) {
  const router = useRouter()
  const { user } = useAuth()
  const { id } = params

  const [activeTab, setActiveTab] = useState("details")
  const [selectedImage, setSelectedImage] = useState(null)

  // In a real app, you would fetch this data from an API based on the ID
  const [claim] = useState({
    id: "CL-2025-001",
    vehicle: "Toyota RAV4",
    plateNumber: "RAA 123A",
    date: "2025-03-15",
    status: "In Progress",
    progress: 45,
    insurer: "Sanlam Alianz",
    amount: 450000,
    description: "Front bumper damage due to collision with another vehicle at Kimironko junction.",
    documents: [
      { name: "Accident_Scene_1.jpg", type: "image", uploadedAt: "2025-03-15" },
      { name: "Accident_Scene_2.jpg", type: "image", uploadedAt: "2025-03-15" },
      { name: "Police_Report.pdf", type: "pdf", uploadedAt: "2025-03-16" },
      { name: "Damage_Photos_1.jpg", type: "image", uploadedAt: "2025-03-15" },
      { name: "Damage_Photos_2.jpg", type: "image", uploadedAt: "2025-03-15" },
    ],
    timeline: [
      { date: "2025-03-15", event: "Claim submitted", status: "complete" },
      { date: "2025-03-16", event: "Claim received by Sanlam Alianz", status: "complete" },
      { date: "2025-03-18", event: "Assessment scheduled", status: "complete" },
      { date: "2025-03-20", event: "Assessment completed", status: "complete" },
      { date: "2025-03-22", event: "Repair approval", status: "in-progress" },
      { date: "2025-03-25", event: "Repairs begin", status: "pending" },
      { date: "2025-03-30", event: "Repairs complete", status: "pending" },
      { date: "2025-04-05", event: "Claim closed", status: "pending" },
    ],
    messages: [
      {
        date: "2025-03-16 09:35",
        sender: "Marie Uwase (Claims Agent)",
        content: "Your claim has been received. We will review it and get back to you soon.",
      },
      {
        date: "2025-03-18 14:20",
        sender: "Marie Uwase (Claims Agent)",
        content:
          "We have scheduled an assessment for your vehicle on March 20, 2025 at 10:00 AM at Kigali Auto Services.",
      },
      {
        date: "2025-03-20 15:45",
        sender: "Habimana Jean (Assessor)",
        content:
          "I have completed the assessment of your vehicle. The report has been submitted to the claims department for review.",
      },
    ],
    contactInfo: {
      claimsAgent: {
        name: "Marie Uwase",
        phone: "+250 788 234 567",
        email: "marie.uwase@sanlamalianz.rw",
      },
      assessor: {
        name: "Habimana Jean",
        phone: "+250 788 345 678",
        email: "habimana.jean@sanlamalianz.rw",
      },
      garage: {
        name: "Kigali Auto Services",
        address: "KK 123 St, Kigali",
        phone: "+250 788 987 654",
      },
    },
  })

  const getStatusBadge = (status) => {
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

  const getTimelineStatusIcon = (status) => {
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

  const getDocumentIcon = (type) => {
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
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Mugisha Nkusi",
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
            <h1 className="text-3xl font-bold">Claim #{claim.id}</h1>
            {getStatusBadge(claim.status)}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/driver/messages")}>
              <MessageSquareText className="mr-2 h-4 w-4" /> Contact Insurer
            </Button>
            {claim.status !== "Completed" && claim.status !== "Rejected" && (
              <Button>
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
                  {claim.vehicle} ({claim.plateNumber})
                </h2>
                <p className="text-sm text-muted-foreground">Submitted on {claim.date}</p>
              </div>
              <div className="mt-2 md:mt-0 flex flex-col items-end">
                <div className="text-sm">
                  <span className="text-muted-foreground">Insurer:</span> {claim.insurer}
                </div>
                <div className="text-sm mt-1">
                  <span className="text-muted-foreground">
                    {claim.status === "Completed" ? "Final Amount:" : "Estimated Amount:"}
                  </span>{" "}
                  {claim.amount.toLocaleString()} RWF
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
                <TabsTrigger value="documents">Documents ({claim.documents.length})</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="messages">Messages ({claim.messages.length})</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Claim Information</h3>
                      <div className="bg-muted p-3 rounded-md space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Claim ID:</div>
                          <div>{claim.id}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Status:</div>
                          <div>{claim.status}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Submission Date:</div>
                          <div>{claim.date}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Insurer:</div>
                          <div>{claim.insurer}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Estimated Amount:</div>
                          <div>{claim.amount.toLocaleString()} RWF</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Vehicle Information</h3>
                      <div className="bg-muted p-3 rounded-md space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Vehicle:</div>
                          <div>{claim.vehicle}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Plate Number:</div>
                          <div>{claim.plateNumber}</div>
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {claim.documents.map((doc, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                          {doc.type === "image" ? (
                            <div
                              className="cursor-pointer"
                              onClick={() =>
                                setSelectedImage(
                                  `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(doc.name)}`,
                                )
                              }
                            >
                              <AspectRatio ratio={4 / 3} className="bg-muted">
                                <img
                                  src={`/placeholder.svg?height=300&width=400&text=${encodeURIComponent(doc.name)}`}
                                  alt={doc.name}
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
                                {getDocumentIcon(doc.type)}
                                <span className="ml-2 text-sm font-medium truncate max-w-[150px]">{doc.name}</span>
                              </div>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Uploaded: {doc.uploadedAt}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> Upload Additional Documents
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <div className="space-y-4">
                  {claim.timeline.map((item, index) => (
                    <div key={index} className="flex">
                      <div className="mr-3">{getTimelineStatusIcon(item.status)}</div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-medium">{item.event}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Claims Agent</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Name:</span> {claim.contactInfo.claimsAgent.name}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Phone:</span> {claim.contactInfo.claimsAgent.phone}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Email:</span> {claim.contactInfo.claimsAgent.email}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Assessor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Name:</span> {claim.contactInfo.assessor.name}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Phone:</span> {claim.contactInfo.assessor.phone}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Email:</span> {claim.contactInfo.assessor.email}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Garage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Name:</span> {claim.contactInfo.garage.name}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Address:</span> {claim.contactInfo.garage.address}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Phone:</span> {claim.contactInfo.garage.phone}
                        </div>
                      </div>
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
  )
}
