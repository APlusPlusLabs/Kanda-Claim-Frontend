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
import { ChevronLeft, FileText, Loader2, Plus, Trash2, Upload } from "lucide-react"
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
    selectedParts: { id: number; name: string; cost: string; category: string; selected: boolean }[];
    photos: string[];
    totalCost: number;
    [key: string]: any;
  };
}
// Form schema
const formSchema = z.object({
  claim_id: z.string().min(1, "Claim ID is required"),
  vehicle_info: z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().min(1, "Year is required"),
    license_plate: z.string().min(1, "License plate is required"),
    vin: z.string().min(1, "VIN is required"),
  }),
  damage_description: z.string().min(1, "Damage description is required"),
  scope_of_work: z.array(z.string()).min(1, "At least one scope of work item is required"),
  estimated_cost: z.number().min(0, "Estimated cost must be a positive number"),
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
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false);
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
          .filter((ass: any) => ass.claim && ass.vehicle)
          .map((ass: any) => {
            const clm = ass.claim;
            const veh = ass.vehicle;
            const vehInfo = `${veh.model} ${veh.make} ${veh.year} (${veh.license_plate})`;
            return {
              id: clm.id,
              code: clm.code,
              customer: clm.user?.name || "Unknown",
              vehicle_info: vehInfo,
              vehicle: {
                make: veh.make,
                model: veh.model,
                year: veh.year,
                license_plate: veh.license_plate,
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      claim_id: "",
      vehicle_info: {
        make: "",
        model: "",
        year: "",
        license_plate: "",
        vin: "",
      },
      damage_description: "",
      scope_of_work: [],
      estimated_cost: 0,
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
    form.reset({
      claim_id: "",
      vehicle_info: {
        make: "",
        model: "",
        year: "",
        license_plate: "",
        vin: "",
      },
      damage_description: "",
      scope_of_work: [],
      estimated_cost: 0,
      requestMultipleQuotations: true,
      photos: [],
      documents: [],
      newScopeItem: "",
      uploadedPhotos: [],
      uploadedDocuments: [],
    })

    setScopeItems([])
    setNewScopeItem("")
    setUploadedPhotos([])
    setUploadedDocuments([])
  }, [form])

  // Handle claim selection
  const handleClaimSelect = (claim_id: string) => {
    if (!claim_id) {
      form.setValue("vehicle_info", {
        make: "",
        model: "",
        year: "",
        license_plate: "",
        vin: "",
      });
      form.setValue("scope_of_work", []);
      form.setValue("photos", []);
      form.setValue("uploadedPhotos", []);
      form.setValue("estimated_cost", 0);
      setScopeItems([]);
      setUploadedPhotos([]);
      return;
    }

    const selectedClaim = claims.find(cl => cl.id === claim_id);
    if (selectedClaim) {
      form.setValue("vehicle_info", {
        make: selectedClaim.vehicle.make,
        model: selectedClaim.vehicle.model,
        year: selectedClaim.vehicle.year.toString(),
        license_plate: selectedClaim.vehicle.license_plate,
        vin: selectedClaim.vehicle.vin,
      });

      const selectedAssessment = assessments.find(ass => ass.claim_id === claim_id);
      if (selectedAssessment) {
        const reportData = selectedAssessment.report;
        const report = typeof reportData === 'string' ? JSON.parse(reportData) : reportData;
        if (report) {
          const partsToReplace = report.partsToReplace || [];
          const selectedParts = report.selectedParts || [];
          const combinedParts = [...partsToReplace, ...selectedParts];
          const newScopeItems = combinedParts.map(
            (part: { name: string; cost: string }) => `${part.name} (${part.cost} RWF)`
          );
          setScopeItems(newScopeItems);
          form.setValue("scope_of_work", newScopeItems);

          // Pre-populate photos
          const reportPhotos = (report.photos || []).map((photo: string) =>
            photo.startsWith("http") ? photo : `${STORAGES_URL}${photo}`
          );
          setUploadedPhotos(reportPhotos);
          form.setValue("photos", reportPhotos);
          form.setValue("uploadedPhotos", reportPhotos);

          // Set estimated cost
          form.setValue("estimated_cost", report.totalCost || 0);
          // damage_description preset
          form.setValue("damage_description", report.damage_description + "\n" + report.repairRecommendation)
        } else {
          setScopeItems([]);
          form.setValue("scope_of_work", []);
          form.setValue("photos", []);
          form.setValue("uploadedPhotos", []);
          setUploadedPhotos([]);
          form.setValue("estimated_cost", 0);
        }
      } else {
        setScopeItems([]);
        form.setValue("scope_of_work", []);
        form.setValue("photos", []);
        form.setValue("uploadedPhotos", []);
        setUploadedPhotos([]);
        form.setValue("estimated_cost", 0);
      }
    }
  };
  // Handle adding scope item

  const handleAddScopeItem = () => {
    if (newScopeItem.trim() !== "") {
      const updatedItems = [...scopeItems, newScopeItem.trim()];
      setScopeItems(updatedItems);
      form.setValue("scope_of_work", updatedItems);
      setNewScopeItem("");
      form.setValue("newScopeItem", "");
    }
  };

  // Handle removing scope item
  const handleRemoveScopeItem = (index: number) => {
    const updatedItems = scopeItems.filter((_, i) => i !== index)
    setScopeItems(updatedItems)
    form.setValue("scope_of_work", updatedItems)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Update selected files state
      setSelectedPhotos(prev => [...prev, ...newFiles]);

      // Create preview URLs for display
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);

      // Update form with file names for display purposes
      const allPhotoNames = [...selectedPhotos, ...newFiles].map(file => file.name);
      form.setValue("photos", allPhotoNames);
      form.setValue("uploadedPhotos", allPhotoNames);
    }
  };

  // Updated document upload handler - stores files client-side
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Update selected files state
      setSelectedDocuments(prev => [...prev, ...newFiles]);

      // Update form with file names for display purposes
      const allDocNames = [...selectedDocuments, ...newFiles].map(file => file.name);
      form.setValue("documents", allDocNames);
      form.setValue("uploadedDocuments", allDocNames);
    }
  };

  // Helper function to upload files after bid creation
  const uploadFilesToBid = async (files: File[], bidId: string, type: 'bid-photo' | 'bid-document') => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append('type', type);
      formData.append('user_id', user.id);
      formData.append('tenant_id', user.tenant_id);
      formData.append('table_id', bidId);
      formData.append('table_name', "bids");

      return apiRequest(`${API_URL}upload/${type === 'bid-photo' ? 'photos' : 'documents'}`, "POST", formData);
    });

    return Promise.all(uploadPromises);
  };

  // Updated form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // 1. Create bid first (without file paths)
      const payload = {
        claim_id: values.claim_id,
        tenant_id: user.tenant_id,
        user_id: user.id,
        vehicle_info: {
          make: values.vehicle_info.make,
          model: values.vehicle_info.model,
          year: values.vehicle_info.year,
          license_plate: values.vehicle_info.license_plate,
          vin: values.vehicle_info.vin,
        },
        damage_description: values.damage_description,
        scope_of_work: values.scope_of_work,
        estimated_cost: values.estimated_cost,
        request_multiple_quotations: values.requestMultipleQuotations,
        // Don't include file paths yet
        photos: [],
        documents: [],
        status: 'open',
      };

      const response = await apiRequest(`${API_URL}bids`, 'POST', payload);
      const bidId = response.bid.id;

      // 2. Upload all files with the bid ID
      const uploadPromises = [];

      if (selectedPhotos.length > 0) {
        uploadPromises.push(uploadFilesToBid(selectedPhotos, bidId, 'bid-photo'));
      }

      if (selectedDocuments.length > 0) {
        uploadPromises.push(uploadFilesToBid(selectedDocuments, bidId, 'bid-document'));
      }

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // 3. Clean up preview URLs to prevent memory leaks
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setPhotoPreviewUrls([]);
      setSelectedPhotos([]);
      setSelectedDocuments([]);

      toast({
        title: 'Bid Created Successfully',
        description: `Bid ${response.bid.code} has been created and all files uploaded.`,
      });

      router.push('/dashboard/insurer/bids');

    } catch (error: any) {
      console.error('Error creating bid:', error);

      // Clean up preview URLs on error
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setPhotoPreviewUrls([]);

      let errorMessage = 'There was an error creating the bid. Please try again.';
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(' ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Error Creating Bid',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Helper function to remove a selected photo
  const removePhoto = (index: number) => {
    // Revoke the URL to prevent memory leak
    URL.revokeObjectURL(photoPreviewUrls[index]);

    // Remove from arrays
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));

    // Update form
    const remainingPhotoNames = selectedPhotos
      .filter((_, i) => i !== index)
      .map(file => file.name);
    form.setValue("photos", remainingPhotoNames);
  };

  // Helper function to remove a selected document
  const removeDocument = (index: number) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));

    const remainingDocNames = selectedDocuments
      .filter((_, i) => i !== index)
      .map(file => file.name);
    form.setValue("documents", remainingDocNames);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      // Clean up any remaining preview URLs
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);
  // Handle saving as draft
  const handleSaveDraft = async () => {
    try {
      const values = form.getValues();
      const payload = {
        claim_id: values.claim_id,
        tenant_id: user.tenant_id,
        user_id: user.id,
        vehicle_info: {
          make: values.vehicle_info.make,
          model: values.vehicle_info.model,
          year: values.vehicle_info.year,
          license_plate: values.vehicle_info.license_plate,
        },
        damage_description: values.damage_description,
        scope_of_work: values.scope_of_work,
        estimated_cost: values.estimated_cost,
        request_multiple_quotations: values.requestMultipleQuotations,
        photos: values.photos ?? [],
        documents: values.documents ?? [],
        status: 'draft',
      };

      const response = await apiRequest(`${API_URL}bids/draft`, 'POST', payload);

      toast({
        title: 'Draft Saved',
        description: `Bid ${response.bid.code} has been saved as draft.`,
      });

      router.push('/dashboard/insurer/bids');
    } catch (error: any) {
      console.error('Error saving draft:', error);

      let errorMessage = 'There was an error saving the draft. Please try again.';
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(' ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Error Saving Draft',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

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
                      name="claim_id"
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
                    name="vehicle_info.make"
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
                    name="vehicle_info.model"
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
                    name="vehicle_info.year"
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
                    name="vehicle_info.license_plate"
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
                    name="vehicle_info.vin"
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
                    name="damage_description"
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
                        {form.formState.errors.scope_of_work && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {form.formState.errors.scope_of_work?.root?.message || "At least one scope item is required"}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimated_cost"
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

           
            {/* Photos and Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle>Photos and Documents</CardTitle>
                <CardDescription>Upload photos of the damage and relevant documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
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
                        {selectedPhotos.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {selectedPhotos.map((photo, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={photoPreviewUrls[index] || "/placeholder.svg"}
                                  alt={`Damage photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-md"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0"
                                  onClick={() => removePhoto(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {/* Show file name below image */}
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {photo.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        <FormDescription>
                          Upload photos of the vehicle damage. Files will be uploaded when you submit the form.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Documents Section - Updated to use client-side files */}
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
                        {/* Updated to use selectedDocuments instead of uploadedDocuments */}
                        {selectedDocuments.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {selectedDocuments.map((doc, index) => (
                              <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{doc.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDocument(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <FormDescription>
                          Upload any relevant documents related to the repair. Files will be uploaded when you submit the form.
                        </FormDescription>
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
              {/* <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Bid"}
              </Button> */}
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? 'Uploading files...' : 'Creating bid...'}
                  </>
                ) : (
                  'Create Bid'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  )
}
