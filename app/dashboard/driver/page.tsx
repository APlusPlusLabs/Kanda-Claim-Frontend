"use client"

import { JSX, useCallback, useEffect, useState } from "react";
import Link from "next/link"; // Corrected from "@/Next.js/link" to standard Next.js import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, FileText, MessageSquare, Bell, User, LogOut, Plus, Clock, CheckCircle2, XCircle, FileImage, Search, Filter, Download, FileSpreadsheet, AlertTriangle, Eye } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useRouter } from "next/navigation";



const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";

interface Vehicle {
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
  assessments?: any[];
  activities: Activity[];
  insurer: { name: string };
  progress: number;
  created_at?: string;
  updated_at?: string;
}

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
    value: "active",
    label: "Active",
    filter: (claim: Claim) => ["Draft", "Submitted", "Under Review", "Approved"].includes(claim.status),
    emptyState: {
      icon: <Clock className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Active Claims",
      message: "You don't have any active insurance claims at the moment.",
    },
  },
  {
    value: "completed",
    label: "Completed",
    filter: (claim: Claim) => claim.status === "Closed", // Map "Closed" to "Completed"
    emptyState: {
      icon: <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Completed Claims",
      message: "You don't have any completed insurance claims yet.",
    },
  },
  {
    value: "rejected",
    label: "Rejected",
    filter: (claim: Claim) => claim.status === "Rejected",
    emptyState: {
      icon: <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />,
      title: "No Rejected Claims",
      message: "You don't have any rejected insurance claims.",
    },
  },
];



// const [notifications, setNotifications] = useState([
//   {
//     id: 1,
//     message: "Your claim CL-2025-001 has been approved for assessment.",
//     time: "2 hours ago",
//     read: false,
//   },
//   {
//     id: 2,
//     message: "Garage 'Kigali Auto Services' has submitted a repair quote for your vehicle.",
//     time: "1 day ago",
//     read: true,
//   },
//   {
//     id: 3,
//     message: "Your claim CL-2025-002 requires additional documentation.",
//     time: "2 days ago",
//     read: false,
//   },
// ])
export default function DriverDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, apiRequest } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

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

      case "Closed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
      (statusFilter === "active" && ["Draft", "Submitted", "Under Review", "Approved"].includes(claim.status)) ||
      (statusFilter === "completed" && claim.status === "Closed") ||

      (statusFilter === "rejected" && claim.status === "Rejected");

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
    router.push(`/dashboard/driver/claims/${claim.id}`)
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-10 w-1/4 rounded"></div>
        <div className="animate-pulse bg-muted h-64 w-full rounded"></div>
      </div>
    );
  }

// Reusable ClaimsTabContent component
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

  return (
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
                {!isCompletedOrRejected && (
                  <Button size="sm" onClick={() => router.push(`/dashboard/driver/claims/edit/${claim.id}`)}>
                    <FileText className="mr-2 h-4 w-4" /> Update Claim
                  </Button>
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
  );
}

  return (
    <DashboardLayout
      user={{
        name: user.name,
        role: user?.role.name+" @ "+ user.tenant.name,
        avatar: user?.avatar ? user?.avatar : "/placeholder.svg?height=40&width=40",
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
    // actions={[
    //   {
    //     name: t("action.new_claim"),
    //     href: "/dashboard/driver/claims/new",
    //     icon: <Plus className="h-5 w-5" />,
    //     translationKey: "action.new_claim",
    //   },
    //   { name: t("nav.logout"), href: "/logout", icon: <LogOut className="h-5 w-5" />, translationKey: "nav.logout" },
    // ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{user?.name} Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome Back!</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/driver/claims/new">
              <Plus className="mr-2 h-4 w-4" /> New Claim
            </Link>
          </Button>
        </div>

        {/* Status Cards */}
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


      </div>
    </DashboardLayout>
  )
}
