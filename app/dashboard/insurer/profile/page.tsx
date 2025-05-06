"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Building2, FileText, MessageSquare, Bell, User, LogOut } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InsurerProfile() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    companyName: "Sanlam Alianz Rwanda",
    email: "info@sanlamalianz.rw",
    phone: "+250 788 123 456",
    address: "KG 123 St, Kigali, Rwanda",
    website: "www.sanlamalianz.rw",
    contactPerson: "Marie Uwase",
    contactEmail: "marie.uwase@sanlamalianz.rw",
    contactPhone: "+250 788 234 567",
    bio: "Sanlam Alianz is a leading insurance provider in Rwanda, offering comprehensive coverage for vehicles, property, and more.",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    smsNotifications: true,
    appNotifications: true,
    language: "en",
    timezone: "Africa/Kigali",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = (e) => {
    e.preventDefault()
    // In a real app, you would send this data to an API
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handlePasswordUpdate = (e) => {
    e.preventDefault()
    // In a real app, you would validate and send this data to an API
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Password Updated",
      description: "Your password has been updated successfully.",
    })

    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }))
  }

  const handleNotificationUpdate = (e) => {
    e.preventDefault()
    // In a real app, you would send this data to an API
    toast({
      title: "Notification Preferences Updated",
      description: "Your notification preferences have been updated successfully.",
    })
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Marie Uwase",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/insurer/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/insurer/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/insurer/profile", icon: <User className="h-5 w-5" /> },
      ]}
      actions={[{ name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }]}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Company Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your company information and preferences</p>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Sanlam Alianz" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleProfileUpdate}>
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Update your company details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Company Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Company Phone</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Company Address</Label>
                      <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" name="website" value={formData.website} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) => handleSelectChange("language", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="rw">Kinyarwanda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Company Description</Label>
                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} />
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Primary Contact Person</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Name</Label>
                        <Input
                          id="contactPerson"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone</Label>
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="security">
            <form onSubmit={handlePasswordUpdate}>
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Update your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit">Update Password</Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="notifications">
            <form onSubmit={handleNotificationUpdate}>
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={formData.smsNotifications}
                        onCheckedChange={(checked) => handleSwitchChange("smsNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="appNotifications">In-App Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications within the application</p>
                      </div>
                      <Switch
                        id="appNotifications"
                        checked={formData.appNotifications}
                        onCheckedChange={(checked) => handleSwitchChange("appNotifications", checked)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>New Claims</Label>
                          <p className="text-sm text-muted-foreground">Notifications when new claims are submitted</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Claim Updates</Label>
                          <p className="text-sm text-muted-foreground">Notifications when claims are updated</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Messages</Label>
                          <p className="text-sm text-muted-foreground">Notifications for new messages</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Third-Party Claims</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifications for third-party claim submissions
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit">Save Preferences</Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
