// app/dashboard/insurer/users/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, FileText, Edit, CheckCircle2, Eye, XCircle, Clock, FileImage, FileDownIcon, Link, Plus, User2 } from "lucide-react";
import { Dialog, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { EditUserDialog } from "@/components/EditUserDialog";
import { format } from "date-fns";
import { Progress } from "@radix-ui/react-progress";
import { Role, Tenant, User } from "@/lib/types/users";
import { Claim, Garage } from "@/lib/types/claims";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;


export default function ViewUserPage() {
    const { user, apiRequest, logout } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const { id } = useParams();
    const [userData, setUserData] = useState<User | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [tenant, setTenant] = useState<Tenant>();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isGarageModalOpen, setIsGarageModalOpen] = useState(false);

    const [garages, setGarages] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    // Fetch data
    // user loading
    useEffect(() => {
        if (!user) {
            const timer = setTimeout(() => {
                if (!user) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to load user data. Please log in again.",
                    });
                    logout();
                    router.push("/login");
                }
            }, 3000); // 3-second timeout
            return () => clearTimeout(timer);
        }
    }, [user, logout, router, toast]);
    // Fetch user, tenant, roles, and claims data
    const fetchData = useCallback(async () => {

        if (!user || !id) {
            console.log("fetchData skipped: missing user or id", { user, id });
            return;
        }

        try {
            console.log("fetchData started", { userId: id });
            setLoading(true);


            // Fetch user details
            const userResponse = await apiRequest(`${API_URL}users/${id}`, "GET");
            const userData: User = {
                id: userResponse.id,
                first_name: userResponse.first_name,
                last_name: userResponse.last_name,
                email: userResponse.email,
                phone: userResponse.phone,
                role_id: userResponse.role_id,
                tenant_id: userResponse.tenant_id,
                status: userResponse.is_active ? "active" : "inactive",
                last_login: userResponse.last_login || undefined,
                name: userResponse.first_name + " " + userResponse.last_name,
                role: userResponse.role,
                tenant: userResponse.tenant,
                department: userResponse.department,
                garage_id: userResponse.garage_id,
                garage: userResponse.garage,
                avatar: "",
                info: userResponse.info
            };
            setUserData(userData);
            console.log('user data', userResponse);
            const ddepartments = await apiRequest(`${API_URL}departments-by-tenant/${user.tenant_id}`, "GET");
            setDepartments(ddepartments)

            const rolesResponse = await apiRequest(`${API_URL}roles`, "GET");
            const userRole = rolesResponse.find((r: Role) => r.id === userData.role_id);
            // if (!userRole) {
            //     throw new Error("Role not found.");
            // }
            setRole(userRole);
            setRoles(rolesResponse);

            // Fetch claims for driver or assessor
            if (["driver", "assessor"].includes(userRole.name.toLowerCase())) {
                const claimsResponse = await apiRequest(
                    `${API_URL}claims/${id}/get-by-user`,
                    "GET"
                );
                setClaims(claimsResponse.data || []);
            }
            const garagesReq = await apiRequest(`${API_URL}garages/${user.tenant_id}`, "GET");
            setGarages(garagesReq.map((garage: Garage) => ({
                ...garage,
                rating: garage.rating !== null ? Number(garage.rating) : null,
                latitude: garage.latitude !== null ? Number(garage.latitude) : null,
                longitude: garage.longitude !== null ? Number(garage.longitude) : null,
            })));
        } catch (error: any) {
            console.error("fetchData error", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to load user data.",
            });
            router.push("/dashboard/insurer/users");
        } finally {
            console.log("fetchData completed, setting loading to false");
            setLoading(false);
        }
    }, [user, id, apiRequest, toast, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle user update
    const handleUserUpdate = (updatedUser: User) => {
        setUserData(updatedUser);
    };
    // Role and status badge variants
    const getBadgeVariant = (type: string, value: string) => {
        if (type === "role" && value) {
            switch (value.toLowerCase()) {
                case "driver": return "secondary";
                case "garage": return "default";
                case "assessor": return "outline";
                case "insurer": return "destructive";
                default: return "secondary";
            }
        }
        if (type === "status") {
            return value === "active" ? "default" : "destructive";
        }
        return "secondary";
    };

    // Corrected role check
    if (!["Insurer", "Admin"].includes(user?.role.name.trim())) {
        console.log("Rendering: Access denied for role", user?.role.name);
        toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Only Insurer or Admin roles can view user details.",
        });
        router.push("/dashboard"); // More generic redirect
        return null;
    }

    if (loading) {
        console.log("Rendering: Loading data");
        return <div>Loading...</div>;
    }

    if (!userData || !role) {
        console.log("Rendering: No data, redirect handled");
        return null;
    }
    const isCompletedOrRejected = ["completed", "rejected"].includes(status);
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
                return <FileDownIcon className="h-5 w-5 text-red-500" />;
            default:
                return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };
    const garageFormSchema = z.object({
        garage_id: z.string().min(2, { message: "garage is requitrd" })
    })
    // garageForm setup
    const form = useForm<z.infer<typeof garageFormSchema>>({
        resolver: zodResolver(garageFormSchema),
        defaultValues: {
            garage_id: "",
        }
    })
    const onSubmitGarage = async (values: z.infer<typeof garageFormSchema>) => {
        try {
            const garagedata = await apiRequest(`${API_URL}users/update-garage`, "PUT", {
                id: id,
                garage_id: values.garage_id,
                tenant_id: user?.tenant_id
            });
            setUserData({
                ...userData,
                garage_id: garagedata.garage_id
            });
            setIsGarageModalOpen(false);
            form.reset();
            toast({
                title: "Garage set successfully",
                description: ``,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to set garafw.",
            });
        }
    };
    return (
        <DashboardLayout
            user={{
                name: user?.name || "User Name",
                role: user?.role.name || "User Role",
                avatar: user?.avatar || "/placeholder.svg?height=40&width=40",
            }}
            navigation={[
                { name: "Dashboard", href: "/dashboard/insurer", icon: <Building className="h-5 w-5" /> },
                { name: "Users", href: "/dashboard/insurer/users", icon: <User2 className="h-5 w-5" /> },
            ]}
        >
            <div className="space-y-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">User Details</h1>
                            <p className="text-muted-foreground mt-2">
                                View details for {userData.first_name} {userData.last_name}
                            </p>
                        </div>
                        <div className="space-x-2">
                            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setIsEditOpen(true)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit User
                                    </Button>
                                </DialogTrigger>
                                <EditUserDialog
                                    user={userData}
                                    roles={roles}
                                    open={isEditOpen}
                                    onOpenChange={setIsEditOpen}
                                    onSuccess={handleUserUpdate}
                                    apiRequest={apiRequest}
                                    tenant_id={user?.tenant_id || ''}
                                    role_id={user?.role_id || ''} departments={departments ?? []} />
                            </Dialog>
                            <Button variant="outline" onClick={() => router.push("/dashboard/insurer/users")}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
                            </Button>
                        </div>
                        {userData.role.name === 'Garage' ? (
                            <div className="space-x-2">
                                <Dialog open={isGarageModalOpen} onOpenChange={setIsGarageModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => setIsGarageModalOpen(true)}>
                                            <Edit className="mr-2 h-4 w-4" /> Manage User's Garage
                                        </Button>
                                    </DialogTrigger>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmitGarage)} className="space-y-4 py-4">
                                            <FormField
                                                control={form.control}
                                                name="garage_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Garage</FormLabel>
                                                        {garages?.length > 0 ? (
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                value={field.value || ""}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select garage" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {garages.map((garage) => (
                                                                        <SelectItem key={garage.id} value={garage.id}>
                                                                            {garage.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <p className="text-sm text-muted-foreground">No garages available.</p>
                                                                <Button asChild>
                                                                    <Link href="/dashboard/insurer/garages">
                                                                        <Plus className="h-4 w-4 mr-2" /> Add Garage
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        )}
                                                        <FormDescription>Garage is required for garage role users.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>

                                                )}
                                            />
                                            <DialogFooter>
                                                <Button type="submit">Assign Garage to {userData.info}</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>

                                </Dialog>
                                <Button variant="outline" onClick={() => router.push("/dashboard/insurer/users")}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
                                </Button>
                            </div>
                        ) : ''}
                    </div>
                    <div className="flex grid">
                        <div className="grid grid-cols-2 space-x-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="text-muted-foreground">Email:</span> {userData.email}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Phone:</span> {userData.phone}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Role:</span>{" "}
                                        <Badge variant={getBadgeVariant("role", userData.role?.name)}>{userData.role.name}</Badge>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Status:</span>{" "}
                                        <Badge variant={getBadgeVariant("status", userData.status)}>{userData.status}</Badge>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Last Login:</span>{" "}
                                        {userData.last_login ? new Date(userData.last_login).toLocaleString() : "Never"}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>User Classfication</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="text-muted-foreground">Insurer:</span> {userData.tenant.name}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Department:</span> {userData.department?.name}
                                    </div>
                                    {userData.role.name === 'Garage' ? (
                                        <div>
                                            <span className="text-muted-foreground">Garage:</span> {userData.garage?.name}
                                        </div>
                                    ) : ''
                                    }
                                </CardContent>
                            </Card>

                        </div>
                        <h3></h3>
                        <div className="p-3">
                            <h2 className="text-3xl font-bold">{userData.first_name} {userData.last_name} Claims</h2>
                            <p className="text-muted-foreground mt-2">
                                View & Manage {userData.first_name} {userData.last_name} Claims
                            </p>
                        </div>
                        <div>
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
                                                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/driver/claims/${claim.id}`)}>
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
                                ))) : (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No Claims Found</h3>
                                            <p className="text-sm text-muted-foreground mb-4">{userData?.name} doesn't have any claims yet.</p>
                                            <Button asChild>
                                                <Link href="/dashboard/driver/claims/new">
                                                    <Plus className="mr-2 h-4 w-4" /> Submit New Claim
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout >
    );
}