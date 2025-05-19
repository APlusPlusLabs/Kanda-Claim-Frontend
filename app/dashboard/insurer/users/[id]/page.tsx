// app/dashboard/insurer/users/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Building, FileText, Edit } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { EditUserDialog } from "@/components/EditUserDialog";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

interface User {
    id: string;
    email: string;
    name: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: any;
    role_id: string;
    tenant_id: string;
    tenant: any;
    avatar: string;
    status: string;
    last_login: string;
}
type Role = {
    id: string;
    name: string;
    tenant_id: string;
};

type Tenant = {
    id: string;
    name: string;
};

type Claim = {
    id: string;
    code: string;
    policy_number: string;
    status: string;
    created_at: string;
    description: string;
    amount: number;
};

export default function ViewUserPage() {
    const { user, apiRequest, logout } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const { id } = useParams();
    const [userData, setUserData] = useState<User | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
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
                avatar: ""
            };
            setUserData(userData);

            // Validate tenant_id
            if (userData.tenant_id !== user.tenant_id && userData.role_id !== "insurer") {
                throw new Error("Unauthorized: User belongs to a different tenant.");
            }

            const rolesResponse = await apiRequest(`${API_URL}roles`, "GET");
            const userRole = rolesResponse.find((r: Role) => r.id === userData.role_id);
            if (!userRole) {
                throw new Error("Role not found.");
            }
            setRole(userRole);
            setRoles(rolesResponse);

            // Fetch tenant
            const tenantResponse = await apiRequest(`${API_URL}tenants/${userData.tenant_id}`, "GET");
            setTenant({ id: tenantResponse.id, name: tenantResponse.name });

            // Fetch claims for driver or assessor
            if (["driver", "assessor"].includes(userRole.name.toLowerCase())) {
                const claimsResponse = await apiRequest(
                    `${API_URL}claims/byuser?user_id=${id}&tenant_id=${userData.tenant_id}`,
                    "GET"
                );
                setClaims(
                    claimsResponse.map((c: any) => ({
                        id: c.id,
                        code: c.code,
                        policy_number: c.policy_number,
                        status: c.status,
                        created_at: c.created_at,
                        amount: c.amount,
                    }))
                );
            }
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

    if (!userData || !role || !tenant) {
        console.log("Rendering: No data, redirect handled");
        return null; // Redirect handled in fetchData
    }

    console.log("Rendering: Displaying user data", { userData, role, tenant });

    return (
        <DashboardLayout
            user={{
                name: user?.name || "User Name",
                role: user?.role.name || "User Role",
                avatar: user?.avatar || "/placeholder.svg?height=40&width=40",
            }}
            navigation={[
                { name: "Dashboard", href: "/dashboard/insurer", icon: <Building className="h-5 w-5" /> },
                { name: "Users", href: "/dashboard/insurer/users", icon: <User className="h-5 w-5" /> },
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
                                    role_id={user?.role_id || ''}
                                />
                            </Dialog>
                            <Button variant="outline" onClick={() => router.push("/dashboard/insurer/users")}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
                            </Button>
                        </div>
                    </div>
                    <div className="flex grid">
                        <div className="col-6">

                            {/* User Basic Info */}
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

                        </div>
                        <div className="col-6">

                            {/* Tenant/Company */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Company</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="text-muted-foreground">Name:</span> {tenant.name}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Tenant ID:</span> {tenant.id}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        <div className="col-6">
                            {/* Claims */}
                            {claims.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Claims</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {claims.map((claim) => (
                                                <li key={claim.id} className="border-b py-2">
                                                    <div>
                                                        <span className="text-muted-foreground">Claim #:</span> {claim.code}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Status:</span>{" "}
                                                        <Badge>{claim.status}</Badge>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Date:</span>{" "}
                                                        {new Date(claim.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Amount:</span> RWF {claim.amount}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                            )}  </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}