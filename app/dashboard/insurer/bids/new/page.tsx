"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronLeft, Plus, Trash2, Upload } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";
interface Vehicle {
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
}

interface Claim {
  id: string;
  code: string;
  customer: string;
  vehicle_info: string;
  vehicle: Vehicle;
}

interface Assessment {
  id: string;
  claim_id: string;
  claim: { id: string; code: string; user: { name: string } };
  vehicle: Vehicle;
  report?: {
    partsToReplace: { id: number; name: string; cost: string; category: string; selected: boolean }[];
    [key: string]: any;
  };
}
// Form schema
const formSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required"),
  vehicleInfo: z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().min(1, "Year is required"),
    licensePlate: z.string().min(1, "License plate is required"),
    vin: z.string().min(1, "VIN is required"),
  }),
  damageDescription: z.string().min(1, "Damage description is required"),
  scopeOfWork: z.array(z.string()).min(1, "At least one scope of work item is required"),
  estimatedCost: z.number().min(0, "Estimated cost must be a positive number"),
  requestMultipleQuotations: z.boolean().default(true),
  photos: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  // Add these fields to handle the scope item input and uploads
  newScopeItem: z.string().optional(),
  uploadedPhotos: z.array(z.string()).optional(),
  uploadedDocuments: z.array(z.string()).optional(),
})

