"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)

  // Mock user data
  const [userData, setUserData] = useState({
    name: "Jean Mutabazi",
    email: "jean.mutabazi@example.com",
    phone: "+250 78 123 4567",
    address: "KK 12 Ave, Kigali, Rwanda",
    idNumber: "1198780012345678",
    drivingLicense: "DL-RW-2018-123456",
    insurancePolicy: "POL-SA-2023-78901",
    avatar: "/placeholder.svg?height=128&width=128",
    notifications: {
      email: true,
      sms: true,
      app: true,
    },
    language: "en",
  })

  const handleSaveProfile = () => {
    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handleNotificationChange = (key: keyof typeof userData.notifications) => {
    setUserData({
      ...userData,
      notifications: {
        ...userData.notifications,
        [key]: !userData.notifications[key],
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button onClick={() => setIsEditing(!isEditing)}>{isEditing ? "Cancel" : "Edit Profile"}</Button>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback>
                      {userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                  )}
                </div>

                <div className="flex-1 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={userData.address}
                      onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id-number">National ID Number</Label>
                    <Input
                      id="id-number"
                      value={userData.idNumber}
                      onChange={(e) => setUserData({ ...userData, idNumber: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driving-license">Driving License</Label>
                    <Input
                      id="driving-license"
                      value={userData.drivingLicense}
                      onChange={(e) => setUserData({ ...userData, drivingLicense: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>Your insurance policy details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="insurance-policy">Policy Number</Label>
                  <Input id="insurance-policy" value={userData.insurancePolicy} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance-provider">Insurance Provider</Label>
                  <Input id="insurance-provider" value="Sanlam Alianz Insurance" disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy-start">Policy Start Date</Label>
                  <Input id="policy-start" value="01/01/2023" disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy-end">Policy End Date</Label>
                  <Input id="policy-end" value="31/12/2023" disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>Manage your uploaded documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-muted p-2 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Driving License</p>
                      <p className="text-sm text-muted-foreground">Uploaded on 15/01/2023</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-muted p-2 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">National ID</p>
                      <p className="text-sm text-muted-foreground">Uploaded on 15/01/2023</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-muted p-2 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Insurance Policy</p>
                      <p className="text-sm text-muted-foreground">Uploaded on 15/01/2023</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Upload New Document</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={userData.notifications.email}
                  onCheckedChange={() => handleNotificationChange("email")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={userData.notifications.sms}
                  onCheckedChange={() => handleNotificationChange("sms")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="app-notifications">In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications within the app</p>
                </div>
                <Switch
                  id="app-notifications"
                  checked={userData.notifications.app}
                  onCheckedChange={() => handleNotificationChange("app")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language & Regional Settings</CardTitle>
              <CardDescription>Manage your language and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={userData.language}
                  onValueChange={(value) => setUserData({ ...userData, language: value })}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="rw">Kinyarwanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Protect your account with an additional security layer
                  </p>
                </div>
                <Switch id="2fa" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Sessions</CardTitle>
              <CardDescription>Manage your active sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-muted p-2 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">Kigali, Rwanda • Chrome on Windows</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Active now</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Sign Out of All Devices</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
