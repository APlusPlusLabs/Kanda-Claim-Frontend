"use client";

import { JSX, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  Building,
  MapPin,
  DollarSign,
  EyeOff
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

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
  MessageSquare,
  Bell,
  User,
  LogOut, Star, Edit3
} from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackModal";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { format } from "date-fns";
import router from "next/router";
import { useLanguage } from "@/lib/language-context";
import { Claim } from "@/lib/types/claims";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "/storage/";


// Define status configuration
const statusConfig = [
  {
    value: "all",
    label: "All Claims",
    filter: (claim: Claim) => true,
    emptyState: {
      icon: <FileText className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Claims Found",
      message: "You don't have any claims matching your search criteria.",
    },
  },
  {
    value: "draft",
    label: "Draft",
    filter: (claim: Claim) => claim.status.toLocaleLowerCase() === "draft",
    emptyState: {
      icon: <Clock className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Draft Claims",
      message: "You don't have any draft insurance claims at the moment.",
    },
  },
  {
    value: "submitted",
    label: "Submitted",
    filter: (claim: Claim) => (claim.status.toLocaleLowerCase() === "submitted"),
    emptyState: {
      icon: <Clock className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Submitted Claims",
      message: "You don't have any submitted insurance claims at the moment.",
    },
  },
  {
    value: "underReview",
    label: "Under Review",
    filter: (claim: Claim) => claim.status.toLocaleLowerCase() === "under review",
    emptyState: {
      icon: <Clock className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Under Review Claims",
      message: "You don't have any under review insurance claims at the moment.",
    },
  },
  {
    value: "approved",
    label: "Approved",
    filter: (claim: Claim) => claim.status.toLocaleLowerCase() === "approved",
    emptyState: {
      icon: <Clock className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Approved Claims",
      message: "You don't have any approved insurance claims at the moment.",
    },
  },
  {
    value: "active",
    label: "Active",
    filter: (claim: Claim) => ["Draft", "Submitted", "Under Review", "Approved", "draft", "submitted", "under review", "approved"].includes(claim.status),
    emptyState: {
      icon: <Clock className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Active Claims",
      message: "You don't have any active insurance claims at the moment.",
    },
  },
  {
    value: "completed",
    label: "Completed",
    filter: (claim: Claim) => claim.status.toLocaleLowerCase() === "completed",
    emptyState: {
      icon: <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Completed Claims",
      message: "You don't have any completed insurance claims yet.",
    },
  },
  {
    value: "rejected",
    label: "Rejected",
    filter: (claim: Claim) => claim.status.toLocaleLowerCase() === "rejected",
    emptyState: {
      icon: <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Rejected Claims",
      message: "You don't have any rejected insurance claims.",
    },
  },
];

