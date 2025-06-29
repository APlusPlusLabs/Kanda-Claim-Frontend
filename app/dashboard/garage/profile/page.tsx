"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Building2, User, LogOut, MapPin } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Garage name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional(),
  rating: z.string().transform((val) => val === "" ? undefined : Number(val)).pipe(z.number().min(0).max(5).optional()),
  address: z.string().min(1, "Address is required"),
  latitude: z.string().transform((val) => val === "" ? undefined : Number(val)).pipe(z.number().min(-90).max(90).optional()),
  longitude: z.string().transform((val) => val === "" ? undefined : Number(val)).pipe(z.number().min(-180).max(180).optional()),
  specializations: z.array(z.string()).optional(),
  description: z.string().optional(),
  openHours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),
  contactPersonFirstName: z.string(),
  contactPersonLastName: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function GarageProfile() {
  const { user, apiRequest } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isGeolocating, setIsGeolocating] = useState(false)

  // Garage profile form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.garage?.name || "",
      phone: user?.garage?.phone || "",
      email: user?.garage?.email || "",
      rating: user?.garage?.rating?.toString() || "",
      address: user?.garage?.address || "",
      latitude: user?.garage?.latitude?.toString() || "",
      longitude: user?.garage?.longitude?.toString() || "",
      specializations: user?.garage?.specializations || [],
      description: user?.garage?.description || "",
      openHours: user?.garage?.openHours || {
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
        saturday: "",
        sunday: "",
      },
      contactPersonFirstName: user.first_name || "",
      contactPersonLastName: user.last_name || "",
      contactEmail: user?.email || "",
      contactPhone: user?.phone || "",
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

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
      return
    }

    setIsGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude)
        form.setValue("longitude", position.coords.longitude)
        setIsGeolocating(false)
        toast({
          title: "Success",
          description: "Location updated successfully.",
        })
      },
      (error: any) => {
        setIsGeolocating(false)
        toast({
          title: "Error",
          description: "Failed to get your location. Please enter coordinates manually.",
          variant: "destructive",
        })
      }
    )
  }

  const handleProfileUpdate = async (data) => {
    setIsLoading(true)

    try {
      const garageData = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        rating: data.rating,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        specializations: data.specializations,
        description: data.description,
        openHours: data.openHours,
        tenant_id: user.tenant_id,
        user_id: user.id,
      }

      const response = await apiRequest(
        `${API_URL}garages/${user.garage?.id}`,
        "PUT",
        garageData
      )
      // Prepare user data (contact person info)
      const userData = {
        first_name: data.contactPersonFirstName,
        last_name: data.contactPersonLastName,
        email: data.contactEmail,
        phone: data.contactPhone,
        tenant_id: user.tenant_id,
        user_id: user.id,
      }
      // Update user information
      const userResponse = await apiRequest(
        `${API_URL}users/${user.id}`,
        "PUT",
        userData
      )
      if (response.success && userResponse.success) {
        toast({
          title: "Profile Updated",
          description: "Profile has been updated successfully.",
        })

        router.push('/login')
      } else {
        throw new Error(response.message || "Failed to update profile")
      }
    } catch (error: any) {
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

  const handlePasswordUpdate = async (data: { currentPassword: any; newPassword: any; confirmPassword: any }) => {
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

      if (response.success) {
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully. use it to LOGIN now",
        })
        passwordForm.reset()

        router.push('/login')
      } else {
        throw new Error(response.message || "Failed to update password")
      }
    } catch (error: any) {
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

  return (
    <DashboardLayout
      user={{
        name: user?.name,
        role: user?.garage?.name || "Garage User",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/garage", icon: <Building2 className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/garage/profile", icon: <User className="h-5 w-5" /> },
        { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Garage Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your garage information and preferences</p>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" alt={user?.garage?.name} />
              <AvatarFallback>
                {user?.garage?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'GA'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">User & Garage Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Garage Information</CardTitle>
                    <CardDescription>Update your garage details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Garage Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter garage name" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="0"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Garage Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 0788883000" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Garage Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Ex: autoshop@gmail.com" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter garage address" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <Label>Location Coordinates</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-2">

                          <FormField
                            control={form.control}
                            name="latitude"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.00000001"
                                    placeholder="Latitude (-90 to 90)"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="longitude"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.00000001"
                                    placeholder="Longitude (-180 to 180)"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGeolocate}
                          disabled={isGeolocating || isLoading}
                          className="flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          {isGeolocating ? "Locating..." : "Use Current Location"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Open Hours</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {days.map((day) => (
                          <FormField
                            key={day}
                            control={form.control}
                            name={`openHours.${day}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="capitalize">{day}</FormLabel>
                                <FormControl>
                                  <Input placeholder="09:00 - 17:00" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="specializations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specializations (comma-separated)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Oil Change, Tire Services, Engine Repair"
                              value={field.value?.join(", ") || ""}
                              onChange={(e) => field.onChange(e.target.value ? e.target.value.split(", ").map((s) => s.trim()) : [])}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter garage description" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <hr /><br />
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4">Garage System User | Contact Person</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contactPersonFirstName"
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
                          control={form.control}
                          name="contactPersonLastName"
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
                          control={form.control}
                          name="contactEmail"
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
                          control={form.control}
                          name="contactPhone"
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
                              <Input
                                type="password"
                                {...field}
                                disabled={isPasswordLoading}
                              />
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
                              <Input
                                type="password"
                                {...field}
                                disabled={isPasswordLoading}
                              />
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
                              <Input
                                type="password"
                                {...field}
                                disabled={isPasswordLoading}
                              />
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
      </div>
    </DashboardLayout>
  )
}