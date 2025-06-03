"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  FileImage,
  FileIcon as FilePdf,
  Car,
  User,
  CalendarClock,
  ArrowUpDown,
  ChevronDown,
  Info,
  AlertCircle,
  UserCog,
  Wrench,
  ClipboardCheck,
  Brain,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { Claim, Garage, PoliceReport } from "@/lib/types/claims"
import { randomUUID } from "crypto"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";


export default function InsurerClaimsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, apiRequest } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [sortField, setSortField] = useState("submitted_at")
  const [sortDirection, setSortDirection] = useState("desc")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [claims, setClaims] = useState<Claim[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mockdepartments = [
    {
      name: "Claims Department (Mock)", description: "Claims Department", id: randomUUID,
      tenant_id: user?.tenant_id
    },
    {
      name: "Assessment Department (Mock)", description: "Assessment Department", id: randomUUID,
      tenant_id: user?.tenant_id
    },
    {
      name: "Special Investigation Unit (Mock)", description: "Special Investigation Unit Department", id: randomUUID,
      tenant_id: user?.tenant_id
    },
    {
      name: "Finance Department (Mock)", description: "Finance Department", id: randomUUID,
      tenant_id: user?.tenant_id
    },
    {
      name: "Garage (Mock)", description: "Garage Department", id: randomUUID,
      tenant_id: user?.tenant_id
    }
  ]
  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_URL}claims/${user?.tenant_id}/get-by-insurer`, "GET");
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
      console.error("Error fetching claims:", error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, toast, user?.id]);

  useEffect(() => {
    if (user) {
      fetchClaims();
      setDepartments(user.tenant.departments || mockdepartments)
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You have to sign in to use this panel",
      });
      router.push("/login");
    }
  }, [user, fetchClaims, router, toast]);
  // Filter claims based on search query, status filter, priority filter, and date filter
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.vehicles[0]?.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.vehicles[0]?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.vehicles[0]?.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.driver_details?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.policy_number.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        (claim.status === "Pending Review" ||
          claim.status === "Draft" ||
          claim.status === "Submitted" ||
          claim.status === "Assessment Scheduled" ||
          claim.status === "Investigation")) ||
      (statusFilter === "approved" && claim.status === "Repair Approved") ||
      (statusFilter === "approved" && claim.status === "Approved") ||
      (statusFilter === "completed" && claim.status === "Completed") ||
      (statusFilter === "rejected" && claim.status === "Rejected")

    const matchesPriority =
      priorityFilter === "all" ||
      (priorityFilter === "high" && claim.priority === "high") ||
      (priorityFilter === "medium" && claim.priority === "medium") ||
      (priorityFilter === "low" && claim.priority === "low")

    // Date filtering logic
    const claimDate = new Date(claim.submitted_at ? claim.submitted_at : claim.created_at)
    const now = new Date()
    const isToday = claimDate.toDateString() === now.toDateString()
    const isThisWeek = claimDate > new Date(now.setDate(now.getDate() - 7))
    const isThisMonth = claimDate > new Date(now.setFullYear(now.getFullYear(), now.getMonth() - 1))

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && isToday) ||
      (dateFilter === "week" && isThisWeek) ||
      (dateFilter === "month" && isThisMonth)

    return matchesSearch && matchesStatus && matchesPriority && matchesDate
  })

  // Sort claims
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    let aValue, bValue

    // Determine the values to compare based on the sort field
    switch (sortField) {
      case "submitted_at":
        aValue = new Date(a.submitted_at).getTime()
        bValue = new Date(b.submitted_at).getTime()
        break
      case "updated_at":
        aValue = new Date(a.updated_at).getTime()
        bValue = new Date(b.updated_at).getTime()
        break
      case "priority":
        const priorityOrder = { High: 3, Medium: 2, Low: 1 }
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
        break
      case "status":
        aValue = a.status
        bValue = b.status
        break
      case "id":
        aValue = a.id
        bValue = b.id
        break
      default:
        aValue = a.id
        bValue = b.id
    }

    // Apply sort direction
    return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
  })

  const pendingClaims = sortedClaims.filter(
    (claim) =>
      claim.status === "Pending Review" || claim.status === "Assessment Scheduled" || claim.status === "Investigation",
  )
  const draftClaims = sortedClaims.filter((claim) => claim.status === "Draft")
  const ApprovedClaims = sortedClaims.filter((claim) => claim.status === "Approved")
  const submittedClaims = sortedClaims.filter((claim) => claim.status === "Submitted")
  const underReviewClaims = sortedClaims.filter((claim) => claim.status === "Under Review")
  const approvedClaims = sortedClaims.filter((claim) => claim.status === "Repair Approved")
  const completedClaims = sortedClaims.filter((claim) => claim.status === "Completed")
  const rejectedClaims = sortedClaims.filter((claim) => claim.status === "Rejected")

  const openClaimDetails = (claim: any) => {
    setSelectedClaim(claim)
    setIsDetailsOpen(true)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <Badge className="bg-yellow-500">Draft Stage</Badge>
      case "Submitted":
        return <Badge className="bg-yellow-500">Submitted</Badge>
      case "Approved":
        return <Badge className="bg-yellow-500">Approved</Badge>
      case "Under Review":
        return <Badge className="bg-yellow-500">Under Review</Badge>
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

  const getPriorityBadge = (priority: string) => {
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

  const getResponsibleIcon = (departmentname: string) => {
    switch (departmentname) {
      case "Claims Department":
        return <UserCog className="h-5 w-5 text-blue-500" />
      case "Assessment Department":
        return <ClipboardCheck className="h-5 w-5 text-yellow-500" />
      case "Garage":
        return <Wrench className="h-5 w-5 text-green-500" />
      case "Special Investigation Unit":
        return <AlertCircle className="h-5 w-5 text-purple-500" />
      default:
        return <User className="h-5 w-5 text-gray-500" />
    }
  }
  const assignFormDataSchama = z.object({
    department_id: z.string().min(1, { message: "Department is required" }), // Changed from 2
    assessor_id: z.string().min(1, { message: "Agent/Assessor is required" }), // Changed from 16
    notes: z.string().optional(),
  });

  const assignForm = useForm<z.infer<typeof assignFormDataSchama>>({
    resolver: zodResolver(assignFormDataSchama),
    defaultValues: {
      department_id: departments?.[0]?.id?.toString() || '', // Fixed to use departments, not mockdepartments
      assessor_id: user?.tenant?.users?.[0]?.id?.toString() || '',
      notes: ''
    },
  });

  const onSubmitAssignClaim = async (values: z.infer<typeof assignFormDataSchama>) => {
    if (!selectedClaim) return
    try {
      const newAssignment = await apiRequest(`${API_URL}claims/assign/${selectedClaim.id}`, "POST", {
        department_id: values.department_id,
        assessor_id: values.assessor_id,
        tenant_id: user?.tenant_id,
        user_id: user?.id,
        claim_id: selectedClaim.id,
        notes: values.notes
      });

      const updatedClaim = {
        ...selectedClaim,
        department_id: values.department_id,
        assignment: newAssignment
      }
      setSelectedClaim(updatedClaim)
      setIsAssignDialogOpen(false)
      toast({
        title: "Assigned successfully",
        description: `Successfully been assigned agent & department to claim ${selectedClaim.code}.`,
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

  const handleAddNote = async () => {
    if (!selectedClaim || !newNote.trim()) return


    try {
      setLoading(true)
      const newNoteData = {
        tenant_id: user?.tenant_id,
        user_id: user?.id,
        claim_id: selectedClaim?.id,
        content: newNote
      }
      const response = await apiRequest(`${API_URL}notes`, "POST", newNoteData)
      const noteFromRsponse = response
      const updatedClaim = {
        ...selectedClaim,
        notes: [
          ...selectedClaim.notes,
          noteFromRsponse
        ],
      }
      setSelectedClaim(updatedClaim)
      setNewNote("")
      setIsNotesDialogOpen(false)

      toast({
        title: "Note added",
        description: "Your note has been added to the claim.",
      })
    } catch (error: any) {
      if (Array.isArray(error.errors)) {
        error.errors.forEach((er: string) => {
          toast({
            variant: "destructive",
            title: "Error while sending new note",
            description: er,
          });
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send claim note data",
        });
      }
      console.error("Error sendin note:", error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }



  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedClaim) return

    const updatedClaim = {
      ...selectedClaim,
      status: newStatus,
      updated_at: format(new Date(), "yyyy-MM-dd HH:mm"),
      notes: [
        ...selectedClaim.notes,
        {
          tenant_id: user?.tenant_id,
          user_id: user?.id,
          claim_id: selectedClaim?.id,
          content: `Claim status updated to ${newStatus}.`,
        },
      ],
    }
    try {
      const response = await apiRequest(`${API_URL}claims/${selectedClaim.id}`, "PUT", updatedClaim)
      setSelectedClaim(updatedClaim)
      setClaims([...claims, updatedClaim])

      toast({
        title: "Status updated",
        description: `Claim status has been updated to ${newStatus}.`,
      })
    } catch (error: any) {
      if (Array.isArray(error.errors)) {
        error.errors.forEach((er: string) => {
          toast({
            variant: "destructive",
            title: "Error while sending new status",
            description: er,
          });
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send claim status data",
        });
      }
      console.error("Error sendin status:", error);
    }
  }

  const handleAIAnalysis = () => {
    router.push(`/dashboard/insurer/claims/${selectedClaim?.id}/analysis`)
  }
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-10 w-1/4 rounded"></div>
        <div className="animate-pulse bg-muted h-64 w-full rounded"></div>
      </div>
    );
  }
  return (
    <DashboardLayout
      user={{
        name: user?.name || "Insurer Name",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Garages Partners", href: "/dashboard/insurer/garages", icon: <Wrench className="h-5 w-5"/> },
        { name: "Bids", href: "/dashboard/insurer/bids", icon: <FileText className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Claims Management</h1>
            <p className="text-muted-foreground mt-2">View, process, and manage all insurance claims</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/insurer/analytics")}>
              View Analytics
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/insurer/documents")}>
              Document Center
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search claims by ID, vehicle, driver, or policy number..."
              className="max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft Stage</SelectItem>
                  <SelectItem value="submitted">Submitted 100%</SelectItem>
                  <SelectItem value="underReview">Under Review</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="bg-gray-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Draft Claims</CardTitle>
              <div className="text-2xl font-bold text-gray-900">{draftClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-700">Claims submition NOT completed </div>
            </CardContent>
          </Card>
          <Card className="bg-green-80 border-green-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Submitted Claims</CardTitle>
              <div className="text-2xl font-bold text-green-600">{submittedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-green-500">Claims just submitted 100%</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pending Claims</CardTitle>
              <div className="text-2xl font-bold text-yellow-900">{pendingClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-yellow-700">Awaiting review or assessment</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Approved Claims</CardTitle>
              <div className="text-2xl font-bold text-blue-900">{approvedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-blue-700">Repairs approved, in progress</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Completed Claims</CardTitle>
              <div className="text-2xl font-bold text-green-900">{completedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-green-700">Successfully processed claims</div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Rejected Claims</CardTitle>
              <div className="text-2xl font-bold text-red-900">{rejectedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-red-700">Claims that were not approved</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Claims ({sortedClaims.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingClaims.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedClaims.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedClaims.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedClaims.length})</TabsTrigger>
            <TabsTrigger value="multi-signature">Multi-Signature</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("id")}>
                          Claim ID
                          {sortField === "id" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Vehicle & Driver</TableHead>
                      <TableHead>Incident Details</TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("status")}>
                          Status
                          {sortField === "status" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("priority")}>
                          Priority
                          {sortField === "priority" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("submitted_at")}>
                          Submitted
                          {sortField === "submitted_at" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedClaims.length > 0 ? (
                      sortedClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{claim.code}</span>
                              <span className="text-xs text-muted-foreground">{claim.policy_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {claim.vehicles[0]?.make} {claim.vehicles[0]?.model}
                              </span>
                              <span className="text-xs">{claim.vehicles[0]?.license_plate}</span>
                              <span className="text-xs text-muted-foreground mt-1">{claim.driver_details[0]?.user?.name || claim.user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.accident_date), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{claim.location}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {claim.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(claim.status)}
                              {claim.pending_reason && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center text-xs text-muted-foreground mt-1 cursor-help">
                                        <Info className="h-3 w-3 mr-1" />
                                        <span className="truncate max-w-[120px]">{claim.pending_reason}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{claim.pending_reason}</p>
                                      {claim.department?.name && (
                                        <p className="font-semibold mt-1">
                                          With: {claim.department.name} ({claim.assignment?.assessor?.name})
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.submitted_at?.toString()), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(claim.submitted_at), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openClaimDetails(claim)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsAssignDialogOpen(true)
                                    }}
                                  >
                                    Assign Claim
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsNotesDialogOpen(true)
                                    }}
                                  >
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/dashboard/insurer/claims/${claim.id}/analysis`)
                                    }}
                                  >
                                    AI Analysis
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No claims found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Claim ID</TableHead>
                      <TableHead>Vehicle & Driver</TableHead>
                      <TableHead>Incident Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingClaims.length > 0 ? (
                      pendingClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{claim.id}</span>
                              <span className="text-xs text-muted-foreground">{claim.policy_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {claim.vehicles[0]?.make} {claim.vehicles[0]?.model}
                              </span>
                              <span className="text-xs">{claim.vehicles[0]?.license_plate}</span>
                              <span className="text-xs text-muted-foreground mt-1">{claim.driver_details?.user?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.accident_date), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{claim.location}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {claim.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(claim.status)}
                              {claim.pending_reason && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center text-xs text-muted-foreground mt-1 cursor-help">
                                        <Info className="h-3 w-3 mr-1" />
                                        <span className="truncate max-w-[120px]">{claim.pending_reason}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{claim.pending_reason}</p>
                                      {claim.department?.name && (
                                        <p className="font-semibold mt-1">
                                          With: {claim.department?.name} ({claim.assignment?.assessor?.name})
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.submitted_at?.toString()), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(claim.submitted_at?.toString()), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openClaimDetails(claim)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsAssignDialogOpen(true)
                                    }}
                                  >
                                    Assign Claim
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsNotesDialogOpen(true)
                                    }}
                                  >
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/dashboard/insurer/claims/${claim.id}/analysis`)
                                    }}
                                  >
                                    AI Analysis
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No pending claims found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Claim ID</TableHead>
                      <TableHead>Vehicle & Driver</TableHead>
                      <TableHead>Incident Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedClaims.length > 0 ? (
                      approvedClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{claim.id}</span>
                              <span className="text-xs text-muted-foreground">{claim.policy_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {claim.vehicles[0]?.make} {claim.vehicles[0]?.model}
                              </span>
                              <span className="text-xs">{claim.vehicles[0]?.license_plate}</span>
                              <span className="text-xs text-muted-foreground mt-1">{claim.driver_details?.user?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.accident_date), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{claim.location}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {claim.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(claim.status)}
                              {claim.pending_reason && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center text-xs text-muted-foreground mt-1 cursor-help">
                                        <Info className="h-3 w-3 mr-1" />
                                        <span className="truncate max-w-[120px]">{claim.pending_reason}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{claim.pending_reason}</p>
                                      {claim.department?.name && (
                                        <p className="font-semibold mt-1">
                                          With: {claim.department?.name} ({claim.assignment?.assessor?.name})
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.submitted_at), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(claim.submitted_at), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openClaimDetails(claim)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsAssignDialogOpen(true)
                                    }}
                                  >
                                    Assign Claim
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsNotesDialogOpen(true)
                                    }}
                                  >
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/dashboard/insurer/claims/${claim.id}/analysis`)
                                    }}
                                  >
                                    AI Analysis
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No approved claims found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Claim ID</TableHead>
                      <TableHead>Vehicle & Driver</TableHead>
                      <TableHead>Incident Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedClaims.length > 0 ? (
                      completedClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{claim.id}</span>
                              <span className="text-xs text-muted-foreground">{claim.policy_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {claim.vehicles[0]?.make} {claim.vehicles[0]?.model}
                              </span>
                              <span className="text-xs">{claim.vehicles[0]?.license_plate}</span>
                              <span className="text-xs text-muted-foreground mt-1">{claim.driver_details?.user?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.accident_date), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{claim.location}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {claim.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">{getStatusBadge(claim.status)}</div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.submitted_at), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(claim.submitted_at), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openClaimDetails(claim)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsNotesDialogOpen(true)
                                    }}
                                  >
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/dashboard/insurer/claims/${claim.id}/analysis`)
                                    }}
                                  >
                                    AI Analysis
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No completed claims found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Claim ID</TableHead>
                      <TableHead>Vehicle & Driver</TableHead>
                      <TableHead>Incident Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedClaims.length > 0 ? (
                      rejectedClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{claim.id}</span>
                              <span className="text-xs text-muted-foreground">{claim.policy_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {claim.vehicles[0]?.make} {claim.vehicles[0]?.model}
                              </span>
                              <span className="text-xs">{claim.vehicles[0]?.license_plate}</span>
                              <span className="text-xs text-muted-foreground mt-1">{claim.driver_details?.user?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.accident_date), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{claim.location}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {claim.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">{getStatusBadge(claim.status)}</div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.submitted_at), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(claim.submitted_at), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openClaimDetails(claim)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsNotesDialogOpen(true)
                                    }}
                                  >
                                    Add Note
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No rejected claims found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multi-signature">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Multi-Signature Claims</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Claims that require approval from multiple parties.
                  </p>
                  <Button onClick={() => router.push("/dashboard/insurer/multi-signature-claims")}>
                    View Multi-Signature Claims
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Claim Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedClaim && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl">Claim #{selectedClaim.code}</DialogTitle>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(selectedClaim.priority)}
                      {getStatusBadge(selectedClaim.status)}
                    </div>
                  </div>
                  <DialogDescription>
                    <span className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
                      <span>
                        Policy: <span className="font-medium">{selectedClaim.policy_number}</span> • Submitted:{" "}
                        {format(new Date(selectedClaim.submitted_at), "MMM d, yyyy h:mm a")}
                      </span>
                      {selectedClaim.department?.name && (
                        <span className="flex items-center mt-2 sm:mt-0">
                          <span className="text-muted-foreground mr-1">{selectedClaim.status} :</span>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getResponsibleIcon(selectedClaim.department?.name)}
                           
                              {selectedClaim.department?.name} ({selectedClaim.assignment?.assessor?.name})
                           
                          </Badge>
                        </span>
                      )}
                    </span>
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Claim Details</TabsTrigger>
                    <TabsTrigger value="documents">Documents ({selectedClaim.documents.length})</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="notes">Notes ({selectedClaim.notes.length})</TabsTrigger>
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
                                {selectedClaim.vehicles[0]?.make} {selectedClaim.vehicles[0]?.model} ({selectedClaim.vehicles[0]?.year}
                                )
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Plate Number:</div>
                              <div>{selectedClaim.vehicles[0]?.license_plate}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Color:</div>
                              <div>{selectedClaim.vehicles[0]?.color}</div>
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
                              <div>{selectedClaim.driver_details[0]?.user?.name || selectedClaim.user?.name}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Phone:</div>
                              <div>{selectedClaim.driver_details[0]?.user?.phone || selectedClaim.user?.phone}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">License Number:</div>
                              <div>{selectedClaim.driver_details[0]?.license_number}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">License Category:</div>
                              <div>{selectedClaim.driver_details[0]?.license_category}</div>
                            </div>
                          </div>
                        </div>
                        {selectedClaim.garages && selectedClaim.garages.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center">
                              <Wrench className="h-4 w-4 mr-2" /> Garage Information
                            </h3>
                            {selectedClaim.garages.map((garage: Garage) => (
                              <div key={garage.id} className="bg-muted p-3 rounded-md space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-muted-foreground">Name:</div>
                                  <div>{garage.name}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-muted-foreground">Address:</div>
                                  <div>{garage.address}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-muted-foreground">Phone:</div>
                                  <div>{garage.phone}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold mb-2 flex items-center">
                            <CalendarClock className="h-4 w-4 mr-2" /> Accident Information
                          </h3>
                          <div className="bg-muted p-3 rounded-md space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Date & Time:</div>
                              <div>
                                {format(new Date(selectedClaim.accident_date), "MMM d, yyyy")} at{" "}
                                {selectedClaim.accident_time}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Location:</div>
                              <div>{selectedClaim.location}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Police Report:</div>
                              <div>
                                {selectedClaim.police_assignment?.length ? (
                                  <span className="text-green-600">Yes</span>
                                ) : (
                                  <span className="text-red-600">No</span>
                                )}
                              </div>
                            </div>
                            {selectedClaim.police_assignment && selectedClaim.police_assignement.length > 0 && (
                              selectedClaim.police_assignment?.map((police_report: PoliceReport) => (
                                <>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Police Station:</div>
                                    <div>{police_report.police_station}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Report Number:</div>
                                    <div>{police_report.police_report_number}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Police Officer Name:</div>
                                    <div>{police_report.police_officer_name}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Police Officer Phone:</div>
                                    <div>{police_report.police_officer_phone}</div>
                                  </div>
                                </>))
                            )}
                            <div className="text-sm mt-2">
                              <div className="text-muted-foreground mb-1">Description:</div>
                              <div className="text-sm">{selectedClaim.description}</div>
                            </div>
                          </div>
                        </div>

                        {selectedClaim.otherVehicles && selectedClaim.otherVehicles.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center">
                              <Car className="h-4 w-4 mr-2" /> Other Vehicles Involved
                            </h3>
                            <div className="bg-muted p-3 rounded-md space-y-3">
                              {selectedClaim.otherVehicles.map((vehicle: any, index: number) => (
                                <div key={index} className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Make & Model:</div>
                                    <div>
                                      {vehicle.make} {vehicle.model}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Plate Number:</div>
                                    <div>{vehicle.license_plate}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Owner:</div>
                                    <div>{vehicle.owner}</div>
                                    <div><small>Address: {vehicle.owner_address}</small></div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Insurer:</div>
                                    <div>
                                      {vehicle.insurer_name} ({vehicle.policy_number})
                                    </div>
                                  </div>
                                  {index < selectedClaim.otherVehicles.length - 1 && <Separator className="my-2" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedClaim.injuries && selectedClaim.injuries.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" /> Injuries
                            </h3>
                            <div className="bg-muted p-3 rounded-md space-y-3">
                              {selectedClaim.injuries.map((injury: any, index: number) => (
                                <div key={index} className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Person:</div>
                                    <div>
                                      {injury.name} <br /> ({injury.age} yrs)
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Is Dead?:</div>
                                    <div>{injury.is_deceased ? 'Yes' : 'No'}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Description:</div>
                                    <div>{injury.injury_description}</div>
                                  </div>
                                  {index < selectedClaim.injuries.length - 1 && <Separator className="my-2" />}
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
                              <TableHead>Property owner</TableHead>
                              <TableHead>Damage Type</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Estimated Cost (RWF)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedClaim.damages.map((damage: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{damage.owner_name}</TableCell>
                                <TableCell>{damage.type}</TableCell>
                                <TableCell>{damage.description}</TableCell>
                                <TableCell className="text-right">{damage.estimated_cost.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={2} className="font-semibold text-right">
                                Total Estimated Cost:
                              </TableCell>
                              <TableCell className="font-semibold text-right">
                                {selectedClaim.damages
                                  .reduce((sum: number, damage: any) => sum + damage.estimated_cost, 0)
                                  .toLocaleString()}{" "}
                                RWF
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
                        {selectedClaim.documents.map((doc: any, index: number) => (
                          <Card key={index} className="overflow-hidden">
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

                                  <img
                                    src={`${STORAGES_URL + doc.file_path}`}
                                    alt={`Document: ${doc.category?.name} ${doc.mime_type}`}
                                    className="object-cover w-full h-full"
                                  />
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
                                  <Button variant="ghost" size="icon" onClick={() => window.open(STORAGES_URL + doc.file_path, "_blank")}
                                    aria-label={`Download ${doc.category?.name} ${doc.mime_type}`}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Uploaded: {format(new Date(doc.created_at), "yyyy-MM-dd")}</div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline">
                    <div className="space-y-4">
                      {selectedClaim.timeline?.map((item: any, index: number) => (
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
                      {selectedClaim.notes.length > 0 ? (
                        selectedClaim.notes?.map((note: any, index: number) => (
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
                          <p className="text-muted-foreground">No notes have been added to this claim yet.</p>
                        </div>
                      )}
                      <Button onClick={() => setIsNotesDialogOpen(true)} className="w-full">
                        Add Note
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start flex-1">
                    <Button variant="outline" onClick={() => setIsAssignDialogOpen(true)}>
                      Assign
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Update Status <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Pending Review")}>
                          Pending Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Assessment Scheduled")}>
                          Assessment Scheduled
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Investigation")}>
                          Investigation
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Repair Approved")}>
                          Repair Approved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Completed")}>Completed</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Rejected")}>Rejected</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={handleAIAnalysis}>
                      <Brain className="mr-2 h-4 w-4" /> AI Analysis
                    </Button>
                  </div>
                  <Button variant="default" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

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
                            defaultValue={departments?.[0]?.id?.toString()}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select assigned department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments?.map((department) => (
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
      </div>
    </DashboardLayout>
  )
}
