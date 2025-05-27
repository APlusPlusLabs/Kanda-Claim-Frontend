"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "@/Next.js/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ClipboardCheck,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Calendar,
  Upload,
  Plus,
  Trash2,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

interface Props {
  params: Promise<{ id: string }>;
}
export default function SubmitAssessment({ params }: Props) {
  const router = useRouter()
  const { id } = use(params);
  const { user, apiRequest } = useAuth()
  const { toast } = useToast()

  const [damageDescription, setDamageDescription] = useState("")
  const [repairRecommendation, setRepairRecommendation] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [photos, setPhotos] = useState([])
  const [repairability, setRepairability] = useState("repairable")
  const [partsToReplace, setPartsToReplace] = useState([
    { id: 1, name: "Front Bumper", cost: 120000, selected: false },
    { id: 2, name: "Hood", cost: 180000, selected: false },
    { id: 3, name: "Radiator", cost: 150000, selected: false },
    { id: 4, name: "Headlights (Pair)", cost: 85000, selected: false },
    { id: 5, name: "Front Grill", cost: 45000, selected: false },
  ])
  const [laborCost, setLaborCost] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // In a real app, you would fetch this data from an API
  const assessment = {
    id: id,
    claimId: "CL-2025-001",
    vehicle: "Toyota RAV4",
    date: "2025-03-15",
    status: "Scheduled",
    customer: "Mugisha Nkusi",
    insurer: "Sanlam Alianz",
    location: "Kigali, Nyarugenge",
    scheduledDate: "2025-04-02",
  }

  const handlePhotoUpload = (e) => {
    // In a real app, you would handle file uploads to a server
    // This is a simplified version for demonstration
    const files = Array.from(e.target.files)
    const newPhotos = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }))
    setPhotos([...photos, ...newPhotos])
  }

  const removePhoto = (id) => {
    setPhotos(photos.filter((photo) => photo.id !== id))
  }

  const togglePartSelection = (id) => {
    setPartsToReplace(partsToReplace.map((part) => (part.id === id ? { ...part, selected: !part.selected } : part)))
  }

  const calculateTotalCost = () => {
    const partsCost = partsToReplace.filter((part) => part.selected).reduce((sum, part) => sum + part.cost, 0)

    const labor = Number.parseInt(laborCost) || 0
    return partsCost + labor
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Assessment Report Submitted",
      description: `Assessment report for ${assessment.vehicle} has been submitted successfully.`,
    })

    router.push(`/dashboard/assessor/assessments`)
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Habimana Jean",
        role: "Assessor",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/assessor", icon: <ClipboardCheck className="h-5 w-5" /> },
        { name: "Assessments", href: "/dashboard/assessor/assessments", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/assessor/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Schedule", href: "/dashboard/assessor/schedule", icon: <Calendar className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/assessor/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/assessor/profile", icon: <User className="h-5 w-5" /> },
        { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }
      ]}
    >
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/assessor">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/assessor/assessments">Assessments</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/assessor/assessments/${id}`}>{assessment.id}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Submit Report</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold">Submit Assessment Report</h1>
          <p className="text-muted-foreground">
            Assessment #{assessment.id} • Claim #{assessment.claimId} • {assessment.vehicle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Damage Assessment</CardTitle>
              <CardDescription>Provide details about the vehicle damage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repairability">Repairability Assessment</Label>
                <Select value={repairability} onValueChange={setRepairability}>
                  <SelectTrigger id="repairability">
                    <SelectValue placeholder="Select repairability status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repairable">Repairable</SelectItem>
                    <SelectItem value="repairable-economic">Repairable (Economic)</SelectItem>
                    <SelectItem value="total-loss">Total Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="damage-description">Damage Description</Label>
                <Textarea
                  id="damage-description"
                  placeholder="Describe the damage in detail"
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repair-recommendation">Repair Recommendation</Label>
                <Textarea
                  id="repair-recommendation"
                  placeholder="Provide your repair recommendations"
                  value={repairRecommendation}
                  onChange={(e) => setRepairRecommendation(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Photos</CardTitle>
              <CardDescription>Upload photos of the damaged vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="border rounded-lg overflow-hidden relative">
                    <img src={photo.url || "/placeholder.svg"} alt={photo.name} className="w-full h-40 object-cover" />
                    <div className="p-2 flex justify-between items-center">
                      <div className="text-sm truncate">{photo.name}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhoto(photo.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border border-dashed rounded-lg flex flex-col items-center justify-center p-4 h-40">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary">Upload photos</span>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Estimation</CardTitle>
              <CardDescription>Estimate repair costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Parts to Replace</h3>
                <div className="space-y-2">
                  {partsToReplace.map((part) => (
                    <div key={part.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <Checkbox
                          id={`part-${part.id}`}
                          checked={part.selected}
                          onCheckedChange={() => togglePartSelection(part.id)}
                        />
                        <label htmlFor={`part-${part.id}`} className="ml-2 text-sm font-medium">
                          {part.name}
                        </label>
                      </div>
                      <div className="text-sm">{part.cost.toLocaleString()} RWF</div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" /> Add Custom Part
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="labor-cost">Labor Cost (RWF)</Label>
                <Input
                  id="labor-cost"
                  type="number"
                  placeholder="Enter labor cost"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Estimated Cost:</span>
                  <span className="text-xl font-bold">{calculateTotalCost().toLocaleString()} RWF</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" asChild>
              <Link href={`/dashboard/assessor/assessments/${id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={!damageDescription || !repairRecommendation || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Assessment Report"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
