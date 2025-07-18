"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Trash2, Upload } from "lucide-react";

interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  license_plate: string;
  vin: string;
}

interface Claim {
  id: string;
  code: string;
}

interface Bid {
  id: string;
  code: string;
  claim: Claim;
  vehicle_info: VehicleInfo;
  damage_description: string;
}

interface CostBreakdown {
  item: string;
  cost: number;
  description: string;
}

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";




interface Props {
  params: Promise<{ id: string }>;
}

export default function SubmitBidPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { user, apiRequest } = useAuth();
  const { toast } = useToast();
  const [bid, setBid] = useState<Bid>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  // Form schema
  const submissionSchema = z.object({
    bid_id: z.string().min(1, "Bid required"),
    tenant_id: z.string().min(1, "Tenant ID is required"),
    garage_id: z.string().min(1, "Garage ID is required"),
    costBreakdown: z.array(
      z.object({
        item: z.string().min(1, "Item is required"),
        cost: z.number().min(0, "Cost must be a positive number"),
        description: z.string().optional(),
      })
    ).min(1, "At least one cost breakdown item is required"),
    estimatedCompletionTime: z.string().min(1, "Estimated completion time is required"),
    notes: z.string().optional(),
    photos: z.array(z.string()).optional(),
    documents: z.array(z.string()).optional(),
    uploadedPhotos: z.array(z.string()).optional(),
    uploadedDocuments: z.array(z.string()).optional(),
  });
  const form = useForm<z.infer<typeof submissionSchema>>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      bid_id: id,
      tenant_id: user.tenant_id,
      garage_id: user.garage_id,
      costBreakdown: [],
      estimatedCompletionTime: "",
      notes: "",
      photos: [],
      documents: [],
      uploadedPhotos: [],
      uploadedDocuments: [],
    },
  });

  useEffect(() => {
    const fetchBid = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest(`${API_URL}bids/${id}/${user.tenant_id}`, "GET");
        setBid(response);
        if (response.scope_of_work) {
          const initialCostBreakdown = response.scope_of_work.map((item: string) => ({
            item,
            cost: 0,
            description: "",
          }));
          form.setValue("costBreakdown", initialCostBreakdown);
        }
      } catch (error) {
        console.error("Error loading bid:", error);
        toast({
          title: "Error Loading Bid",
          description: "There was an error loading the bid details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBid();
    }
  }, [id, apiRequest, toast, form]);

  const addCostItem = () => {
    const newCostBreakdown = {
      item: "",
      cost: 0,
      description: "",
    };
    form.setValue("costBreakdown", [...form.getValues("costBreakdown"), newCostBreakdown]);
  };

  const removeCostItem = (index: number) => {
    const updatedCostBreakdown = form.getValues("costBreakdown").filter((_, i) => i !== index);
    form.setValue("costBreakdown", updatedCostBreakdown);
  };

  const calculateTotalCost = () => {
    return form.getValues("costBreakdown").reduce((sum, item) => sum + item.cost, 0);
  };

  const handleSubmit = async (values: z.infer<typeof submissionSchema>) => {
    console.log('form data', values);

    setIsSubmitting(true);
    try {
      const payload = {
        bid_id: values.bid_id,
        tenant_id: user.tenant_id,
        garage_id: user.garage_id,
        user_id: user.id,
        proposed_cost: calculateTotalCost(),
        scope_of_work: values.costBreakdown.map(item => `${item.item} (${item.cost} RWF)`),
        photos: values.photos,
        documents: values.documents,
        estimated_completion_time: values.estimatedCompletionTime,
        cost_breakdown: values.costBreakdown,
        vehicle_info: bid?.vehicle_info,
        notes: values.notes || `Estimated Completion Time: ${values.estimatedCompletionTime} days`,
      };

      const response = await apiRequest(`${API_URL}bid-submissions`, "POST", payload);
      const bidSummissionId = response.submission.id;
      // 2. Upload all files with the bid ID
      const uploadPromises = [];

      if (selectedPhotos.length > 0) {
        uploadPromises.push(uploadFilesToBid(selectedPhotos, bidSummissionId, 'bid-photo'));
      }

      if (selectedDocuments.length > 0) {
        uploadPromises.push(uploadFilesToBid(selectedDocuments, bidSummissionId, 'bid-document'));
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
        title: "Bid Submission Created",
        description: `Submission ${response.submission.code} has been created.`,
      });

      router.push("/dashboard/garage/bids");
    } catch (error: any) {
      console.error("Error submitting bid:", error);
      let errorMessage = "There was an error submitting the bid. Please try again.";
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(" ");
        Object.keys(errors).forEach((key) => {
          const field = key === "bid_id" ? "bid_id" : key;
          form.setError(field as keyof z.infer<typeof submissionSchema>, {
            type: "manual",
            message: errors[key].join(" "),
          });
        });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Error Submitting Bid",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Helper function to upload files after bid creation
  const uploadFilesToBid = async (files: File[], bidSummissionId: string, type: 'bid-photo' | 'bid-document') => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append('type', type);
      formData.append('user_id', user.id);
      formData.append('tenant_id', user.tenant_id);
      formData.append('table_id', bidSummissionId);
      formData.append('table_name', "bids");

      return apiRequest(`${API_URL}upload/${type === 'bid-photo' ? 'photos' : 'documents'}`, "POST", formData);
    });

    return Promise.all(uploadPromises);
  };
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

  if (isLoading) {
    return <div>Loading bid details...</div>;
  }

  if (!bid) {
    return <div>Bid not found.</div>;
  }
  if (!user.garage_id) {
    // toast({
    //   title: "Error NO GARAGE",
    //   description: "Only Users who have a garage can access this",
    //   variant: "destructive",
    // });
    // router.push('/dashboard/garage/bids')
    return <div>Error NO GARAGE. <br /> Only Users who have a garage can access this. <br /> {JSON.stringify(user)}  <button onClick={() => router.push('/dashboard/garage/bids')}>BACK</button></div>;

  }
  return (
    <DashboardLayout
      user={{
        name: user?.name,
        role: "Garage",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/garage", icon: null },
        { name: "Repairs", href: "/dashboard/garage/repairs", icon: null },
        { name: "Bids", href: "/dashboard/garage/bids", icon: null },
        { name: "Schedule", href: "/dashboard/garage/schedule", icon: null },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Submit Bid</h1>
            <p className="text-muted-foreground">Submit your bid for repair services</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tenant_id"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} type="hidden" value={user.tenant_id} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="garage_id"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} type="hidden" value={user.garage_id} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Card>
              <CardHeader>
                <CardTitle>Bid Information</CardTitle>
                <CardDescription>Details of the bid you are responding to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Bid</Label>
                    <Input type="text" value={bid.code} readOnly />
                  </div>
                  <div>
                    <Label>Claim</Label>
                    <Input type="text" value={bid.claim.code} readOnly />
                  </div>
                </div>
                <div>
                  <Label>Damage Description</Label>
                  <Input type="text" value={bid.damage_description} readOnly />
                </div>
                <div>
                  <Label>Vehicle Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Make</Label>
                      <Input type="text" value={bid.vehicle_info.make} readOnly />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Input type="text" value={bid.vehicle_info.model} readOnly />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input type="text" value={bid.vehicle_info.year} readOnly />
                    </div>
                    {/* <div>
                      <Label>License Plate</Label>
                      <Input type="text" value={bid.vehicle_info.license_plate} readOnly />
                    </div> */}
                  </div>
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
                  {/* Documents Section - Updated to use client-side files */}
                  <FormField
                    control={form.control}
                    name="uploadedDocuments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Documents <small>ex: QUOTATION</small></FormLabel>
                        <div className="mt-2">
                          <div
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted"
                            onClick={() => document.getElementById("document-upload")?.click()}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Upload QUOTATION, assessments documents, price lists...etc.</p>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="uploadedPhotos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photos <small>ex: QUOTATION Screenshots</small></FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Enter the cost for each repair item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="costBreakdown"
                  render={({ field }) => (
                    <FormItem>
                      {field.value.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`costBreakdown.${index}.item`}
                            render={({ field: itemField }) => (
                              <FormItem>
                                <FormLabel>Item</FormLabel>
                                <FormControl>
                                  <Input
                                    {...itemField}
                                    placeholder="Enter item name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`costBreakdown.${index}.cost`}
                            render={({ field: costField }) => (
                              <FormItem>
                                <FormLabel>Cost (RWF)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...costField}
                                    onChange={(e) => costField.onChange(Number(e.target.value))}
                                    placeholder="0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`costBreakdown.${index}.description`}
                            render={({ field: descField }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...descField}
                                    placeholder="Optional description"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeCostItem(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addCostItem}>
                        Add Item
                      </Button>
                      {form.formState.errors.costBreakdown && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.costBreakdown?.root?.message || "At least one cost item is required"}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <div className="text-xl font-bold">
                  Total Cost: {calculateTotalCost().toLocaleString()} RWF
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Provide additional details about your bid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="estimatedCompletionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Completion Time (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Ex: 3 days"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/garage/bids">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Bid"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}