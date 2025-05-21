"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "@/Next.js/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Car,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  FileImage,
  FileIcon as FilePdf,
  MessageSquareText,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
const statusesArray = ['draft', 'submitted', 'approved', 'underReview', 'active', 'completed,']
type Status = {
  name: string,
  slug: string,
  value: number
}
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


interface Document {
  id: string;
  file_name: string;
  mime_type: string;
  file_path: string;
  created_at: string;
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
export default function DriverClaimsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, apiRequest } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState<Claim>();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  // Fetch real claims data from API

  const fetchClaims = useCallback(async () => {

    try {
      setLoading(true);
      const response = await apiRequest(`${API_URL}claims/${user?.id}/get-by-user`, "GET");
      setClaims(response.data || []);
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
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, toast]);

  useEffect(() => {
    if (user) {
      fetchClaims();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You have to sign in to use the driver panel",
      });
      router.push("/login");
    }
  }, [user, fetchClaims, router, toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-10 w-1/4 rounded"></div>
        <div className="animate-pulse bg-muted h-64 w-full rounded"></div>
      </div>
    );
  }

  if (!claims) {
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
  // Filter claims based on search query and status filter
  const filteredClaims = claims.filter((claim) => {
    const vehicle = claim.vehicles ? claim.vehicles[0] : {};
    // let stts: Status[] = [];
    // for (let i = 0; i <= claims.length; i++) {
    //   const clm = claims[i];
    //   const st: Status = { name: clm.status, slug: clm.status.toLowerCase(), value: 0 }
    //   stts.push(st);
    // }
    // setStatuses(stts);
    // console.log('statuses', stts);
    const matchesSearch = searchQuery === "" || (
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle?.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Status matching based on your DB schema status options
    // Using  'Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Closed'
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" &&
        ["Draft", "Submitted", "Under Review", "Approved"].includes(claim.status)) ||
      (statusFilter === "completed" && claim.status === "Closed") ||
      (statusFilter === "draft" && claim.status === "draft") ||
      (statusFilter === "approved" && claim.status === "Approved") ||
      (statusFilter === "submitted" && claim.status === "Submitted") ||
      (statusFilter === "underReview" && claim.status === "Under Review") ||
      (statusFilter === "rejected" && claim.status === "Rejected")
      ;

    return matchesSearch && matchesStatus;
  });
  console.log('filteredClaims', filteredClaims);
  console.log('allClaims', claims);

  // Categorize filtered claims by status
  const activeClaims = filteredClaims.filter((claim) =>
    ["Draft", "Submitted", "Under Review", "Approved"].includes(claim.status)
  );

  const completedClaims = filteredClaims.filter((claim) =>
    claim.status === "Closed"
  );

  const rejectedClaims = filteredClaims.filter((claim) =>
    claim.status === "Rejected"
  );
  const draftClaims = filteredClaims.filter((claim) =>
    claim.status === "Draft"
  );
  const submittedClaims = filteredClaims.filter((claim) =>
    claim.status === "Submitted"
  );
  const underReviewClaims = filteredClaims.filter((claim) =>
    claim.status === "Under Review"
  );
  const approvedClaims = filteredClaims.filter((claim) =>
    claim.status === "Approved"
  );

  // Helper function to get vehicle display info
  const getVehicleInfo = (claim: { vehicle: Vehicle }) => {
    if (!claim.vehicle) {
      return { make: "N/A", plate: "N/A" };
    }

    const vehicle = claim.vehicle;
    return {
      make: `${vehicle.make || ""} ${vehicle.model || ""}`.trim() || "N/A",
      plate: vehicle.license_plate || "N/A"
    };
  };
  const openClaimDetails = (claim: any) => {
    setSelectedClaim(claim)
    setIsDetailsOpen(true)
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
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <DashboardLayout
      user={{
        name: user.name,
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
          <div>
            <h1 className="text-3xl font-bold">My Claims</h1>
            <p className="text-muted-foreground mt-2">View and manage all your insurance claims</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/driver/claims/new">
              <Plus className="mr-2 h-4 w-4" /> New Claim
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search claims by ID, vehicle, or description..."
              className="max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Claims</SelectItem>
                  <SelectItem value="draft">Draft Claims</SelectItem>
                  <SelectItem value="submitted">Submitted Claims</SelectItem>
                  <SelectItem value="underReview">Under Review Claims</SelectItem>
                  <SelectItem value="approved">Approved Claims</SelectItem>
                  <SelectItem value="active">Active Claims</SelectItem>
                  <SelectItem value="completed">Completed Claims</SelectItem>
                  <SelectItem value="rejected">Rejected Claims</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Draft Claims</CardTitle>
              <div className="text-2xl font-bold">{draftClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Claims still in Draft</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Submitted Claims</CardTitle>
              <div className="text-2xl font-bold">{submittedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Claims 100% submitted</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved Claims</CardTitle>
              <div className="text-2xl font-bold">{approvedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Claims that are Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Under-Review Claims</CardTitle>
              <div className="text-2xl font-bold">{underReviewClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Claims that are still under review</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Claims</CardTitle>
              <div className="text-2xl font-bold">{activeClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Claims in progress</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Claims</CardTitle>
              <div className="text-2xl font-bold">{completedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Successfully processed claims</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Claims</CardTitle>
              <div className="text-2xl font-bold">{rejectedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Claims that were not approved</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Claims ({filteredClaims.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({draftClaims.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({submittedClaims.length})</TabsTrigger>
            <TabsTrigger value="underReview">Under Review ({underReviewClaims.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedClaims.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeClaims.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedClaims.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedClaims.length})</TabsTrigger>
          </TabsList>
          {/* all  claims  table tab */}
          <TabsContent value="all" className="space-y-4">
            {claims.length > 0 ? (
              claims.map((claim) => (
                <Card key={claim.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                          <p className="text-sm text-muted-foreground">
                            {claim?.vehicles?.[0]?.model} {claim?.vehicles?.[0]?.make} - {claim?.vehicles?.[0]?.year} ({claim?.vehicles?.[0]?.license_plate}) • {claim.accident_date.substring(0, 10) + ' at ' + claim.accident_time}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0">{getStatusBadge(claim.status)}</div>
                      </div>

                      <p className="text-sm mb-4 line-clamp-2">{claim.description}</p>

                      {claim.status !== "Completed" && claim.status !== "Rejected" && (
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{claim.progress}%</span>
                          </div>
                          <Progress value={claim.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Insurer:</span> {claim.insurer.name}
                        </div>
                        <div className="text-sm mt-2 md:mt-0">
                          <span className="text-muted-foreground">
                            {claim.status === "Completed" ? "Final Amount:" : "Estimated Amount:"}
                          </span>{" "}
                          {claim.amount.toLocaleString()} {claim.currency}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Button>
                        {claim.status === "In Progress" && (
                          <Button size="sm">
                            <FileText className="mr-2 h-4 w-4" /> Update Claim
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Claims Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any claims matching your search criteria.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/driver/claims/new">
                        <Plus className="mr-2 h-4 w-4" /> Submit New Claim
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* draft table tab */}
          <TabsContent value="draft" className="space-y-4">
            {draftClaims.length > 0 ? (
              draftClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim?.vehicles?.[0]?.model} {claim?.vehicles?.[0]?.make} - {claim?.vehicles?.[0]?.year} ({claim?.vehicles?.[0]?.license_plate}) • {claim.accident_date.substring(0, 10) + ' at ' + claim.accident_time}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">{getStatusBadge(claim.status)}</div>
                    </div>

                    <p className="text-sm mb-4">{claim.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{claim.progress}%</span>
                      </div>
                      <Progress value={claim.progress} className="h-2" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {claim.insurer.name}
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <span className="text-muted-foreground">Estimated Amount:</span> {claim.amount.toLocaleString()}{" "}
                        {claim.currency}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                      <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Update Claim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Draft Claims</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any draft insurance claims at the moment.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/driver/claims/new">
                        <Plus className="mr-2 h-4 w-4" /> Submit New Claim
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* submitted table tab */}
          <TabsContent value="submitted" className="space-y-4">
            {submittedClaims.length > 0 ? (
              submittedClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim.vehicles[0].model} ({claim.vehicles[0].plat}) • {claim.accident_date.substring(0, 10) + ' at ' + claim.accident_time}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">{getStatusBadge(claim.status)}</div>
                    </div>

                    <p className="text-sm mb-4">{claim.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{claim.progress}%</span>
                      </div>
                      <Progress value={claim.progress} className="h-2" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {claim.insurer.name}
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <span className="text-muted-foreground">Estimated Amount:</span> {claim.amount.toLocaleString()}{" "}
                        {claim.currency}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                      <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Update Claim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No submitted Claims</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any submitted insurance claims at the moment.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/driver/claims/new">
                        <Plus className="mr-2 h-4 w-4" /> Submit New Claim
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* approved table tab */}
          <TabsContent value="approved" className="space-y-4">
            {approvedClaims.length > 0 ? (
              approvedClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim?.vehicles?.[0]?.model} {claim?.vehicles?.[0]?.make} - {claim?.vehicles?.[0]?.year} ({claim?.vehicles?.[0]?.license_plate}) • {claim.accident_date.substring(0, 10) + ' at ' + claim.accident_time}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">{getStatusBadge(claim.status)}</div>
                    </div>

                    <p className="text-sm mb-4">{claim.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{claim.progress}%</span>
                      </div>
                      <Progress value={claim.progress} className="h-2" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {claim.insurer.name}
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <span className="text-muted-foreground">Estimated Amount:</span> {claim.amount.toLocaleString()}{" "}
                        {claim.currency}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                      <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Update Claim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No approved Claims</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any approved insurance claims at the moment.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/driver/claims/new">
                        <Plus className="mr-2 h-4 w-4" /> Submit New Claim
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* underReview table tab */}
          <TabsContent value="underReview" className="space-y-4">
            {underReviewClaims.length > 0 ? (
              underReviewClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim?.vehicles?.[0]?.model} {claim?.vehicles?.[0]?.make} - {claim?.vehicles?.[0]?.year} ({claim?.vehicles?.[0]?.license_plate}) • {claim.accident_date.substring(0, 10) + ' at ' + claim.accident_time}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">{getStatusBadge(claim.status)}</div>
                    </div>

                    <p className="text-sm mb-4">{claim.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{claim.progress}%</span>
                      </div>
                      <Progress value={claim.progress} className="h-2" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {claim.insurer.name}
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <span className="text-muted-foreground">Estimated Amount:</span> {claim.amount.toLocaleString()}{" "}
                        {claim.currency}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                      <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Update Claim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No underReview Claims</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any underReview insurance claims at the moment.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/driver/claims/new">
                        <Plus className="mr-2 h-4 w-4" /> Submit New Claim
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* active table tab */}
          <TabsContent value="active" className="space-y-4">
            {activeClaims.length > 0 ? (
              activeClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim.vehicles[0]?.model} ({claim.vehicles[0]?.plate}) • {claim.accident_date.substring(0, 10) + ' at ' + claim.accident_time}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">{getStatusBadge(claim.status)}</div>
                    </div>

                    <p className="text-sm mb-4">{claim.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{claim.progress}%</span>
                      </div>
                      <Progress value={claim.progress} className="h-2" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {claim.insurer.name}
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <span className="text-muted-foreground">Estimated Amount:</span> {claim.amount.toLocaleString()}{" "}
                        {claim.currency}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                      <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Update Claim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Claims</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any active insurance claims at the moment.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/driver/claims/new">
                        <Plus className="mr-2 h-4 w-4" /> Submit New Claim
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* completed table tab */}
          <TabsContent value="completed" className="space-y-4">
            {completedClaims.length > 0 ? (
              completedClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim?.vehicles?.[0]?.model} {claim?.vehicles?.[0]?.make} - {claim?.vehicles?.[0]?.year} ({claim?.vehicles?.[0]?.license_plate}) • {claim.accident_date.substring(0, 10) + ' at ' + claim.accident_time}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0 w-fit bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                      </Badge>
                    </div>

                    <p className="text-sm mb-4">{claim.description}</p>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {claim.insurer.name}
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <span className="text-muted-foreground">Final Amount:</span> {claim.amount.toLocaleString()} {claim.currency}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Completed Claims</h3>
                    <p className="text-sm text-muted-foreground">You don't have any completed insurance claims yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* rejected table tab */}
          <TabsContent value="rejected" className="space-y-4">
            {rejectedClaims.length > 0 ? (
              rejectedClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim?.vehicles?.[0]?.model} {claim?.vehicles?.[0]?.make} - {claim?.vehicles?.[0]?.year} ({claim?.vehicles?.[0]?.license_plate}) • {claim.accident_date.substring(0, 10) + ' at ' + claim.accident_time}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0 w-fit" variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" /> Rejected
                      </Badge>
                    </div>

                    <p className="text-sm mb-4">{claim.description}</p>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {claim.insurer.name}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Rejected Claims</h3>
                    <p className="text-sm text-muted-foreground">You don't have any rejected insurance claims.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Claim Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            {selectedClaim && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Claim #{selectedClaim.code}</span>
                    {getStatusBadge(selectedClaim.status)}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedClaim.vehicles[0].model} {selectedClaim.vehicles[0].make} - {selectedClaim.vehicles[0].year} ({selectedClaim.vehicles[0].license_plate})
                    <br /> • Incident happened on {selectedClaim.accident_date.substring(0, 10) + ' at ' + selectedClaim.accident_time}
                    <br /> • Submitted on {selectedClaim.created_at?.substring(0, 10)}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Claim Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Insurer:</span>
                        <span>{selectedClaim.insurer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{selectedClaim.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {selectedClaim.status === "Completed" ? "Final Amount:" : "Estimated Amount:"}
                        </span>
                        <span>{selectedClaim.amount.toLocaleString()} {selectedClaim.currency}</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-medium mt-4 mb-2">Description</h3>
                    <p className="text-sm">{selectedClaim.description}</p>

                    <h3 className="text-sm font-medium mt-4 mb-2">Documents</h3>
                    <div className="space-y-2">
                      {selectedClaim.documents?.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            {getDocumentIcon(doc.mime_type)}
                            <span className="ml-2">{doc.file_name}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Claim Timeline</h3>
                    <div className="space-y-4">
                      {selectedClaim.activities?.map((item: any) => (
                        <div key={item.id} className="flex">
                          <div className="mr-3">{getTimelineStatusIcon(item.status)}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.event}</p>
                            <p className="text-xs text-muted-foreground">{item.created_at.substring(0, 10)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  {selectedClaim.status !== "Completed" && selectedClaim.status !== "Rejected" && (
                    <Button>
                      <FileText className="mr-2 h-4 w-4" /> Update Claim
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => router.push(`/dashboard/driver/claims/${selectedClaim.id}`)}>
                    <FileText className="mr-2 h-4 w-4" /> Full Info on Claim
                  </Button>
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
