"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Building2, User, Upload, X, Wrench, Settings2Icon, Settings, UserCog } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { SignaturePad } from "@/components/e-signature/signature-pad"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

export default function InsurerProfile() {
  const { user, apiRequest } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)


  // File preview states
  const [logoPreview, setLogoPreview] = useState<string | null>(
    user?.tenant?.logo ? `${API_URL}tenants/${user.tenant.id}/logo` : null
  )
  const [stampPreview, setStampPreview] = useState<string | null>(
    user?.tenant?.stamp ? `${API_URL}tenants/${user.tenant.id}/stamp` : null
  )
  const [signatureData, setSignatureData] = useState<string | null>(
    user?.tenant?.digital_signature || null
  )

  // File states
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [stampFile, setStampFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    companyName: user?.tenant?.name || "",
    email: user?.tenant?.email || "",
    phone: user?.tenant?.phone || "",
    address: user?.tenant?.address || "",
    website: user?.tenant?.website || "",
    contactPersonFirstName: user.first_name || "",
    contactPersonLastName: user.last_name || "",
    contactEmail: user?.email || "",
    contactPhone: user?.phone || "",
    bio: user?.tenant?.description || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    min_amount_multisignature: user?.tenant?.min_amount_multisignature || 5000000,
    timezone: "Africa/Kigali",
  })

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, JPG, or SVG file.",
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result as string)
        setLogoFile(file)
      } else {
        setStampPreview(reader.result as string)
        setStampFile(file)
      }
    }
    reader.readAsDataURL(file)
  }





  const handleProfileUpdate = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData()

      // Add tenant data
      formDataToSend.append('name', formData.companyName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('website', formData.website)
      formDataToSend.append('description', formData.bio)
      formDataToSend.append('min_amount_multisignature', formData.min_amount_multisignature.toString())
      formDataToSend.append('tenant_id', user.tenant_id + '')
      formDataToSend.append('user_id', user.id + '')
      formDataToSend.append('contact_person_id', user.id + '')

      // Add files if present
      if (logoFile) {
        formDataToSend.append('logo', logoFile)
      }
      if (stampFile) {
        formDataToSend.append('stamp', stampFile)
      }
      if (signatureData) {
        formDataToSend.append('digital_signature', signatureData)
      }

      // Update tenant information
      const tenantResponse = await apiRequest(`${API_URL}tenants/${user.tenant_id}`, 'POST', formDataToSend)
      // const tenantResponse = await fetch(`${API_URL}tenants/${user.tenant.id}`, {
      //   method: 'POST', 
      //   headers: {
      //     'Authorization': `Bearer ${ sessionStorage.getItem("ottqen")}`,
      //   },
      //   body: formDataToSend,
      // })

      const tenantResult = await tenantResponse

      // Update user information
      const userData = {
        first_name: formData.contactPersonFirstName,
        last_name: formData.contactPersonLastName,
        email: formData.contactEmail,
        phone: formData.contactPhone,
        tenant_id: user.tenant_id,
        user_id: user.id,
      }

      const userResponse = await apiRequest(
        `${API_URL}users/${user.id}`,
        "PUT",
        userData
      )

      if (tenantResult.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been updated successfully.",
        })
        router.push('/login')
      } else {
        throw new Error("Failed to update profile")
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

  const handlePasswordUpdate = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsPasswordLoading(true)

    try {
      const passwordData = {
        current_password: formData.currentPassword,
        password: formData.newPassword,
        password_confirmation: formData.confirmPassword,
      }

      const response = await apiRequest(
        `${API_URL}users/${user.id}/password`,
        "PUT",
        passwordData
      )

      if (response.success) {
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully. Use it to Login now",
        })

        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))

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
        role: user?.tenant?.name,
        avatar: logoPreview || "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Garage Partners", href: "/dashboard/insurer/garages", icon: <Wrench className="h-5 w-5" /> },
        { name: "Settings (Departments & Claim Types)", href: "/dashboard/insurer/settings", icon: <Settings className="h-5 w-5" /> },
        { name: "Company Staff & Users", href: "/dashboard/insurer/users", icon: <UserCog className="h-5 w-5" /> },
        { name: "Company Profile", href: "/dashboard/insurer/profile", icon: <Settings2Icon className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6 space-x-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Company Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your company information and preferences</p>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={logoPreview || "/placeholder.svg?height=64&width=64"} alt={user?.tenant?.name} />
              <AvatarFallback>
                {user?.tenant?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CO'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="branding">Branding & Signature</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
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
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Company Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Company Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Company Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {/* <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) => handleSelectChange("language", value)}
                        disabled={isLoading}
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
                    </div> */}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_amount_multisignature">Minimum Amount to require Multi-signature approval</Label>
                    <Input
                      id="min_amount_multisignature"
                      type="number"
                      name="min_amount_multisignature"
                      value={formData.min_amount_multisignature}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Company Description</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">System User | Contact Person</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactPersonFirstName">First Name</Label>
                        <Input
                          id="contactPersonFirstName"
                          name="contactPersonFirstName"
                          value={formData.contactPersonFirstName}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPersonLastName">Last Name</Label>
                        <Input
                          id="contactPersonLastName"
                          name="contactPersonLastName"
                          value={formData.contactPersonLastName}
                          onChange={handleChange}
                          disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone</Label>
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
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
          </TabsContent>

          <TabsContent value="branding">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Logo</CardTitle>
                  <CardDescription>Upload your company logo (JPEG, PNG, JPG, or SVG)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {logoPreview && (
                      <div className="relative w-32 h-32">
                        <img
                          src={logoPreview}
                          alt="Company logo"
                          className="w-full h-full object-contain border rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => {
                            setLogoPreview(null)
                            setLogoFile(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/svg+xml"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        className="hidden"
                      />
                      <Label
                        htmlFor="logo"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Stamp</CardTitle>
                  <CardDescription>Upload your official company stamp (JPEG, PNG, JPG, or SVG)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stampPreview && (
                      <div className="relative w-32 h-32">
                        <img
                          src={stampPreview}
                          alt="Company stamp"
                          className="w-full h-full object-contain border rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => {
                            setStampPreview(null)
                            setStampFile(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Input
                        id="stamp"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/svg+xml"
                        onChange={(e) => handleFileChange(e, 'stamp')}
                        className="hidden"
                      />
                      <Label
                        htmlFor="stamp"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Stamp
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <CardContent>
                <div className="space-y-4">
                  {signatureData ? (
                    <div className="relative">
                      <img
                        src={signatureData}
                        alt="Digital signature"
                        className="border rounded p-2 bg-white"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => setSignatureData(null)}
                      >
                        Clear Signature
                      </Button>
                    </div>
                  ) : (
                    <SignaturePad
                      width={500}
                      height={200}
                      onChange={(signature) => setSignatureData(signature)}
                      className="w-full"
                    />
                  )}
                </div>
              </CardContent>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
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
                        disabled={isPasswordLoading}
                        required
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
                        disabled={isPasswordLoading}
                        required
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
                        disabled={isPasswordLoading}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isPasswordLoading}>
                    {isPasswordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}