export default function NewBidPage() {
  const router = useRouter()
  const { user, apiRequest } = useAuth()
  const { toast } = useToast()
  const [scopeItems, setScopeItems] = useState<string[]>([])
  const [newScopeItem, setNewScopeItem] = useState("")
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  useEffect(() => {
    const loadAssessments = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest(`${API_URL}assessments-completed/${user.tenant_id}`, "GET");
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format: Expected an array");
        }
        const clmz: Claim[] = response.data
          .filter((ass: any) => ass.claim && ass.vehicle) // Ensure claim and vehicle exist
          .map((ass: any) => {
            const clm = ass.claim;
            const veh = ass.vehicle;
            const vehInfo = `${veh.model} ${veh.make} ${veh.year} (${veh.license_plate})`; // Fix typo
            return {
              id: clm.id,
              code: clm.code,
              customer: clm.user?.name || "Unknown",
              vehicle_info: vehInfo,
              vehicle: {
                make: veh.make,
                model: veh.model,
                year: veh.year,
                license_plate: veh.license_plate, // Fix typo
                vin: veh.vin,
              },
            };
          });
        setClaims(clmz);
        setAssessments(response.data);
      } catch (error) {
        console.error("Error loading assessments:", error);
        toast({
          title: "Error Loading Assessments",
          description: "There was an error loading the assessments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessments();
  }, [apiRequest, user.tenant_id, toast]);

  // Initialize form with empty values and ensure resolver is applied
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      claimId: "",
      vehicleInfo: {
        make: "",
        model: "",
        year: "",
        licensePlate: "",
        vin: "",
      },
      damageDescription: "",
      scopeOfWork: [],
      estimatedCost: 0,
      requestMultipleQuotations: true,
      photos: [],
      documents: [],
      newScopeItem: "",
      uploadedPhotos: [],
      uploadedDocuments: [],
    },
  })

  // Reset form when page loads
  useEffect(() => {
    // Reset all form fields to default values
    form.reset({
      claimId: "",
      vehicleInfo: {
        make: "",
        model: "",
        year: "",
        licensePlate: "",
        vin: "",
      },
      damageDescription: "",
      scopeOfWork: [],
      estimatedCost: 0,
      requestMultipleQuotations: true,
      photos: [],
      documents: [],
      newScopeItem: "",
      uploadedPhotos: [],
      uploadedDocuments: [],
    })

    // Clear any local state
    setScopeItems([])
    setNewScopeItem("")
    setUploadedPhotos([])
    setUploadedDocuments([])
  }, [form])

  // Handle claim selection
  const handleClaimSelect = (claimId: string) => {
    if (!claimId) {
      form.setValue("vehicleInfo", {
        make: "",
        model: "",
        year: "",
        licensePlate: "",
        vin: "",
      });
      form.setValue("scopeOfWork", []);
      form.setValue("estimatedCost", 0);
      setScopeItems([]);
      return;
    }

    const selectedClaim = claims.find(cl => cl.id === claimId);
    if (selectedClaim) {
      form.setValue("vehicleInfo", {
        make: selectedClaim.vehicle.make,
        model: selectedClaim.vehicle.model,
        year: selectedClaim.vehicle.year.toString(),
        licensePlate: selectedClaim.vehicle.license_plate,
        vin: selectedClaim.vehicle.vin,
      });

      const selectedAssessment = assessments.find(ass => ass.claim_id === claimId);
      if (selectedAssessment) {
        const reportData = selectedAssessment.report;
        const report = (typeof reportData === 'string' ? JSON.parse(reportData) : reportData)
        if (report.partsToReplace) {
          console.log('partsToReplace', selectedAssessment?.report?.partsToReplace);

          const newScopeItems = report.partsToReplace.map(
            (part: { name: string; cost: string }) => `${part.name} (${part.cost} RWF)`
          );
          setScopeItems(newScopeItems);
          form.setValue("scopeOfWork", newScopeItems);
          form.setValue("estimatedCost", report.totalCost || 0);
        } else {
          console.log('No partsToReplace', selectedAssessment?.report);
          setScopeItems([]);
          form.setValue("scopeOfWork", []);
          form.setValue("estimatedCost", 0);
        }
      }
    }
  };
  // Handle adding scope item

  const handleAddScopeItem = () => {
    if (newScopeItem.trim() !== "") {
      const updatedItems = [...scopeItems, newScopeItem.trim()];
      setScopeItems(updatedItems);
      form.setValue("scopeOfWork", updatedItems);
      setNewScopeItem("");
      form.setValue("newScopeItem", "");
    }
  };

  // Handle removing scope item
  const handleRemoveScopeItem = (index: number) => {
    const updatedItems = scopeItems.filter((_, i) => i !== index)
    setScopeItems(updatedItems)
    form.setValue("scopeOfWork", updatedItems)
  }
  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const formData = new FormData();
      Array.from(e.target.files).forEach(file => formData.append("photos", file));
      try {
        const response = await apiRequest(`${API_URL}upload/photos`, "POST", formData);
        const newPhotos = response.data.urls;
        const updatedPhotos = [...uploadedPhotos, ...newPhotos];
        setUploadedPhotos(updatedPhotos);
        form.setValue("photos", updatedPhotos);
        form.setValue("uploadedPhotos", updatedPhotos);
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload photos. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const formData = new FormData();
      Array.from(e.target.files).forEach(file => formData.append("photos", file));
      try {
        const response = await apiRequest(`${API_URL}upload/photos`, "POST", formData);
        const newPhotos = response.data.urls; // Assuming API returns an array of URLs
        const updatedPhotos = [...uploadedPhotos, ...newPhotos];
        setUploadedPhotos(updatedPhotos);
        form.setValue("photos", updatedPhotos);
        form.setValue("uploadedPhotos", updatedPhotos);
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload photos. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    try {
      // In a real app, you would send the data to the server
      console.log("Creating new bid with values:", values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a new bid ID
      const newBidId = `BID-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`

      toast({
        title: "Bid Created Successfully",
        description: `Bid ${newBidId} has been created.`,
      })

      // Redirect to the bids page
      router.push("/dashboard/insurer/bids")
    } catch (error) {
      console.error("Error creating bid:", error)
      toast({
        title: "Error Creating Bid",
        description: "There was an error creating the bid. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle saving as draft
  const handleSaveDraft = async () => {
    try {
      const formValues = form.getValues()
      console.log("Saving draft with values:", formValues)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      toast({
        title: "Draft Saved",
        description: "Your bid draft has been saved.",
      })

      router.push("/dashboard/insurer/bids")
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error Saving Draft",
        description: "There was an error saving the draft. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout
      user={{
        name: user.name,
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: null },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: null },
        { name: "Bids", href: "/dashboard/insurer/bids", icon: null },
        { name: "Documents", href: "/dashboard/insurer/documents", icon: null },
      ]}
    >
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/insurer">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/insurer/bids">Bids</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Create New Bid</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Repair Bid</h1>
            <p className="text-muted-foreground">Create a new bid for vehicle repairs</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/insurer/bids">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Bids
            </Link>
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Claim Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Claim</CardTitle>
                <CardDescription>Select the claim this bid is associated with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {isLoading ? (
                    <div className="text-center">Loading claims...</div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="claimId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Claim</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleClaimSelect(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a claim" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {claims.map((claim) => (
                                <SelectItem key={claim.id} value={claim.id}>
                                  {claim.code} - {claim.customer} ({claim.vehicle_info})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Selecting a claim will automatically populate vehicle information
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>Enter details about the vehicle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleInfo.make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Toyota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleInfo.model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., RAV4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleInfo.year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleInfo.licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., RAC 123A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleInfo.vin"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>VIN</FormLabel>
                        <FormControl>
                          <Input placeholder="Vehicle Identification Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Damage and Repair Information */}
            <Card>
              <CardHeader>
                <CardTitle>Damage and Repair Information</CardTitle>
                <CardDescription>Describe the damage and required repairs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="damageDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Damage Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the damage to the vehicle in detail"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Scope of Work Section - Properly wrapped in FormField */}
                  <FormField
                    control={form.control}
                    name="newScopeItem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scope of Work</FormLabel>
                        <FormDescription>List the repairs that need to be done</FormDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <FormControl>
                            <Input
                              placeholder="Add repair item"
                              {...field}
                              value={newScopeItem}
                              onChange={(e) => {
                                setNewScopeItem(e.target.value);
                                field.onChange(e);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddScopeItem();
                                }
                              }}
                            />
                          </FormControl>
                          <Button type="button" onClick={handleAddScopeItem}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {scopeItems.length > 0 ? (
                          <ul className="mt-4 space-y-2">
                            {scopeItems.map((item, index) => (
                              <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                <span>{item}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveScopeItem(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-2">
                            No scope items added yet. Add at least one item or select a claim to auto-populate.
                          </p>
                        )}
                        {form.formState.errors.scopeOfWork && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {form.formState.errors.scopeOfWork?.root?.message || "At least one scope item is required"}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Cost (RWF)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Enter the estimated cost of repairs in Rwandan Francs</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requestMultipleQuotations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Request Multiple Quotations</FormLabel>
                          <FormDescription>Allow multiple garages to submit bids for this repair</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photos and Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Photos and Documents</CardTitle>
                <CardDescription>Upload photos of the damage and relevant documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Photos Section - Properly wrapped in FormField */}
                  <FormField
                    control={form.control}
                    name="uploadedPhotos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Damage Photos</FormLabel>
                        <div className="mt-2">
                          <div
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted"
                            onClick={() => document.getElementById("photo-upload")?.click()}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                            </div>
                            <input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handlePhotoUpload}
                            />
                          </div>
                        </div>
                        {uploadedPhotos.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {uploadedPhotos.map((photo, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={photo || "/placeholder.svg"}
                                  alt={`Damage photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-md"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0"
                                  onClick={() => {
                                    const updatedPhotos = uploadedPhotos.filter((_, i) => i !== index)
                                    setUploadedPhotos(updatedPhotos)
                                    form.setValue("photos", updatedPhotos)
                                    form.setValue("uploadedPhotos", updatedPhotos)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <FormDescription>Upload photos of the vehicle damage</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Documents Section - Properly wrapped in FormField */}
                  <FormField
                    control={form.control}
                    name="uploadedDocuments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Documents</FormLabel>
                        <div className="mt-2">
                          <div
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted"
                            onClick={() => document.getElementById("document-upload")?.click()}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Upload damage reports, assessments, etc.</p>
                            </div>
                            <input
                              id="document-upload"
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx"
                              multiple
                              className="hidden"
                              onChange={handleDocumentUpload}
                            />
                          </div>
                        </div>
                        {uploadedDocuments.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {uploadedDocuments.map((doc, index) => (
                              <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                <span className="text-sm">{doc}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updatedDocs = uploadedDocuments.filter((_, i) => i !== index)
                                    setUploadedDocuments(updatedDocs)
                                    form.setValue("documents", updatedDocs)
                                    form.setValue("uploadedDocuments", updatedDocs)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <FormDescription>Upload any relevant documents related to the repair</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/insurer/bids")}>
                Cancel
              </Button>
              <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
                Save as Draft
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Bid"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  )
}
