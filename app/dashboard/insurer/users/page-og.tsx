"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Building2, Search, UserPlus, UserCog, Shield, Users, UserCheck, UserX } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"

const userFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  role: z.enum(["admin", "manager", "agent", "assessor", "readonly"]),
  department: z.string().min(2, {
    message: "Department must be at least 2 characters.",
  }),
  status: z.enum(["active", "inactive", "pending"]),
})

type User = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: "admin" | "manager" | "agent" | "assessor" | "readonly"
  department: string
  status: "active" | "inactive" | "pending"
  lastLogin?: string
}

export default function UsersManagementPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([
    {
      id: "user-1",
      first_name: "Jean",
      last_name: "Mugabo",
      email: "jean.mugabo@sanlam.rw",
      phone: "+250 788 123 456",
      role: "admin",
      department: "Claims",
      status: "active",
      lastLogin: "2023-12-15 09:30",
    },
    {
      id: "user-2",
      first_name: "Marie",
      last_name: "Uwase",
      email: "marie.uwase@sanlam.rw",
      phone: "+250 788 234 567",
      role: "manager",
      department: "Underwriting",
      status: "active",
      lastLogin: "2023-12-14 14:45",
    },
    {
      id: "user-3",
      first_name: "Eric",
      last_name: "Kamanzi",
      email: "eric.kamanzi@sanlam.rw",
      phone: "+250 788 345 678",
      role: "agent",
      department: "Sales",
      status: "active",
      lastLogin: "2023-12-13 11:20",
    },
    {
      id: "user-4",
      first_name: "Claude",
      last_name: "Nshimiyimana",
      email: "claude.nshimiyimana@sanlam.rw",
      phone: "+250 788 456 789",
      role: "assessor",
      department: "Claims",
      status: "inactive",
      lastLogin: "2023-11-30 16:15",
    },
    {
      id: "user-5",
      first_name: "Sarah",
      last_name: "Mutesi",
      email: "sarah.mutesi@sanlam.rw",
      phone: "+250 788 567 890",
      role: "readonly",
      department: "Finance",
      status: "pending",
    },
  ])

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "agent",
      department: "Claims",
      status: "active",
    },
  })

  const onSubmit = (values: z.infer<typeof userFormSchema>) => {
    // In a real app, this would call an API endpoint
    const newUser = {
      id: `user-${users.length + 1}`,
      ...values,
    }

    setUsers([...users, newUser])
    setIsAddUserOpen(false)
    form.reset()

    toast({
      title: "User added successfully",
      description: `${values.first_name} ${values.last_name} has been added as a ${values.role}.`,
    })
  }

  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "manager":
        return "default"
      case "agent":
        return "secondary"
      case "assessor":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "destructive"
      case "pending":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "manager":
        return <UserCog className="h-4 w-4" />
      case "agent":
        return <UserCheck className="h-4 w-4" />
      case "assessor":
        return <UserCheck className="h-4 w-4" />
      default:
        return <UserX className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout
      user={{
        name: user?.name ? `${user.name} ` : "user name",
        role: user?.role ? user?.role : 'user role',
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Users", href: "/dashboard/insurer/users", icon: <Users className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-2">Manage users and their access to the system</p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account with appropriate role and permissions.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@sanlam.rw" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+250 788 123 456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Administrator</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="agent">Claims Agent</SelectItem>
                              <SelectItem value="assessor">Assessor</SelectItem>
                              <SelectItem value="readonly">Read Only</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>This determines what permissions the user will have.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Claims">Claims</SelectItem>
                              <SelectItem value="Underwriting">Underwriting</SelectItem>
                              <SelectItem value="Sales">Sales</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="IT">IT</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Add User</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, role or department..."
            className="max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({users.filter((user) => user.status === "active").length})</TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({users.filter((user) => user.status === "inactive").length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({users.filter((user) => user.status === "pending").length})
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
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center space-x-1">
                          {getRoleIcon(user.role)}
                          <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Phone:</span> {user.phone}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Department:</span> {user.department}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Last Login:</span> {user.lastLogin || "Never logged in"}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/insurer/users/${user.id}`}>View Details</Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant={user.status === "active" ? "destructive" : "default"} size="sm">
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
                    <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No users match your search criteria. Try adjusting your search or add a new user.
                    </p>
                    <Button onClick={() => setIsAddUserOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Add User
                    </Button>
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
                          <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center space-x-1">
                            {getRoleIcon(user.role)}
                            <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                          </Badge>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Phone:</span> {user.phone}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Department:</span> {user.department}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last Login:</span>{" "}
                          {user.lastLogin || "Never logged in"}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/insurer/users/${user.id}`}>View Details</Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
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
                    <h3 className="text-lg font-semibold mb-2">No Active Users Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">No active users match your search criteria.</p>
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
                          <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center space-x-1">
                            {getRoleIcon(user.role)}
                            <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                          </Badge>
                          <Badge variant="destructive">Inactive</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Phone:</span> {user.phone}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Department:</span> {user.department}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last Login:</span>{" "}
                          {user.lastLogin || "Never logged in"}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/insurer/users/${user.id}`}>View Details</Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="default" size="sm">
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
                    <h3 className="text-lg font-semibold mb-2">No Inactive Users Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">No inactive users match your search criteria.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredUsers.filter((user) => user.status === "pending").length > 0 ? (
              filteredUsers
                .filter((user) => user.status === "pending")
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
                          <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center space-x-1">
                            {getRoleIcon(user.role)}
                            <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                          </Badge>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Phone:</span> {user.phone}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Department:</span> {user.department}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last Login:</span>{" "}
                          {user.lastLogin || "Never logged in"}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/insurer/users/${user.id}`}>View Details</Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="default" size="sm">
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
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Users Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">No pending users match your search criteria.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
