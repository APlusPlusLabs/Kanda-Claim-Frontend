"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building2, Search, UserPlus, UserCog, Shield, Users, UserCheck, UserX, HousePlus, FileText, Wrench, Plus } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/components/ui/use-toast";

import { EditUserDialog } from "@/components/EditUserDialog";
import { Role, User } from "@/lib/types/users";
import { Description } from "@radix-ui/react-toast";
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const userFormSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.string().min(1, "Role is required"),
  tenant_id: z.string().optional(),
  insuranceCompanyName: z.string().optional(),
}).refine(
  (data) => {
    if (data.role !== "insurer" && !data.tenant_id) {
      return false;
    }
    if (data.role === "insurer" && !data.insuranceCompanyName) {
      return false;
    }
    return true;
  },
  {
    message: "Tenant ID is required for non-insurer roles, and Insurance Company Name is required for insurer role.",
    path: ["tenant_id", "insuranceCompanyName"],
  }
);

export default function ClientsManagementPage() {
  const { user, apiRequest, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [userLoadStatus, setUserLoadStatus] = useState<"loading" | "loaded" | "failed">("loading");
  const [departments, setDepartments] = useState<any[]>([]);
  const [garages, setGarages] = useState<any[]>([]);
  // Fetch users and roles from backend
  useEffect(() => {
    async function fetchData() {
      try {
        const usersData = await apiRequest(`${API_URL}users/clients/${user?.tenant_id}`, "GET");
        setUsers(
          usersData.map((u: any) => ({
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            phone: u.phone,
            role_id: u.role_id,
            tenant_id: u.tenant_id,
            status: u.is_active ? "active" : "inactive",
            last_login: u.last_login || undefined,
          }))
        );
        // Fetch roles
        const rolesData = await apiRequest(`${API_URL}roles`, "GET");
        setRoles(rolesData);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch data.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [apiRequest, toast]);

  // Form setup
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      role: "driver",
      tenant_id: user?.tenant_id || "",
      insuranceCompanyName: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof userFormSchema>) => {
    const selectedRole = roles.find((r) => r.id === values.role);
  
    try {

      const newUser = await apiRequest(`${API_URL}users/store`, "POST", {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role_id: values.role,
        department_id: "",
        garage_id: "",
        tenant_id: user?.tenant_id
      });

      setUsers([
        ...users,
        {
          id: newUser.user.id,
          first_name: newUser.user.first_name,
          last_name: newUser.user.last_name,
          name: newUser.user.first_name + " " + newUser.user.last_name,
          email: newUser.user.email,
          phone: newUser.user.phone,
          role_id: newUser.user.role_id,
          department_id: newUser.user.department_id,
          tenant_id: newUser.user.tenant_id,
          status: newUser.user.is_active ? "active" : "inactive",
          last_login: newUser.user.last_login,
          tenant: newUser.tenant,
          role: newUser.role,
          avatar: "",
          info: newUser.info,
          garage_id: newUser.garage_id
        },
      ]);

      setIsAddUserOpen(false);
      form.reset();

      toast({
        title: "User added successfully",
        description: `${values.first_name} ${values.last_name} has been added as a ${values.role}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add user.",
      });
    }
  };


  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (roles.find((r) => r.id === user.role_id)?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Role badge variant
  const getRoleBadgeVariant = (role_id: string) => {
    const roleName = roles.find((r) => r.id === role_id)?.name.toLowerCase();
    switch (roleName) {
      case "driver":
        return "secondary";
      case "garage":
        return "default";
      case "assessor":
        return "outline";
      case "insurer":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Role icon
  const getRoleIcon = (role_id: string) => {
    const roleName = roles.find((r) => r.id === role_id)?.name.toLowerCase();
    switch (roleName) {
      case "driver":
        return <UserCheck className="h-4 w-4" />;
      case "garage":
        return <UserCog className="h-4 w-4" />;
      case "assessor":
        return <UserCheck className="h-4 w-4" />;
      case "insurer":
        return <Shield className="h-4 w-4" />;
      default:
        return <UserX className="h-4 w-4" />;
    }
  };
  // Handle user update
  const handleUserUpdate = (updatedUser: User) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };
  // Render logic
  // if (userLoadStatus === "loading") {
  //   return <div>Loading user data...</div>;
  // }

  if (userLoadStatus === "failed" || !user) {
    return null; // Redirect handled in useEffect
  }
  // Handle logout or redirect if not authenticated
  if (!user) {
    router.push("/login");
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout
      user={{
        name: user.name,
        role: user.role.name +" @ "+user.tenant.name,
        avatar: user.avatar || "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Clients (Drivers)", href: "/dashboard/insurer/clients", icon: <Users className="h-5 w-5" /> },
        { name: "Company Staff & Users", href: "/dashboard/insurer/users", icon: <UserCog className="h-5 w-5" /> },
        { name: "Garages Partners", href: "/dashboard/insurer/garages", icon: <Wrench className="h-5 w-5" /> },
        { name: "Bids", href: "/dashboard/insurer/bids", icon: <FileText className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clients (Drivers) Management</h1>
            <p className="text-muted-foreground mt-2">Drivers that signed-up to this company</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search Drivers by name, email..."
            className="max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Clients ({users.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({users.filter((user) => user.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({users.filter((user) => user.status === "inactive").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0 space-x-2">
                        <Badge variant={getRoleBadgeVariant(user.role_id)} className="flex items-center space-x-1">
                          {getRoleIcon(user.role_id)}
                          <span>
                            {(roles.find((r) => r.id === user.role_id)?.name || "Unknown").charAt(0).toUpperCase() +
                              (roles.find((r) => r.id === user.role_id)?.name || "Unknown").slice(1)}
                          </span>
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Phone:</span> {user.phone}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Last Login:</span>{" "}
                        {user.last_login ? new Date(user.last_login).toLocaleString() : "Never logged in"}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/insurer/clients/${user.id}`}>View Details</Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditUser(user)}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        {editUser && (
                          <EditUserDialog
                            user={editUser}
                            departments={departments}
                            roles={roles}
                            open={!!editUser}
                            onOpenChange={() => setEditUser(null)}
                            onSuccess={handleUserUpdate}
                            apiRequest={apiRequest}
                            role_id={user.role_id}
                            tenant_id={user.tenant_id} garages={garages}                          />
                        )}
                      </Dialog>
                      <Button
                        variant={user.status === "active" ? "destructive" : "default"}
                        size="sm"
                        onClick={async () => {
                          try {
                            await apiRequest(`${API_URL}users/${user.id}/status`, "PATCH", {
                              is_active: user.status !== "active",
                            });
                            setUsers(
                              users.map((u) =>
                                u.id === user.id
                                  ? { ...u, status: user.status === "active" ? "inactive" : "active" }
                                  : u
                              )
                            );
                            toast({
                              title: "User status updated",
                              description: `${user.first_name} ${user.last_name} is now ${user.status === "active" ? "inactive" : "active"
                                }.`,
                            });
                          } catch (error: any) {
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description: error.message || "Failed to update user status.",
                            });
                          }
                        }}
                      >
                        {user.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Clients Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No Clients found or match your search criteria. Try adjusting your search.
                    </p>
                    {/* <Button onClick={() => setIsAddUserOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Add User
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {filteredUsers.filter((user) => user.status === "active").length > 0 ? (
              filteredUsers
                .filter((user) => user.status === "active")
                .map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-2">
                          <Badge variant={getRoleBadgeVariant(user.role_id)} className="flex items-center space-x-1">
                            {getRoleIcon(user.role_id)}
                            <span>
                              {(roles.find((r) => r.id === user.role_id)?.name || "Unknown").charAt(0).toUpperCase() +
                                (roles.find((r) => r.id === user.role_id)?.name || "Unknown").slice(1)}
                            </span>
                          </Badge>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Phone:</span> {user.phone}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last Login:</span>{" "}
                          {user.last_login ? new Date(user.last_login).toLocaleString() : "Never logged in"}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/insurer/users/${user.id}`}>View Details</Link>
                        </Button>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            try {
                              await apiRequest(`${API_URL}users/${user.id}/status`, "PATCH", {
                                is_active: false,
                              });
                              setUsers(
                                users.map((u) =>
                                  u.id === user.id ? { ...u, status: "inactive" } : u
                                )
                              );
                              toast({
                                title: "User deactivated",
                                description: `${user.first_name} ${user.last_name} is now inactive.`,
                              });
                            } catch (error: any) {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: error.message || "Failed to deactivate user.",
                              });
                            }
                          }}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Clients Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">No active Clients match your search criteria.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            {filteredUsers.filter((user) => user.status === "inactive").length > 0 ? (
              filteredUsers
                .filter((user) => user.status === "inactive")
                .map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-2">
                          <Badge variant={getRoleBadgeVariant(user.role_id)} className="flex items-center space-x-1">
                            {getRoleIcon(user.role_id)}
                            <span>
                              {(roles.find((r) => r.id === user.role_id)?.name || "Unknown").charAt(0).toUpperCase() +
                                (roles.find((r) => r.id === user.role_id)?.name || "Unknown").slice(1)}
                            </span>
                          </Badge>
                          <Badge variant="destructive">Inactive</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Phone:</span> {user.phone}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last Login:</span>{" "}
                          {user.last_login ? new Date(user.last_login).toLocaleString() : "Never logged in"}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/insurer/users/${user.id}`}>View Details</Link>
                        </Button>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={async () => {
                            try {
                              await apiRequest(`${API_URL}users/${user.id}/status`, "PATCH", {
                                is_active: true,
                              });
                              setUsers(
                                users.map((u) =>
                                  u.id === user.id ? { ...u, status: "active" } : u
                                )
                              );
                              toast({
                                title: "User activated",
                                description: `${user.first_name} ${user.last_name} is now active.`,
                              });
                            } catch (error: any) {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: error.message || "Failed to activate user.",
                              });
                            }
                          }}
                        >
                          Activate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Inactive Clients Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">No inactive Clients match your search criteria.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
       
        </Tabs>
      </div>
    </DashboardLayout>
  );
}