function ClaimsTabContent({
  claims,
  status,
  emptyState,
  openClaimDetails,
  getStatusBadge,
}: {
  claims: Claim[];
  status: string;
  emptyState: { icon: JSX.Element; title: string; message: string };
  openClaimDetails: (claim: Claim) => void;
  getStatusBadge: (status: string) => JSX.Element;
}) {
  const isCompletedOrRejected = ["completed", "rejected"].includes(status);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const openFeedbackModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setFeedbackModalOpen(true);
  };

  return (
    <>
      <TabsContent value={status} className="space-y-4">
        {claims.length > 0 ? (
          claims.map((claim) => (
            <Card key={claim.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Claim #{claim.code ?? "N/A"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {claim.vehicles?.[0]?.model ?? "N/A"} {claim.vehicles?.[0]?.make ?? ""} - {claim.vehicles?.[0]?.year ?? ""} (
                      {claim.vehicles?.[0]?.license_plate ?? "N/A"}) •{" "}
                      {claim.accident_date && claim.accident_time
                        ? `${format(new Date(claim.accident_date), "yyyy-MM-dd")} at ${claim.accident_time}`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    {isCompletedOrRejected ? (
                      status === "completed" ? (
                        <Badge className="w-fit bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                        </Badge>
                      ) : (
                        <Badge className="w-fit" variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" /> Rejected
                        </Badge>
                      )
                    ) : (
                      getStatusBadge(claim.status)
                    )}
                  </div>
                </div>

                <p className="text-sm mb-4">{claim.description ?? "No description available"}</p>

                {/* Show existing feedback for completed claims */}
                {status === "completed" && claim.feedback && (
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Your Feedback</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= claim.feedback.overall_rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                              }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({claim.feedback.overall_rating}/5)
                        </span>
                      </div>
                    </div>
                    {claim.feedback.feedback_text && (
                      <p className="text-sm text-muted-foreground mb-2">
                        "{claim.feedback.feedback_text}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Submitted on {format(new Date(claim.feedback.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}

                {!isCompletedOrRejected && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{claim.progress ?? 0}%</span>
                    </div>
                    <Progress value={claim.progress ?? 0} className="h-2" />
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Insurer:</span> {claim.insurer?.name ?? "N/A"}
                  </div>
                  {!status.includes("rejected") && (
                    <div className="text-sm mt-2 md:mt-0">
                      <span className="text-muted-foreground">
                        {status === "completed" ? "Final Amount:" : "Estimated Amount:"}
                      </span>{" "}
                      {(claim.amount ?? 0).toLocaleString()} {claim.currency ?? "N/A"}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openClaimDetails(claim)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Button>

                  {/* Feedback button for completed claims */}
                  {status === "completed" && (
                    <Button
                      variant={claim.feedback ? "outline" : "default"}
                      size="sm"
                      onClick={() => openFeedbackModal(claim)}
                    >
                      {claim.feedback ? (
                        <>
                          <Edit3 className="mr-2 h-4 w-4" /> Edit Feedback
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" /> Rate Experience
                        </>
                      )}
                    </Button>
                  )}

                  {!isCompletedOrRejected && (
                    <Link href={`/dashboard/driver/claims/edit/${claim.id}`}>
                      <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Update Claim
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                {emptyState.icon}
                <h3 className="text-lg font-semibold mb-2">{emptyState.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{emptyState.message}</p>
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

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        claim={selectedClaim}
        onFeedbackSubmitted={() => {
          window.location.reload(); 
        }}
      />
    </>
  );
}

export default function DriverClaimsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, apiRequest } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState<Claim | undefined>(undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  
const [timelineExpanded, setTimelineExpanded] = useState(false);
const [documentsExpanded, setDocumentsExpanded] = useState(false);
const [showAllActivities, setShowAllActivities] = useState(false);

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
      console.error("Error fetching claims:", error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, toast, user?.id]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <Badge className="bg-gray-500">Draft</Badge>;
      case "Submitted":
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case "Under Review":
        return <Badge className="bg-yellow-500">Under Review</Badge>;
      case "Approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "Closed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTimelineStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-300" />;
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage className="h-5 w-5 text-blue-500" />;
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Filter claims based on search query and status filter
  const filteredClaims = claims.filter((claim) => {
    const vehicle = claim.vehicles?.[0];
    const matchesSearch =
      searchQuery === "" ||
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle?.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && ["Draft", "draft", "Submitted", "submitted", "Under Review", "Approved", "approved"].includes(claim.status)) ||
      (statusFilter === "completed" && claim.status.toLocaleLowerCase() === "closed") ||
      (statusFilter === "draft" || claim.status.toLocaleLowerCase() === "draft") ||
      (statusFilter === "submitted" || claim.status.toLocaleLowerCase() === "submitted") ||
      (statusFilter === "underReview" || claim.status.toLocaleLowerCase() === "Under Review") ||
      (statusFilter === "approved" || claim.status.toLocaleLowerCase() === "approved") ||
      (statusFilter === "rejected" || claim.status.toLocaleLowerCase() === "rejected");

    return matchesSearch && matchesStatus;
  });

  // Calculate claim counts for each status
  const claimCounts = statusConfig.reduce(
    (acc, status) => ({
      ...acc,
      [status.value]: filteredClaims.filter(status.filter).length,
    }),
    {} as Record<string, number>
  );

  const openClaimDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDetailsOpen(true);
  };

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
        name: user?.name ?? "Unknown",
        role: "Driver",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        {
          name: `Kanda Claim - ${t("nav.dashboard")}`,
          href: "/dashboard/driver",
          icon: <Car className="h-5 w-5" />,
          translationKey: "nav.dashboard",
        },
        {
          name: t("nav.claims"),
          href: "/dashboard/driver/claims",
          icon: <FileText className="h-5 w-5" />,
          translationKey: "nav.claims",
        },
        {
          name: t("nav.messages"),
          href: "/dashboard/driver/messages",
          icon: <MessageSquare className="h-5 w-5" />,
          translationKey: "nav.messages",
        },
        {
          name: t("nav.notifications"),
          href: "/dashboard/driver/notifications",
          icon: <Bell className="h-5 w-5" />,
          translationKey: "nav.notifications",
        },
        {
          name: t("nav.profile"),
          href: "/dashboard/driver/profile",
          icon: <User className="h-5 w-5" />,
          translationKey: "nav.profile",
        }, { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }
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
                  {statusConfig.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statusConfig
            .filter((status) => ["draft", "submitted", "approved", "underReview"].includes(status.value))
            .map((status) => (
              <Card key={status.value}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{status.label} Claims</CardTitle>
                  <div className="text-2xl font-bold">{claimCounts[status.value]}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Claims {status.label.toLowerCase().replace("under review", "still under review")}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusConfig
            .filter((status) => ["active", "completed", "rejected"].includes(status.value))
            .map((status) => (
              <Card key={status.value}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{status.label} Claims</CardTitle>
                  <div className="text-2xl font-bold">{claimCounts[status.value]}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {status.value === "active"
                      ? "Claims in progress"
                      : status.value === "completed"
                        ? "Successfully processed claims"
                        : "Claims that were not approved"}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Dynamic Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            {statusConfig.map((status) => (
              <TabsTrigger key={status.value} value={status.value}>
                {status.label} ({claimCounts[status.value]})
              </TabsTrigger>
            ))}
          </TabsList>
          {statusConfig.map((status) => (
            <ClaimsTabContent
              key={status.value}
              claims={filteredClaims.filter(status.filter)}
              status={status.value}
              emptyState={status.emptyState}
              openClaimDetails={openClaimDetails}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </Tabs>

        {/* Claim Details Dialog */}
        {/* <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            {selectedClaim && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Claim #{selectedClaim.code ?? "N/A"}</span>
                    {getStatusBadge(selectedClaim.status)}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedClaim.vehicles?.[0]?.model ?? "N/A"} {selectedClaim.vehicles?.[0]?.make ?? ""} -{" "}
                    {selectedClaim.vehicles?.[0]?.year ?? ""} ({selectedClaim.vehicles?.[0]?.license_plate ?? "N/A"})
                    <br /> • Incident happened on{" "}
                    {selectedClaim.accident_date ? format(new Date(selectedClaim.accident_date), "yyyy-MM-dd") : "N/A"} at{" "}
                    {selectedClaim.accident_time ?? "N/A"}
                    <br /> • Submitted on {selectedClaim.created_at ? format(new Date(selectedClaim.created_at), "yyyy-MM-dd") : "N/A"}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Claim Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Insurer:</span>
                        <span>{selectedClaim.insurer?.name ?? "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{selectedClaim.status ?? "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {selectedClaim.status === "Closed" ? "Final Amount:" : "Estimated Amount:"}
                        </span>
                        <span>
                          {(selectedClaim.amount ?? 0).toLocaleString()} {selectedClaim.currency ?? "N/A"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-medium mt-4 mb-2">Description</h3>
                    <p className="text-sm">{selectedClaim.description ?? "No description available"}</p>

                    <h3 className="text-sm font-medium mt-4 mb-2">Documents</h3>
                    <div className="space-y-2">
                      {selectedClaim.documents?.length > 0 ? (
                        selectedClaim.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              {getDocumentIcon(doc.mime_type)}
                              <span className="ml-2">{doc.category?.name} {doc.mime_type}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.file_path, "_blank")}
                              aria-label={`Download ${doc.file_name}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No documents available</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Claim Timeline</h3>
                    <div className="space-y-4">
                      {selectedClaim.activities?.length > 0 ? (
                        selectedClaim.activities.map((item) => (
                          <div key={item.id} className="flex">
                            <div className="mr-3">{getTimelineStatusIcon(item.status)}</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.event}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.created_at ? format(new Date(item.created_at), "yyyy-MM-dd") : "N/A"}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No timeline events available</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  {selectedClaim.status !== "Closed" && selectedClaim.status !== "Rejected" && (
                    <Link href={`/dashboard/driver/claims/edit/${selectedClaim.id}`}>
                      <Button>
                        <FileText className="mr-2 h-4 w-4" /> Update Claim
                      </Button>
                    </Link>
                  )}
                  <Link href={`/dashboard/driver/claims/${selectedClaim.id}`}>
                    <Button variant="secondary">
                      <FileText className="mr-2 h-4 w-4" /> Full Info on Claim
                    </Button></Link>
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog> */}


<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
    {selectedClaim && (
      <>
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <span>Claim #{selectedClaim.code ?? "N/A"}</span>
            {getStatusBadge(selectedClaim.status)}
          </DialogTitle>
          <DialogDescription className="text-left">
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4" />
              {selectedClaim.vehicles?.[0]?.model ?? "N/A"} {selectedClaim.vehicles?.[0]?.make ?? ""} -{" "}
              {selectedClaim.vehicles?.[0]?.year ?? ""} ({selectedClaim.vehicles?.[0]?.license_plate ?? "N/A"})
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Calendar className="h-4 w-4" />
              Incident: {selectedClaim.accident_date ? format(new Date(selectedClaim.accident_date), "MMM dd, yyyy") : "N/A"} at {selectedClaim.accident_time ?? "N/A"}
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Clock className="h-4 w-4" />
              Submitted: {selectedClaim.created_at ? format(new Date(selectedClaim.created_at), "MMM dd, yyyy") : "N/A"}
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          
          {/* Key Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Insurer</span>
              </div>
              <p className="text-sm">{selectedClaim.insurer?.name ?? "N/A"}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">
                  {selectedClaim.status === "completed" ? "Final Amount" : "Estimated Amount"}
                </span>
              </div>
              <p className="text-sm font-semibold">
                {(selectedClaim.amount ?? 0).toLocaleString()} {selectedClaim.currency ?? "N/A"}
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <p className="text-sm">{selectedClaim.location ?? "N/A"}</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Incident Description
            </h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm leading-relaxed">
                {selectedClaim.description ?? "No description available"}
              </p>
            </div>
          </div>

          {/* Progress Section - Only for non-completed claims */}
          {!["completed", "rejected"].includes(selectedClaim.status) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span>{selectedClaim.progress ?? 0}%</span>
                </div>
                <Progress value={selectedClaim.progress ?? 0} className="h-2" />
              </div>
            </div>
          )}

          {/* Documents Section - Collapsible */}
          <Collapsible open={documentsExpanded} onOpenChange={setDocumentsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents ({selectedClaim.documents?.length ?? 0})
                </h3>
                {documentsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {selectedClaim.documents?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedClaim.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getDocumentIcon(doc.mime_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.category?.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.mime_type}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.file_path, "_blank")}
                        aria-label={`Download ${doc.file_name}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No documents available</p>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Timeline Section - Collapsible with Show More/Less */}
          <Collapsible open={timelineExpanded} onOpenChange={setTimelineExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Claim Timeline ({selectedClaim.activities?.length ?? 0} activities)
                </h3>
                {timelineExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {selectedClaim.activities?.length > 0 ? (
                <>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border"></div>
                    
                    <div className="space-y-4">
                      {(showAllActivities 
                        ? selectedClaim.activities 
                        : selectedClaim.activities.slice(0, 3)
                      ).map((item, index) => (
                        <div key={item.id} className="relative flex items-start gap-4">
                          {/* Timeline dot */}
                          <div className="relative z-10 flex-shrink-0">
                            <div className="w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                              {getTimelineStatusIcon(item.status)}
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-4">
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{item.event}</p>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                  )}
                                  {item.user && (
                                    <div className="flex items-center gap-1 mt-2">
                                      <User className="h-3 w-3" />
                                      <span className="text-xs text-muted-foreground">{item.user.name}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs text-muted-foreground">
                                    {item.created_at ? format(new Date(item.created_at), "MMM dd") : "N/A"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.created_at ? format(new Date(item.created_at), "HH:mm") : ""}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Show More/Less Button */}
                  {selectedClaim.activities.length > 3 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllActivities(!showAllActivities)}
                        className="text-xs"
                      >
                        {showAllActivities ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Show Less ({selectedClaim.activities.length - 3} hidden)
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Show All ({selectedClaim.activities.length - 3} more)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No timeline events available</p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            {selectedClaim.status !== "completed" && selectedClaim.status !== "rejected" && (
              <Link href={`/dashboard/driver/claims/edit/${selectedClaim.id}`}>
                <Button className="w-full sm:w-auto">
                  <FileText className="mr-2 h-4 w-4" /> Update Claim
                </Button>
              </Link>
            )}
            <Link href={`/dashboard/driver/claims/${selectedClaim.id}`}>
              <Button variant="secondary" className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" /> Full Details
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>
      </div>
    </DashboardLayout>
  );
}