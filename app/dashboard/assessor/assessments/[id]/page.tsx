"use client"
import Link from "@/Next.js/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  ClipboardCheck,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Calendar,
  Car,
  UserIcon,
  Building,
  FileImage,
  FileTextIcon,
  MessageCircle,
  History,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"

export default function AssessmentDetails({ params }) {
  const { id } = params
  const { user } = useAuth()

  // In a real app, you would fetch this data from an API
  const assessment = {
    id: id,
    claimId: "CL-2025-001",
    vehicle: "Toyota RAV4",
    vehicleDetails: {
      year: 2020,
      licensePlate: "RAE 123 A",
      vin: "1HGCM82633A123456",
      color: "Silver",
    },
    date: "2025-03-15",
    status: "Pending",
    customer: "Mugisha Nkusi",
    customerDetails: {
      phone: "+250 78 123 4567",
      email: "mugisha.nkusi@example.com",
      address: "KN 5 Ave, Kigali, Nyarugenge",
    },
    insurer: "Sanlam Alianz",
    insurerDetails: {
      policyNumber: "POL-2024-4567",
      contactPerson: "Uwimana Alice",
      contactPhone: "+250 72 987 6543",
      contactEmail: "alice.uwimana@sanlam.rw",
    },
    location: "Kigali, Nyarugenge",
    priority: "High",
    description:
      "Vehicle was involved in a front-end collision. Damage to the front bumper, hood, and radiator. Airbags deployed.",
    photos: [
      { id: 1, url: "/placeholder.svg?height=200&width=300", caption: "Front view of damage" },
      { id: 2, url: "/placeholder.svg?height=200&width=300", caption: "Side view of damage" },
      { id: 3, url: "/placeholder.svg?height=200&width=300", caption: "Engine compartment" },
    ],
    documents: [
      { id: 1, name: "Police Report", type: "PDF", size: "1.2 MB", date: "2025-03-14" },
      { id: 2, name: "Insurance Policy", type: "PDF", size: "0.8 MB", date: "2025-03-14" },
      { id: 3, name: "Driver's Statement", type: "DOCX", size: "0.5 MB", date: "2025-03-14" },
    ],
    timeline: [
      { id: 1, date: "2025-03-14 09:30", event: "Claim submitted by customer", user: "Mugisha Nkusi" },
      { id: 2, date: "2025-03-14 14:45", event: "Claim approved for assessment", user: "Uwimana Alice (Insurer)" },
      { id: 3, date: "2025-03-15 08:15", event: "Assessment assigned", user: "System" },
    ],
    messages: [
      {
        id: 1,
        sender: "Uwimana Alice",
        role: "Insurer",
        message: "Please prioritize this assessment as the customer needs their vehicle urgently.",
        timestamp: "2025-03-15 09:00",
      },
      {
        id: 2,
        sender: "Mugisha Nkusi",
        role: "Customer",
        message: "When can I expect the assessor to arrive? I need to plan my day.",
        timestamp: "2025-03-15 10:30",
      },
    ],
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Habimana Jean",
        role: "Assessor",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/assessor", icon: <ClipboardCheck className="h-5 w-5" /> },
        { name: "Assessments", href: "/dashboard/assessor/assessments", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/assessor/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Schedule", href: "/dashboard/assessor/schedule", icon: <Calendar className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/assessor/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/assessor/profile", icon: <User className="h-5 w-5" /> },
      ]}
      actions={[{ name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }]}
    >
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/assessor">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/assessor/assessments">Assessments</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{assessment.id}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assessment #{assessment.id}</h1>
            <p className="text-muted-foreground">
              Claim #{assessment.claimId} • {assessment.date}
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <Badge
              className="w-fit"
              variant={
                assessment.status === "Pending"
                  ? "secondary"
                  : assessment.status === "Scheduled"
                    ? "default"
                    : "outline"
              }
            >
              {assessment.status}
            </Badge>
            {assessment.priority && (
              <Badge
                className="w-fit"
                variant={
                  assessment.priority === "High"
                    ? "destructive"
                    : assessment.priority === "Medium"
                      ? "default"
                      : "outline"
                }
              >
                {assessment.priority} Priority
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2" /> Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Vehicle</dt>
                  <dd>{assessment.vehicle}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Year</dt>
                  <dd>{assessment.vehicleDetails.year}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">License Plate</dt>
                  <dd>{assessment.vehicleDetails.licensePlate}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">VIN</dt>
                  <dd>{assessment.vehicleDetails.vin}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Color</dt>
                  <dd>{assessment.vehicleDetails.color}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd>{assessment.customer}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd>{assessment.customerDetails.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd>{assessment.customerDetails.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                  <dd>{assessment.customerDetails.address}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" /> Insurer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Insurer</dt>
                  <dd>{assessment.insurer}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Policy Number</dt>
                  <dd>{assessment.insurerDetails.policyNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Contact Person</dt>
                  <dd>{assessment.insurerDetails.contactPerson}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Contact Phone</dt>
                  <dd>{assessment.insurerDetails.contactPhone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Contact Email</dt>
                  <dd>{assessment.insurerDetails.contactEmail}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Damage Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{assessment.description}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="photos">
          <TabsList>
            <TabsTrigger value="photos">
              <FileImage className="h-4 w-4 mr-2" /> Photos
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileTextIcon className="h-4 w-4 mr-2" /> Documents
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageCircle className="h-4 w-4 mr-2" /> Messages
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <History className="h-4 w-4 mr-2" /> Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assessment.photos.map((photo) => (
                <div key={photo.id} className="border rounded-lg overflow-hidden">
                  <img src={photo.url || "/placeholder.svg"} alt={photo.caption} className="w-full h-auto" />
                  <div className="p-2">
                    <p className="text-sm">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessment.documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <div className="space-y-4">
              {assessment.messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">
                      {message.sender} <span className="text-muted-foreground">({message.role})</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{message.timestamp}</div>
                  </div>
                  <p>{message.message}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input type="text" placeholder="Type your message..." className="flex-1 px-3 py-2 border rounded-md" />
              <Button>Send</Button>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="space-y-4">
              {assessment.timeline.map((event) => (
                <div key={event.id} className="flex items-start space-x-4">
                  <div className="mt-1 bg-primary w-2 h-2 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">{event.date}</div>
                    <div className="font-medium">{event.event}</div>
                    <div className="text-sm">{event.user}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          {assessment.status === "Pending" && (
            <Button asChild>
              <Link href={`/dashboard/assessor/assessments/${assessment.id}/schedule`}>Schedule Assessment</Link>
            </Button>
          )}
          {assessment.status === "Scheduled" && (
            <Button asChild>
              <Link href={`/dashboard/assessor/assessments/${assessment.id}/submit`}>Complete Assessment</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard/assessor/assessments">Back to Assessments</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
