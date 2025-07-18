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
  Briefcase,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { Assignment, defaultClaim } from "@/lib/types/claims"
import { Message } from "ai"
import router from "next/router"
import { use, useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import loading from "../loading"
import { useRouter } from "next/navigation"

import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import AssessmentReportCard from "@/components/AssessmentReportCard"
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const STORAGES_URL = process.env.NEXT_PUBLIC_STORAGES_URL


interface Props {
  params: Promise<{ id: string }>;
}
export default function AssessmentDetails({ params }: Props) {
  const router = useRouter()
  const { id } = use(params);
  const { user, apiRequest } = useAuth()
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const [assessment, setAssessment] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const fetchAssignment = useCallback(async () => {

    try {
      setLoading(true);
      const response = await apiRequest(`${API_URL}claim-assignment-assessments/${id}`, "GET");

      if (response) {
        const assign = response.data
        const claim = assign.claim
        const vehicle = claim.vehicles[0]
        const assessment = {
          ...claim,
          ...assign,
          claim,
          assessementInfo: claim.assessments,
          claimId: claim.code,
          vehicle: vehicle?.model + ' ' + vehicle?.make + ' ' + vehicle?.year,
          vehicleDetails: vehicle,
          date: claim.accident_date,
          customer: claim.user.name,
          customerDetails: claim.user,
          insurer: claim.tenant.name,
          priority: claim.priority,
          location: claim.location,
          scheduled_date: assign.scheduled_date,
          tenant_id: assign.tenant_id,
          tenant: assign.tenant,
          photos: assign.claim.documents,
        }
        setAssignment(assessment)
        setAssessment(assessment)
      }
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
          description: "Failed to fetch assignment data",
        });
      }
      console.error("Error fetching assignment:", error);
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, id, toast]);

  useEffect(() => {
    if (user) {
      fetchAssignment();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You have to sign in to use the driver panel",
      });
      router.push("/login");
    }
  }, [user, fetchAssignment, router, toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-10 w-1/4 rounded"></div>
        <div className="animate-pulse bg-muted h-64 w-full rounded"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-muted-foreground">Failed to load Assessement data.</p>
        <Button onClick={() => router.push("/dashboard/driver/assessements")} className="mt-4">
          Back to Assessements
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={{
        name: user.name,
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
            <h1 className="text-3xl font-bold">Assessment #{assessment.code}</h1>
            <p className="text-muted-foreground">
              Claim #{assessment.claimId} • {format(assessment.date, 'yyyy-MM-dd')}
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <Badge
              className="w-fit"
              variant={
                assessment.status === "pending"
                  ? "secondary"
                  : assessment.status === "scheduled"
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
                  assessment.priority === "high"
                    ? "destructive"
                    : assessment.priority === "medium"
                      ? "default"
                      : "outline"
                }
              >
                {assessment.priority} Priority
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <dd>{assessment.vehicleDetails.license_plate}</dd>
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
                <Building className="h-5 w-5 mr-2" /> Insurance Information
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
                  <dd>{assessment.policy_number}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Contact Person</dt>
                  <dd>{assessment.assessor?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Contact Phone</dt>
                  <dd>{assessment.assessor?.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Contact Email</dt>
                  <dd>{assessment.assessor?.email}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
          <CardHeader>
            <CardTitle>Damage Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{assessment.description}</p>
          </CardContent>
        </Card>
        </div>

      

        <Tabs defaultValue="report">
          <TabsList>
            <TabsTrigger value="report">
              <Briefcase className="h-4 w-4 mr-2" /> Assessment Report
            </TabsTrigger>
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

          <TabsContent value="report" className="space-y-4">
            {assessment.assessementInfo?.map((asss: any) => (
              <div key={asss.id}>
                <p className="space-x-2 space-y-2 ">Assessment Notes: <strong>{asss.notes}</strong> </p>
                <p className="space-x-2 space-y-2 ">Severity: <strong>{asss.severity}</strong> </p>
                <AssessmentReportCard reportData={asss.report} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assessment.photos?.map((photo) => (
                <div key={photo.id} className="border rounded-lg overflow-hidden">
                  <img src={STORAGES_URL + photo.file_path || "/placeholder.svg"} alt={photo.file_name} className="w-full h-auto" />
                  <div className="p-2">
                    <p className="text-sm">{photo.file_name}</p>
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
                  {assessment.documents?.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.file_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.mime_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.created_at}</td>
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
              {assessment.threads?.messages?.map((message) => (
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
              {assessment.activities?.map((event) => (
                <div key={event.id} className="flex items-start space-x-4">
                  <div className="mt-1 bg-primary w-2 h-2 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">{event.date}</div>
                    <div className="font-medium">{event.event}</div>
                    <div className="text-sm">{event.user?.info}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          {assessment.status === "pending" && (
            <Button asChild>
              <Link href={`/dashboard/assessor/assessments/${assessment.id}/schedule`}>Schedule Assessment</Link>
            </Button>
          )}
          {assessment.status === "scheduled" && (
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
