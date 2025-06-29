"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  ChevronDown,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

interface RepairJob {
  id: string;
  code: string;
  claim_id: string;
  claim_code: string;
  vehicle: {
    make: string;
    model: string;
    year: string;
    license_plate: string;
  };
  customer: {
    name: string;
  };
  insurer: string;
  status: string;
  start_date: string | null;
  estimated_amount: number;
  progress?: number;
  final_amount?: number;
  payment_status?: string;
}

const estimateSchema = z.object({
  proposed_cost: z.coerce.number().min(0, "Proposed cost must be non-negative"),
});

const progressSchema = z.object({
  progress: z.coerce.number().min(0, "Progress must be between 0 and 100").max(100, "Progress must be between 0 and 100"),
});

type EstimateFormValues = z.infer<typeof estimateSchema>;
type ProgressFormValues = z.infer<typeof progressSchema>;

export function RepairsTable() {
  const router = useRouter();
  const { user, apiRequest } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("start_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [estimateDialogOpen, setEstimateDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairJob | null>(null);

  const estimateForm = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      proposed_cost: 0,
    },
  });

  const progressForm = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      progress: 0,
    },
  });

  useEffect(() => {
    const fetchRepairs = async () => {
      if (!user?.tenant_id || !user?.garage_id ) {
        console.error("Missing user data:", { tenant_id: user?.tenant_id, garage_id: user?.garage_id});
        toast({
          title: "Authentication Error",
          description: "User or garage information is missing.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching repairs from:", `${API_URL}repair-jobs/${user.tenant_id}/${user.garage_id}`);
        const response = await apiRequest(
          `${API_URL}repair-jobs/${user.tenant_id}/${user.garage_id}`,
          "GET");
        console.log("Repairs response:", response);
        setRepairs(response);
      } catch (error: any) {
        console.error("Error fetching repairs:", error);
        toast({
          title: "Error Loading Repairs",
          description: error.response?.data?.message || "Failed to load repairs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRepairs();
  }, [user, toast]);

  const handleUpdateEstimate = async (values: EstimateFormValues) => {
    if (!selectedRepair || !user?.tenant_id) return;

    try {
      const response = await apiRequest(
        `${API_URL}repair-jobs/${selectedRepair.id}/estimate`,
        "PUT",
        {
          tenant_id: user.tenant_id,
          proposed_cost: values.proposed_cost,
        });

      setRepairs((prev) =>
        prev.map((job) =>
          job.id === selectedRepair.id
            ? { ...job, estimated_amount: response.repair_job.estimated_amount }
            : job
        )
      );

      toast({
        title: "Estimate Updated",
        description: "The repair estimate has been updated successfully.",
      });
      setEstimateDialogOpen(false);
      estimateForm.reset();
      setSelectedRepair(null);
    } catch (error: any) {
      console.error("Error updating estimate:", error);
      toast({
        title: "Error Updating Estimate",
        description: error.response?.data?.message || "Failed to update estimate.",
        variant: "destructive",
      });
    }
  };

  const handleStartRepair = async (repair: RepairJob) => {
    if (!user?.tenant_id) return;

    try {
      const response = await apiRequest(
        `${API_URL}repair-jobs/${repair.id}/status`,
        "PUT",
        {
          tenant_id: user.tenant_id,
          status: "in_progress",
        });

      setRepairs((prev) =>
        prev.map((job) =>
          job.id === repair.id
            ? {
                ...job,
                status: response.repair_job.status,
                start_date: response.repair_job.start_date,
                progress: response.repair_job.progress,
              }
            : job
        )
      );

      toast({
        title: "Repair Started",
        description: "The repair job has been started successfully.",
      });
    } catch (error: any) {
      console.error("Error starting repair:", error);
      toast({
        title: "Error Starting Repair",
        description: error.response?.data?.message || "Failed to start repair.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProgress = async (values: ProgressFormValues) => {
    if (!selectedRepair || !user?.tenant_id) return;

    try {
      const response = await apiRequest(
        `${API_URL}repair-jobs/${selectedRepair.id}/progress`,
        "PUT",
        {
          tenant_id: user.tenant_id,
          progress: values.progress,
        });

      setRepairs((prev) =>
        prev.map((job) =>
          job.id === selectedRepair.id
            ? {
                ...job,
                status: response.repair_job.status,
                progress: response.repair_job.progress,
                final_amount: response.repair_job.final_amount,
                payment_status: response.repair_job.payment_status,
              }
            : job
        )
      );

      toast({
        title: "Progress Updated",
        description: "The repair progress has been updated successfully.",
      });
      setProgressDialogOpen(false);
      progressForm.reset();
      setSelectedRepair(null);
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error Updating Progress",
        description: error.response?.data?.message || "Failed to update progress.",
        variant: "destructive",
      });
    }
  };

  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch =
      repair.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.claim_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${repair.vehicle.make} ${repair.vehicle.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.insurer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "awaiting_approval" && repair.status === "awaiting_approval") ||
      (statusFilter === "approved" && repair.status === "approved") ||
      (statusFilter === "in_progress" && repair.status === "in_progress") ||
      (statusFilter === "completed" && repair.status === "completed");

    return matchesSearch && matchesStatus;
  });

  const sortedRepairs = [...filteredRepairs].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case "start_date":
        aValue = a.start_date ? new Date(a.start_date).getTime() : 0;
        bValue = b.start_date ? new Date(b.start_date).getTime() : 0;
        break;
      case "code":
        aValue = a.code;
        bValue = b.code;
        break;
      case "claim_id":
        aValue = a.claim_id;
        bValue = b.claim_id;
        break;
      default:
        aValue = a[sortField];
        bValue = b[sortField];
    }

    if (aValue == null) return -1;
    if (bValue == null) return 1;

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Search repairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mr-2"
          />
          <Search className="h-4 w-4 text-gray-500 mr-4" />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Filter className="h-4 w-4 text-gray-500 ml-4" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 ml-auto">
              Sort By <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setSortField("start_date");
                setSortDirection(sortField === "start_date" && sortDirection === "asc" ? "desc" : "asc");
              }}
            >
              Start Date {sortField === "start_date" && (sortDirection === "asc" ? "▲" : "▼")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortField("code");
                setSortDirection(sortField === "code" && sortDirection === "asc" ? "desc" : "asc");
              }}
            >
              Repair Code {sortField === "code" && (sortDirection === "asc" ? "▲" : "▼")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortField("claim_id");
                setSortDirection(sortField === "claim_id" && sortDirection === "asc" ? "desc" : "asc");
              }}
            >
              Claim ID {sortField === "claim_id" && (sortDirection === "asc" ? "▲" : "▼")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repair Code</TableHead>
              <TableHead>Claim ID</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Insurer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={`loading-client-${index}`}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
            ) : sortedRepairs.length > 0 ? (
              sortedRepairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell>{repair.code}</TableCell>
                  <TableCell>{repair.claim_code}</TableCell>
                  <TableCell>
                    {repair.vehicle.make} {repair.vehicle.model} ({repair.vehicle.license_plate})
                  </TableCell>
                  <TableCell>{repair.customer.name}</TableCell>
                  <TableCell>{repair.insurer}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        repair.status === "awaiting_approval" ? "destructive" :
                        repair.status === "approved" ? "secondary" :
                        repair.status === "in_progress" ? "warning" :
                        repair.status === "completed" ? "success" : "default"
                      }
                    >
                      {repair.status.charAt(0).toUpperCase() + repair.status.replace("_", " ").slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{repair.start_date ? format(new Date(repair.start_date), "yyyy-MM-dd") : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/garage/repairs/${repair.id}`)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {repair.status === "awaiting_approval" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRepair(repair);
                              estimateForm.setValue("proposed_cost", repair.estimated_amount);
                              setEstimateDialogOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" /> Update Estimate
                          </DropdownMenuItem>
                        )}
                        {repair.status === "approved" && (
                          <DropdownMenuItem onClick={() => handleStartRepair(repair)}>
                            <User className="h-4 w-4 mr-2" /> Start Repair
                          </DropdownMenuItem>
                        )}
                        {repair.status === "in_progress" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRepair(repair);
                              progressForm.setValue("progress", repair.progress || 0);
                              setProgressDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" /> Update Progress
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  No repairs found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Estimate Dialog */}
      <Dialog open={estimateDialogOpen} onOpenChange={setEstimateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Estimate</DialogTitle>
            <DialogDescription>Enter the new estimated cost for the repair job.</DialogDescription>
          </DialogHeader>
          <Form {...estimateForm}>
            <form onSubmit={estimateForm.handleSubmit(handleUpdateEstimate)} className="space-y-4">
              <FormField
                control={estimateForm.control}
                name="proposed_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposed Cost (RWF)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setEstimateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>Enter the current progress percentage for the repair job.</DialogDescription>
          </DialogHeader>
          <Form {...progressForm}>
            <form onSubmit={progressForm.handleSubmit(handleUpdateProgress)} className="space-y-4">
              <FormField
                control={progressForm.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setProgressDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}