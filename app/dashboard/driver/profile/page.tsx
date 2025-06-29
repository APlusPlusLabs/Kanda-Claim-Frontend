"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, User, LogOut, Car, Plus, Edit, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Vehicle } from "@/lib/types/claims"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

// Driver profile schema
const driverSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required")
})

// Vehicle schema
const vehicleSchema = z.object({
  license_plate: z.string().min(1, "License plate is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().transform((val) => Number(val)).pipe(z.number().min(1900).max(new Date().getFullYear() + 1)),
  vin: z.string().min(1, "VIN is required"),
})

// Password schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function DriverProfile() {
  const { user, apiRequest } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isVehicleLoading, setIsVehicleLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle|null>(null)

  // Driver profile form
  const driverForm = useForm({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  })

  // Vehicle form
  const vehicleForm = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      license_plate: "",
      make: "",
      model: "",
      year: "",
      vin: "",
    },
  })

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await apiRequest(`${API_URL}vehicles/user/${user.id}`, "GET")
      if (response.success) {
        setVehicles(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchVehicles()
    }
  }, [user?.id])

  const handleDriverUpdate = async (data) => {
    setIsLoading(true)

    try {
      const userData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        user_id: user.id
      }

      const response = await apiRequest(
        `${API_URL}users/${user.id}`, 
        "PUT", 
        userData
      )

      if (response.success) {
        toast({
          title: "Profile Updated",
          description: "Your driver profile has been updated successfully.",
        })
      } else {
        throw new Error(response.message || "Failed to update profile")
      }
    } catch (error:any) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (data) => {
    setIsPasswordLoading(true)

    try {
      const passwordData = {
        current_password: data.currentPassword,
        password: data.newPassword,
        password_confirmation: data.confirmPassword,
        user_id: user.id
      }

      const response = await apiRequest(
        `${API_URL}users/${user.id}/password`, 
        "PUT", 
        passwordData
      )

        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully.",
        })
        passwordForm.reset()
     
     router.push('/login')
    } catch (error) {
      console.error("Password update error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleVehicleSubmit = async (data) => {
    setIsVehicleLoading(true)

    try {
      const vehicleData = {
        ...data,
        tenant_id: user.tenant_id,
        user_id: user.id,
      }

      let response
      if (editingVehicle) {
        response = await apiRequest(
          `${API_URL}vehicles/${editingVehicle.id}`, 
          "PUT", 
          vehicleData
        )
      } else {
        response = await apiRequest(
          `${API_URL}vehicles`, 
          "POST", 
          vehicleData
        )
      }

        toast({
          title: editingVehicle ? "Vehicle Updated" : "Vehicle Added",
          description: `Vehicle has been ${editingVehicle ? 'updated' : 'added'} successfully.`,
        })
        setVehicleDialogOpen(false)
        setEditingVehicle(null)
        vehicleForm.reset()
        fetchVehicles()
     
    } catch (error:any) {
      console.error("Vehicle save error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save vehicle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVehicleLoading(false)
    }
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    vehicleForm.reset({
      license_plate: vehicle.license_plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      vin: vehicle.vin,
    })
    setVehicleDialogOpen(true)
  }

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await apiRequest(`${API_URL}vehicles/${vehicleId}`, "DELETE")
        if (response.success) {
          toast({
            title: "Vehicle Deleted",
            description: "Vehicle has been deleted successfully.",
          })
          fetchVehicles()
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete vehicle.",
          variant: "destructive",
        })
      }
    }
  }

  const openAddVehicleDialog = () => {
    setEditingVehicle(null)
    vehicleForm.reset({
      license_plate: "",
      make: "",
      model: "",
      year: "",
      vin: "",
    })
    setVehicleDialogOpen(true)
  }

  return (
    <DashboardLayout
      user={{
        name: user?.first_name + " " + user?.last_name,
        role: "Driver",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/driver", icon: <Building2 className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/driver/profile", icon: <User className="h-5 w-5" /> },
      ]}
      actions={[{ name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }]}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Driver Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your profile information and vehicles</p>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" alt={user?.first_name} />
              <AvatarFallback>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Driver Information</TabsTrigger>
            <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Form {...driverForm}>
              <form onSubmit={driverForm.handleSubmit(handleDriverUpdate)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Driver Information</CardTitle>
                    <CardDescription>Update your personal information and driver details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={driverForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={driverForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={driverForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={driverForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                     
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Vehicles</CardTitle>
                  <CardDescription>Manage your registered vehicles</CardDescription>
                </div>
                <Button onClick={openAddVehicleDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </CardHeader>
              <CardContent>
                {vehicles.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No vehicles registered yet.</p>
                    <Button onClick={openAddVehicleDialog} className="mt-4">
                      Add Your First Vehicle
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>License Plate</TableHead>
                        <TableHead>Make</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>VIN</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                          <TableCell>{vehicle.make}</TableCell>
                          <TableCell>{vehicle.model}</TableCell>
                          <TableCell>{vehicle.year}</TableCell>
                          <TableCell>{vehicle.vin}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditVehicle(vehicle)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Update your password and security preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} disabled={isPasswordLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} disabled={isPasswordLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} disabled={isPasswordLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isPasswordLoading}>
                      {isPasswordLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        {/* Vehicle Dialog */}
        <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
              <DialogDescription>
                {editingVehicle ? "Update vehicle information" : "Enter the details of your new vehicle"}
              </DialogDescription>
            </DialogHeader>
            <Form {...vehicleForm}>
              <form onSubmit={vehicleForm.handleSubmit(handleVehicleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={vehicleForm.control}
                    name="license_plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isVehicleLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled={isVehicleLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={vehicleForm.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isVehicleLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isVehicleLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={vehicleForm.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isVehicleLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVehicleDialogOpen(false)}
                    disabled={isVehicleLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isVehicleLoading}>
                    {isVehicleLoading ? "Saving..." : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}