"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wrench, FileText, MessageSquare, Bell, User, LogOut, Clock, CheckCircle2, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

interface RepairJob {
  id: string;
  code: string;
  vehicle: {
    make: string;
    model: string;
    year: string;
    license_plate: string;
  };
  start_date: string;
  status: string;
  customer: {
    name: string;
  };
  insurer: string;
  estimated_amount: number;
  progress?: number;
  final_amount?: number;
  payment_status?: string;
}

// Schemas for dialogs
const estimateSchema = z.object({
  proposed_cost: z.coerce.number().min(0, "Proposed cost must be non-negative"),
});

const progressSchema = z.object({
  progress: z.coerce.number().min(0, "Progress must be between 0 and 100").max(100, "Progress must be between 0 and 100"),
});

type EstimateFormValues = z.infer<typeof estimateSchema>;
type ProgressFormValues = z.infer<typeof progressSchema>;

export default function GarageDashboard() {
  const { user, apiRequest } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [pendingRepairs, setPendingRepairs] = useState<RepairJob[]>([]);
  const [activeRepairs, setActiveRepairs] = useState<RepairJob[]>([]);
  const [completedRepairs, setCompletedRepairs] = useState<RepairJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [estimateDialogOpen, setEstimateDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);

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
    const fetchRepairJobs = async () => {
      if (!user?.tenant_id || !user?.garage_id) {
        console.error("Missing user data:", { tenant_id: user?.tenant_id, garage_id: user?.garage_id });
        toast({
          title: "Authentication Error",
          description: "User or garage information is missing.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
  
      setIsLoading(true);
      try {
        console.log("Fetching repair jobs from:", `${API_URL}/repair-jobs/${user.tenant_id}/${user.garage_id}`);
        const response = await apiRequest(`${API_URL}/repair-jobs/${user.tenant_id}/${user.garage_id}`,"GET");
        console.log("API response:", response);
  
        const pending = response.filter((job: RepairJob) =>
          ["awaiting_approval", "approved"].includes(job.status)
        );
        const active = response.filter((job: RepairJob) => job.status === "in_progress");
        const completed = response.filter((job: RepairJob) => job.status === "completed");
  
        setPendingRepairs(pending);
        setActiveRepairs(active);
        setCompletedRepairs(completed);
      } catch (error: any) {
        console.error("Error fetching repair jobs:", error);
        toast({
          title: "Error Loading Repairs",
          description: error.response?.data?.message || "Failed to load repair jobs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false); // Ensure loading stops
      }
    };
  
    if (user) fetchRepairJobs();
  }, [user, toast]);

  const handleUpdateEstimate = async (values: EstimateFormValues) => {
    if (!selectedRepairId || !user?.tenant_id) return;

    try {
      const response = await apiRequest(
        `${API_URL}/repair-jobs/${selectedRepairId}/estimate`,
        "PUT",
        {
          tenant_id: user.tenant_id,
          proposed_cost: values.proposed_cost,
        });

      setPendingRepairs((prev) =>
        prev.map((job) =>
          job.id === selectedRepairId
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
      setSelectedRepairId(null);
    } catch (error: any) {
      console.error("Error updating estimate:", error);
      toast({
        title: "Error Updating Estimate",
        description: error.response?.data?.message || "Failed to update estimate.",
        variant: "destructive",
      });
    }
  };

  const handleStartRepair = async (repairId: string) => {
    if (!user?.tenant_id) return;

    try {
      const response = await apiRequest(
        `${API_URL}/repair-jobs/${repairId}/status`,
        "PUT",
        {
          tenant_id: user.tenant_id,
          status: "in_progress",
        });

      const updatedJob = {
        ...pendingRepairs.find((job) => job.id === repairId)!,
        status: response.repair_job.status,
        start_date: response.repair_job.start_date,
        progress: response.repair_job.progress,
      };

      setPendingRepairs((prev) => prev.filter((job) => job.id !== repairId));
      setActiveRepairs((prev) => [...prev, updatedJob]);

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
    if (!selectedRepairId || !user?.tenant_id) return;

    try {
      const response = await apiRequest(
        `${API_URL}/repair-jobs/${selectedRepairId}/progress`,
        "PUT",
        {
          tenant_id: user.tenant_id,
          progress: values.progress,
        });

      if (response.repair_job.status === "completed") {
        setActiveRepairs((prev) => prev.filter((job) => job.id !== selectedRepairId));
        setCompletedRepairs((prev) => [
          ...prev,
          {
            ...activeRepairs.find((job) => job.id === selectedRepairId)!,
            status: response.repair_job.status,
            progress: response.repair_job.progress,
            final_amount: response.repair_job.final_amount,
            payment_status: response.repair_job.payment_status,
          },
        ]);
      } else {
        setActiveRepairs((prev) =>
          prev.map((job) =>
            job.id === selectedRepairId
              ? { ...job, progress: response.repair_job.progress }
              : job
          )
        );
      }

      toast({
        title: "Progress Updated",
        description: "The repair progress has been updated successfully.",
      });
      setProgressDialogOpen(false);
      progressForm.reset();
      setSelectedRepairId(null);
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error Updating Progress",
        description: error.response?.data?.message || "Failed to update progress.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        user={{
          name: user?.name,
          role: "Garage",
          avatar: "/placeholder.svg?height=40&width=40",
        }}
        navigation={[
          { name: "Dashboard", href: "/dashboard/garage", icon: <Wrench className="h-5 w-5" /> },
          { name: "Repair Jobs", href: "/dashboard/garage/repairs", icon: <FileText className="h-5 w-5" /> },
          { name: "Bids", href: "/dashboard/garage/bids", icon: <FileText className="h-5 w-5" /> },
          { name: "Messages", href: "/dashboard/garage/messages", icon: <MessageSquare className="h-5 w-5" /> },
          { name: "Notifications", href: "/dashboard/garage/notifications", icon: <Bell className="h-5 w-5" /> },
          { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> },
          { name: "Profile", href: "/dashboard/garage/profile", icon: <User className="h-5 w-5" /> },
        ]}
      >
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={{
        name: user?.name,
        role: "Garage",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/garage", icon: <Wrench className="h-5 w-5" /> },
        { name: "Repair Jobs", href: "/dashboard/garage/repairs", icon: <FileText className="h-5 w-5" /> },
        { name: "Bids", href: "/dashboard/garage/bids", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/garage/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/garage/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/garage/profile", icon: <User className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Garage Dashboard</h1>
          <Button asChild>
            <Link href="/dashboard/garage/repairs">View All Repairs</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Repairs</CardTitle>
              <CardDescription className="text-2xl font-bold">{pendingRepairs.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Awaiting approval or assignment</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Repairs</CardTitle>
              <CardDescription className="text-2xl font-bold">{activeRepairs.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Currently in progress</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {completedRepairs.reduce((sum, repair) => sum + (repair.final_amount || 0), 0).toLocaleString()} RWF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">From completed repairs</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Repairs</TabsTrigger>
            <TabsTrigger value="active">Active Repairs</TabsTrigger>
            <TabsTrigger value="completed">Completed Repairs</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRepairs.length > 0 ? (
              pendingRepairs.map((repair) => (
                <Card key={repair.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Repair #{repair.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {`${repair.vehicle.make} ${repair.vehicle.model} (${repair.vehicle.year})`} •{" "}
                          {new Date(repair.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        className="mt-2 md:mt-0 w-fit"
                        variant={repair.status === "approved" ? "default" : "secondary"}
                      >
                        {repair.status.charAt(0).toUpperCase() + repair.status.slice(1).replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {repair.customer.name}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {repair.insurer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimated Amount:</span>{" "}
                        {repair.estimated_amount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      {repair.status === "awaiting_approval" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRepairId(repair.id);
                            estimateForm.setValue("proposed_cost", repair.estimated_amount);
                            setEstimateDialogOpen(true);
                          }}
                        >
                          Update Estimate
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleStartRepair(repair.id)}>
                          Start Repair
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/garage/repairs/${repair.id}`}>View Details</Link>
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
                    <h3 className="text-lg font-semibold mb-2">No Pending Repairs</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any pending repair requests at the moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeRepairs.length > 0 ? (
              activeRepairs.map((repair) => (
                <Card key={repair.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Repair #{repair.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {`${repair.vehicle.make} ${repair.vehicle.model} (${repair.vehicle.year})`} •{" "}
                          {new Date(repair.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0 w-fit">
                        {repair.status.charAt(0).toUpperCase() + repair.status.slice(1).replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{repair.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${repair.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {repair.customer.name}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {repair.insurer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimated Amount:</span>{" "}
                        {repair.estimated_amount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRepairId(repair.id);
                          progressForm.setValue("progress", repair.progress || 0);
                          setProgressDialogOpen(true);
                        }}
                      >
                        Update Progress
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/garage/repairs/${repair.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Repairs</h3>
                    <p className="text-sm text-muted-foreground">You don't have any active repairs in progress.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedRepairs.length > 0 ? (
              completedRepairs.map((repair) => (
                <Card key={repair.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Repair #{repair.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {`${repair.vehicle.make} ${repair.vehicle.model} (${repair.vehicle.year})`} •{" "}
                          {new Date(repair.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0 space-x-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />{" "}
                          {repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            repair.payment_status === "paid"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          <DollarSign className="h-3 w-3 mr-1" />{" "}
                          {repair.payment_status?.charAt(0).toUpperCase() + repair.payment_status?.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {repair.customer.name}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {repair.insurer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Final Amount:</span>{" "}
                        {(repair.final_amount || 0).toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/garage/repairs/${repair.id}`}>View Details</Link>
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
                    <h3 className="text-lg font-semibold mb-2">No Completed Repairs</h3>
                    <p className="text-sm text-muted-foreground">You don't have any completed repairs yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
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
    </DashboardLayout>
  );
}