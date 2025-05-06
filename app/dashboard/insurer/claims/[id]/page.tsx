"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Building2,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  FileImage,
  FileIcon as FilePdf,
  Car,
  UserCog,
  Wrench,
  ClipboardCheck,
  Brain,
  ArrowLeft,
  Calendar,
  MessageSquareText,
  X,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { useToast } from "@/components/ui/use-toast"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ClaimDetailsPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { id } = params

  const [activeTab, setActiveTab] = useState("details")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)

  // In a real app, you would fetch this data from an API based on the ID
  const [claim, setClaim] = useState({
    id: "CL-2025-001",
    policyNumber: "POL-2024-12345",
    vehicle: {
      make: "Toyota",
      model: "RAV4",
      year: "2023",
      plateNumber: "RAA 123A",
      color: "Silver",
    },
    driver: {
      name: "Mugisha Nkusi",
      phone: "+250 788 123 456",
      licenseNumber: "DL-2024-45678",
      licenseCategory: "B",
    },
    accident: {
      date: "2025-01-15",
      time: "14:30",
      location: "Kimironko Junction, Kigali",
      description:
        "Front bumper damage due to collision with another vehicle at Kimironko junction. The other driver ran a red light.",
      policeReport: true,
      policeStation: "Kimironko Police Station",
      policeReportNumber: "PR-2025-0123",
    },
    otherVehicles: [
      {
        make: "Honda",
        model: "Civic",
        plateNumber: "RAB 456B",
        owner: "Kamanzi Eric",
        insurer: "Sanlam Alianz",
        policyNumber: "POL-2024-67890",
      },
    ],
    injuries: [
      {
        name: "Uwase Marie",
        age: 28,
        description: "Minor cuts and bruises on arms",
        severity: "Minor",
      },
    ],
    damages: [
      {
        type: "Vehicle",
        description: "Front bumper damaged, headlight broken",
        estimatedCost: 350000,
      },
      {
        type: "Property",
        description: "Street sign knocked down",
        estimatedCost: 100000,
      },
    ],
    garage: {
      name: "Kigali Auto Services",
      address: "KK 123 St, Kigali",
      phone: "+250 788 987 654",
    },
    documents: [
      { name: "Accident_Scene_1.jpg", type: "image", uploadedAt: "2025-01-15" },
      { name: "Accident_Scene_2.jpg", type: "image", uploadedAt: "2025-01-15" },
      { name: "Police_Report.pdf", type: "pdf", uploadedAt: "2025-01-16" },
      { name: "Damage_Photos_1.jpg", type: "image", uploadedAt: "2025-01-15" },
      { name: "Damage_Photos_2.jpg", type: "image", uploadedAt: "2025-01-15" },
      { name: "Driver_License.jpg", type: "image", uploadedAt: "2025-01-15" },
      { name: "Vehicle_Registration.jpg", type: "image", uploadedAt: "2025-01-15" },
    ],
    status: "Pending Review",
    pendingReason: "Waiting for initial assessment",
    pendingWith: "Claims Department",
    responsiblePerson: "Marie Uwase",
    priority: "Medium",
    submittedAt: "2025-01-15 15:45",
    lastUpdated: "2025-01-16 09:30",
    estimatedAmount: 450000,
    timeline: [
      {
        date: "2025-01-15 15:45",
        event: "Claim submitted by driver",
        status: "complete",
        actor: "Mugisha Nkusi (Driver)",
      },
      {
        date: "2025-01-16 09:30",
        event: "Claim received and assigned for review",
        status: "complete",
        actor: "System",
      },
      {
        date: "2025-01-16 10:15",
        event: "Initial review started",
        status: "in-progress",
        actor: "Marie Uwase (Claims Agent)",
      },
      { date: "2025-01-18", event: "Assessment scheduling", status: "pending", actor: "Assessment Department" },
      { date: "2025-01-20", event: "Assessment", status: "pending", actor: "Assessor" },
      { date: "2025-01-22", event: "Repair approval", status: "pending", actor: "Claims Department" },
      { date: "2025-01-25", event: "Repairs", status: "pending", actor: "Garage" },
      { date: "2025-01-30", event: "Claim settlement", status: "pending", actor: "Finance Department" },
    ],
    notes: [
      {
        date: "2025-01-16 09:35",
        author: "Marie Uwase",
        content: "Claim appears to be valid. All required documents provided. Proceeding with initial review.",
      },
    ],
    assessments: [],
    repairs: [],
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending Review":
        return <Badge className="bg-yellow-500">Pending Review</Badge>
      case "Assessment Scheduled":
        return <Badge className="bg-blue-500">Assessment Scheduled</Badge>
      case "Investigation":
        return <Badge className="bg-purple-500">Investigation</Badge>
      case "Repair Approved":
        return <Badge className="bg-green-500/80">Repair Approved</Badge>
      case "Completed":
        return <Badge className="bg-green-600">Completed</Badge>
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            High
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Medium
          </Badge>
        )
      case "Low":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
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

  const getResponsibleIcon = (pendingWith) => {
    switch (pendingWith) {
      case "Claims Department":
        return <UserCog className="h-5 w-5 text-blue-500" />
      case "Assessment Department":
        return <ClipboardCheck className="h-5 w-5 text-yellow-500" />
      case "Garage":
        return <Wrench className="h-5 w-5 text-green-500" />
      case "Special Investigation Unit":
        return <AlertTriangle className="h-5 w-5 text-purple-500" />
      default:
        return <User className="h-5 w-5 text-gray-500" />
    }
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const updatedClaim = {
      ...claim,
      notes: [
        ...claim.notes,
        {
          date: format(new Date(), "yyyy-MM-dd HH:mm"),
          author: user?.firstName ? `${user.firstName} ${user.lastName}` : "Claims Agent",
          content: newNote,
        },
      ],
      lastUpdated: format(new Date(), "yyyy-MM-dd HH:mm"),
    }

    setClaim(updatedClaim)
    setNewNote("")
    setIsNotesDialogOpen(false)

    toast({
      title: "Note added",
      description: "Your note has been added to the claim.",
    })
  }

  const handleAssignClaim = (department, person) => {
    const updatedClaim = {
      ...claim,
      pendingWith: department,
      responsiblePerson: person,
      lastUpdated: format(new Date(), "yyyy-MM-dd HH:mm"),
      notes: [
        ...claim.notes,
        {
          date: format(new Date(), "yyyy-MM-dd HH:mm"),
          author: user?.firstName ? `${user.firstName} ${user.lastName}` : "Claims Agent",
          content: `Claim assigned to ${person} in ${department}.`,
        },
      ],
    }

    setClaim(updatedClaim)
    setIsAssignDialogOpen(false)

    toast({
      title: "Claim assigned",
      description: `Claim has been assigned to ${person} in ${department}.`,
    })
  }

  const handleUpdateStatus = (newStatus) => {
    const updatedClaim = {
      ...claim,
      status: newStatus,
      lastUpdated: format(new Date(), "yyyy-MM-dd HH:mm"),
      notes: [
        ...claim.notes,
        {
          date: format(new Date(), "yyyy-MM-dd HH:mm"),
          author: user?.firstName ? `${user.firstName} ${user.lastName}` : "Claims Agent",
          content: `Claim status updated to ${newStatus}.`,
        },
      ],
    }

    setClaim(updatedClaim)

    toast({
      title: "Status updated",
      description: `Claim status has been updated to ${newStatus}.`,
    })
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Marie Uwase",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/insurer/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/insurer/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/insurer/profile", icon: <User className="h-5 w-5" /> },
      ]}
      actions={[{ name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Claim #{claim.id}</h1>
            {getStatusBadge(claim.status)}
            {getPriorityBadge(claim.priority)}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(true)}>
              Assign
            </Button>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(true)}>
              Add Note
            </Button>
            <Button>
              <Brain className="mr-2 h-4 w-4" /> AI Analysis
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-muted-foreground">
              Policy: <span className="font-medium">{claim.policyNumber}</span> • Submitted:{" "}
              {format(new Date(claim.submittedAt), "MMM d, yyyy h:mm a")}
            </p>
          </div>
          {claim.pendingWith && (
            <div className="flex items-center mt-2 md:mt-0">
              <span className="text-muted-foreground mr-1">Pending with:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {getResponsibleIcon(claim.pendingWith)}
                <span>
                  {claim.pendingWith} ({claim.responsiblePerson})
                </span>
              </Badge>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Claim Details</TabsTrigger>
            <TabsTrigger value="documents">Documents ({claim.documents.length})</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes ({claim.notes.length})</TabsTrigger>
            <TabsTrigger value="assessments">Assessments ({claim.assessments.length})</TabsTrigger>
            <TabsTrigger value="repairs">Repairs ({claim.repairs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <Car className="h-4 w-4 mr-2" /> Vehicle Information
                  </h3>
                  <div className="bg-muted p-3 rounded-md space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Make & Model:</div>
                      <div>
                        {claim.vehicle.make} {claim.vehicle.model} ({claim.vehicle.year})
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Plate Number:</div>
                      <div>{claim.vehicle.plateNumber}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Color:</div>
                      <div>{claim.vehicle.color}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" /> Driver Information
                  </h3>
                  <div className="bg-muted p-3 rounded-md space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Name:</div>
                      <div>{claim.driver.name}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Phone:</div>
                      <div>{claim.driver.phone}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">License Number:</div>
                      <div>{claim.driver.licenseNumber}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">License Category:</div>
                      <div>{claim.driver.licenseCategory}</div>
                    </div>
                  </div>
                </div>

                {claim.garage && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <Wrench className="h-4 w-4 mr-2" /> Garage Information
                    </h3>
                    <div className="bg-muted p-3 rounded-md space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Name:</div>
                        <div>{claim.garage.name}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Address:</div>
                        <div>{claim.garage.address}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Phone:</div>
                        <div>{claim.garage.phone}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" /> Accident Information
                  </h3>
                  <div className="bg-muted p-3 rounded-md space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Date & Time:</div>
                      <div>
                        {format(new Date(claim.accident.date), "MMM d, yyyy")} at {claim.accident.time}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Location:</div>
                      <div>{claim.accident.location}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Police Report:</div>
                      <div>
                        {claim.accident.policeReport ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-600">No</span>
                        )}
                      </div>
                    </div>
                    {claim.accident.policeReport && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Police Station:</div>
                          <div>{claim.accident.policeStation}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Report Number:</div>
                          <div>{claim.accident.policeReportNumber}</div>
                        </div>
                      </>
                    )}
                    <div className="text-sm mt-2">
                      <div className="text-muted-foreground mb-1">Description:</div>
                      <div className="text-sm">{claim.accident.description}</div>
                    </div>
                  </div>
                </div>

                {claim.otherVehicles && claim.otherVehicles.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <Car className="h-4 w-4 mr-2" /> Other Vehicles Involved
                    </h3>
                    <div className="bg-muted p-3 rounded-md space-y-3">
                      {claim.otherVehicles.map((vehicle, index) => (
                        <div key={index} className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Make & Model:</div>
                            <div>
                              {vehicle.make} {vehicle.model}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Plate Number:</div>
                            <div>{vehicle.plateNumber}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Owner:</div>
                            <div>{vehicle.owner}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Insurer:</div>
                            <div>
                              {vehicle.insurer} ({vehicle.policyNumber})
                            </div>
                          </div>
                          {index < claim.otherVehicles.length - 1 && <Separator className="my-2" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {claim.injuries && claim.injuries.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" /> Injuries
                    </h3>
                    <div className="bg-muted p-3 rounded-md space-y-3">
                      {claim.injuries.map((injury, index) => (
                        <div key={index} className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Person:</div>
                            <div>
                              {injury.name} ({injury.age} years)
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Severity:</div>
                            <div>{injury.severity}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Description:</div>
                            <div>{injury.description}</div>
                          </div>
                          {index < claim.injuries.length - 1 && <Separator className="my-2" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" /> Damages & Estimated Costs
              </h3>
              <div className="bg-muted p-3 rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Estimated Cost (RWF)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claim.damages.map((damage, index) => (
                      <TableRow key={index}>
                        <TableCell>{damage.type}</TableCell>
                        <TableCell>{damage.description}</TableCell>
                        <TableCell className="text-right">{damage.estimatedCost.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="font-semibold text-right">
                        Total Estimated Cost:
                      </TableCell>
                      <TableCell className="font-semibold text-right">
                        {claim.damages.reduce((sum, damage) => sum + damage.estimatedCost, 0).toLocaleString()} RWF
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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
                    <p className="text-xs text-muted-foreground mt-1">{item.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <div className="space-y-4">
              {claim.notes.length > 0 ? (
                claim.notes.map((note, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div className="font-medium">{note.author}</div>
                        <div className="text-xs text-muted-foreground">{note.date}</div>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquareText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Notes</h3>
                  <p className="text-muted-foreground">No notes have been added to this claim yet.</p>
                  <Button onClick={() => setIsNotesDialogOpen(true)} className="mt-4">
                    Add Note
                  </Button>
                </div>
              )}
              {claim.notes.length > 0 && (
                <Button onClick={() => setIsNotesDialogOpen(true)} className="w-full">
                  Add Note
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assessments">
            <div className="text-center py-8">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Assessments</h3>
              <p className="text-muted-foreground">No assessments have been conducted for this claim yet.</p>
              <Button className="mt-4">Schedule Assessment</Button>
            </div>
          </TabsContent>

          <TabsContent value="repairs">
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Repairs</h3>
              <p className="text-muted-foreground">No repairs have been started for this claim yet.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Claim</DialogTitle>
            <DialogDescription>Assign this claim to a department and responsible person.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select defaultValue="Claims Department">
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Claims Department">Claims Department</SelectItem>
                  <SelectItem value="Assessment Department">Assessment Department</SelectItem>
                  <SelectItem value="Special Investigation Unit">Special Investigation Unit</SelectItem>
                  <SelectItem value="Finance Department">Finance Department</SelectItem>
                  <SelectItem value="Garage">Garage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="person">Responsible Person</Label>
              <Select defaultValue="Marie Uwase">
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Marie Uwase">Marie Uwase</SelectItem>
                  <SelectItem value="Jean Mugabo">Jean Mugabo</SelectItem>
                  <SelectItem value="Eric Kamanzi">Eric Kamanzi</SelectItem>
                  <SelectItem value="Habimana Jean">Habimana Jean</SelectItem>
                  <SelectItem value="Nshimiyimana Claude">Nshimiyimana Claude</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleAssignClaim("Claims Department", "Marie Uwase")}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Add a note to this claim. Notes are visible to all staff members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Enter your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
