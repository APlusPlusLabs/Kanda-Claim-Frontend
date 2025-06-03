"use client"

import { use, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  Edit,
  Save,
  X
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

interface Props {
  params: Promise<{ id: string }>;
}

interface Part {
  id: number;
  name: string;
  cost: number;
  selected: boolean;
  category?: string;
}

interface Photo {
  id: number;
  name: string;
  size: number;
  url: string;
  file?: File;
}

export default function SubmitAssessment({ params }: Props) {
  const router = useRouter()
  const { id } = use(params);
  const { user, apiRequest } = useAuth()
  const { toast } = useToast()

  // Form state
  const [damageDescription, setDamageDescription] = useState("")
  const [repairRecommendation, setRepairRecommendation] = useState("")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [severity, setSeverity] = useState("moderate")
  const [partsToReplace, setPartsToReplace] = useState<Part[]>([])
  const [laborCost, setLaborCost] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState<any>(null)

  // Parts management state
  const [showAddPartDialog, setShowAddPartDialog] = useState(false)
  const [newPartName, setNewPartName] = useState("")
  const [newPartCost, setNewPartCost] = useState("")
  const [newPartCategory, setNewPartCategory] = useState("body")
  const [editingPart, setEditingPart] = useState<Part | null>(null)

  // Fetch assessment data
  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiRequest(`${API_URL}assessmentby/${id}`, "GET")

      if (response.success) {
        const assessmentData = response.data
        setAssessment(assessmentData)

        // Pre-fill form if there's existing data
        if (assessmentData.report) {
          try {
            const reportData = JSON.parse(assessmentData.report)
            setDamageDescription(reportData.damageDescription || "")
            setRepairRecommendation(reportData.repairRecommendation || "")
            setPartsToReplace(reportData.partsToReplace || [])
            setLaborCost(reportData.laborCost || "")
          } catch (e) {
            // If report is not JSON, treat as damage description
            setDamageDescription(assessmentData.report)
          }
        }

        if (assessmentData.severity) {
          setSeverity(assessmentData.severity)
        }
      }
    } catch (error: any) {
      console.error("Error fetching assessment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assessment data: " + error,
      })
    } finally {
      setLoading(false)
    }
  }, [apiRequest, id, toast])

  useEffect(() => {
    if (user) {
      fetchAssessment()
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You need to be logged in to access this page",
      })
      router.push("/login")
    }
  }, [user, fetchAssessment, router, toast])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPhotos: Photo[] = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      file: file
    }))
    setPhotos([...photos, ...newPhotos])
  }

  const removePhoto = (id: number) => {
    const photo = photos.find(p => p.id === id)
    if (photo?.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url)
    }
    setPhotos(photos.filter((photo) => photo.id !== id))
  }

  const addPart = () => {
    if (!newPartName.trim() || !newPartCost) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all part details"
      })
      return
    }

    const newPart: Part = {
      id: Date.now(),
      name: newPartName.trim(),
      cost: parseFloat(newPartCost),
      selected: false,
      category: newPartCategory
    }

    setPartsToReplace([...partsToReplace, newPart])
    setNewPartName("")
    setNewPartCost("")
    setNewPartCategory("body")
    setShowAddPartDialog(false)

    toast({
      title: "Part Added",
      description: `${newPart.name} has been added to the parts list`
    })
  }

  const updatePart = (updatedPart: Part) => {
    setPartsToReplace(partsToReplace.map(part =>
      part.id === updatedPart.id ? updatedPart : part
    ))
    setEditingPart(null)

    toast({
      title: "Part Updated",
      description: `${updatedPart.name} has been updated`
    })
  }

  const removePart = (id: number) => {
    setPartsToReplace(partsToReplace.filter(part => part.id !== id))
    toast({
      title: "Part Removed",
      description: "Part has been removed from the list"
    })
  }

  const togglePartSelection = (id: number) => {
    setPartsToReplace(partsToReplace.map((part) =>
      part.id === id ? { ...part, selected: !part.selected } : part
    ))
  }

  const calculateTotalCost = () => {
    const partsCost = partsToReplace
      .filter((part) => part.selected)
      .reduce((sum, part) => sum + part.cost, 0)

    const labor = parseFloat(laborCost) || 0
    return partsCost + labor
  }

  const uploadPhotos = async (): Promise<string[]> => {
    const photoUrls: string[] = []

    for (const photo of photos) {
      if (photo.file) {
        try {
          const formData = new FormData()
          formData.append('file', photo.file)
          formData.append('type', 'assessment')

          const response = await apiRequest(`${API_URL}claims/${assessment.claim.id}/documents/upload`, 'POST', formData)

          if (response) {
            photoUrls.push(response.file_path)
          }
        } catch (error) {
          console.error('Error uploading photo:', error)
          toast({
            variant: "destructive",
            title: "Error",
            description: 'Error uploading photo: ' + error
          })
        }
      }
    }

    return photoUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    if (!damageDescription.trim() || !repairRecommendation.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Upload photos first
      const photoUrls = await uploadPhotos()

      // Prepare report data
      const reportData = {
        damageDescription: damageDescription.trim(),
        repairRecommendation: repairRecommendation.trim(),
        partsToReplace,
        selectedParts: partsToReplace.filter(part => part.selected),
        laborCost: parseFloat(laborCost) || 0,
        totalCost: calculateTotalCost(),
        photos: photoUrls,
        submittedAt: new Date().toISOString()
      }

      const updateData = {
        report: JSON.stringify(reportData),
        status: 'completed',
        severity: severity,
        notes: `Assessment completed. Total estimated cost: ${calculateTotalCost().toLocaleString()} RWF`,
        assessor_id: user.id
      }
      const formdata = new FormData()
      formdata.set('report', JSON.stringify(reportData))
      formdata.set('status', 'completed')
      formdata.set('severity', severity)
      formdata.set('notes', `Assessment completed. Total estimated cost: ${calculateTotalCost().toLocaleString()} RWF`)
      formdata.set('assessor_id', user.id)
      formdata.set('estimated_amount', calculateTotalCost().toLocaleString())
      formdata.set('tenant_id', user.tenant_id)
      formdata.set('user_id', user.id)
      const response = await apiRequest(`${API_URL}assessments/${assessment.id}`, 'PUT', updateData)

      if (response.success) {
        toast({
          title: "Assessment Report Submitted",
          description: `Assessment report has been submitted successfully.`,
        })

        router.push('/dashboard/assessor/assessments')
      }
    } catch (error: any) {
      console.error("Error submitting assessment:", error)

      if (Array.isArray(error.errors)) {
        error.errors.forEach((er: string) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: er,
          })
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to submit assessment report. Please try again.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-10 w-1/4 rounded"></div>
        <div className="animate-pulse bg-muted h-64 w-full rounded"></div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-muted-foreground">Failed to load assessment data.</p>
        <Button onClick={() => router.push("/dashboard/assessor/assessments")} className="mt-4">
          Back to Assessments
        </Button>
      </div>
    )
  }

  return (
    <DashboardLayout
      user={{
        name: user?.name || "Assessor",
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
            Assessment #{assessment.code} • Claim #{assessment.claim?.code} • {assessment.vehicle?.make} {assessment.vehicle?.model}
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
                <Label htmlFor="severity">Damage Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select damage severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="total_loss">Total Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="damage-description">Damage Description *</Label>
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
                <Label htmlFor="repair-recommendation">Repair Recommendation *</Label>
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
                    <img src={photo.url} alt={photo.name} className="w-full h-40 object-cover" />
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
              <CardTitle className="flex items-center justify-between">
                Cost Estimation
                <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add Part
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Part</DialogTitle>
                      <DialogDescription>
                        Add a new part to the repair cost estimation
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="part-name">Part Name</Label>
                        <Input
                          id="part-name"
                          placeholder="Enter part name"
                          value={newPartName}
                          onChange={(e) => setNewPartName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="part-cost">Cost (RWF)</Label>
                        <Input
                          id="part-cost"
                          type="number"
                          placeholder="Enter cost"
                          value={newPartCost}
                          onChange={(e) => setNewPartCost(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="part-category">Category</Label>
                        <Select value={newPartCategory} onValueChange={setNewPartCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="body">Body Parts</SelectItem>
                            <SelectItem value="engine">Engine Parts</SelectItem>
                            <SelectItem value="electrical">Electrical</SelectItem>
                            <SelectItem value="interior">Interior</SelectItem>
                            <SelectItem value="suspension">Suspension</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAddPartDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={addPart}>
                        Add Part
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Estimate repair costs and select required parts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Parts to Replace</h3>
                {partsToReplace.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No parts added yet. Click "Add Part" to start building your parts list.</p>
                ) : (
                  <div className="space-y-2">
                    {partsToReplace.map((part) => (
                      <div key={part.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center flex-1">
                          <Checkbox
                            id={`part-${part.id}`}
                            checked={part.selected}
                            onCheckedChange={() => togglePartSelection(part.id)}
                          />
                          <div className="ml-2 flex-1">
                            {editingPart?.id === part.id ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={editingPart.name}
                                  onChange={(e) => setEditingPart({ ...editingPart, name: e.target.value })}
                                  className="h-8"
                                />
                                <Input
                                  type="number"
                                  value={editingPart.cost}
                                  onChange={(e) => setEditingPart({ ...editingPart, cost: parseFloat(e.target.value) || 0 })}
                                  className="h-8 w-24"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => updatePart(editingPart)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingPart(null)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium">{part.name}</span>
                                  {part.category && (
                                    <span className="text-xs text-muted-foreground ml-2">({part.category})</span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">{part.cost.toLocaleString()} RWF</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingPart(part)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePart(part.id)}
                                    className="h-8 w-8 p-0 text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Selected Parts Cost:</span>
                    <span>{partsToReplace.filter(p => p.selected).reduce((sum, part) => sum + part.cost, 0).toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Labor Cost:</span>
                    <span>{(parseFloat(laborCost) || 0).toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
                    <span>Total Estimated Cost:</span>
                    <span>{calculateTotalCost().toLocaleString()} RWF</span>
                  </div>
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