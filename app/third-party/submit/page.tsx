"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, X, ImageIcon, ArrowLeft, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Stepper, Step, StepDescription, StepTitle } from "@/components/stepper"
import { Tenant } from "@/lib/types/users"
import { useAuth } from "@/lib/auth-provider"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ACCEPTED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

// Custom file validation for Zod
const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5MB`)
  .optional()

const imageSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5MB`)
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), `Only .jpg, .jpeg, .png and .webp formats are supported`)
  .optional()

const formSchema = z.object({
  // Step 1 - Incident Information
  incidentDate: z
    .date({
      required_error: "Incident date is required",
    })
    .max(new Date(), {
      message: "Incident date cannot be in the future",
    }),
  incidentTime: z.string().min(1, {
    message: "Incident time is required",
  }),
  incidentLocation: z.string().min(2, {
    message: "Location is required",
  }),
  incidentDescription: z.string().min(10, {
    message: "Please provide a detailed description",
  }),

  // Step 2 - Policyholder Information
  policyholderVehiclePlate: z.string().min(2, {
    message: "Vehicle plate number is required",
  }),
  policyholderVehicleMake: z.string().optional(),
  policyholderVehicleModel: z.string().optional(),
  policyholderName: z.string().optional(),
  policyholderInsuranceCompany: z.string().optional(),
  policyNumber: z.string().optional(),

  // Step 3 - Your Information
  yourName: z.string().min(2, {
    message: "Your name is required",
  }),
  yourSurname: z.string().min(2, {
    message: "Your surname is required",
  }),
  yourPhone: z.string().min(6, {
    message: "Valid phone number is required",
  }),
  yourEmail: z.string().email({
    message: "Please enter a valid email address",
  }),
  yourAddress: z.string().min(5, {
    message: "Your address is required",
  }),

  // Step 4 - Your Vehicle Information (if applicable)
  hasVehicle: z.boolean().optional(),
  yourVehiclePlate: z.string().optional(),
  yourVehicleMake: z.string().optional(),
  yourVehicleModel: z.string().optional(),
  yourVehicleYear: z.string().optional(),
  yourInsuranceCompany: z.string().optional(),
  yourPolicyNumber: z.string().optional(),

  // Step 5 - Damage Information
  damageType: z.string().min(1, {
    message: "Please select a damage type",
  }),
  damageDescription: z.string().min(10, {
    message: "Please provide a detailed description of the damages",
  }),
  estimatedAmount: z.string().optional(),

  // Step 6 - Police Information
  policeReported: z.boolean().optional(),
  policeStation: z.string().optional(),
  policeReportNumber: z.string().optional(),
  policeReportDate: z.date().optional(),

  // Step 7 - Documents and Photos
  damagePhotos: z.array(imageSchema).optional(),
  policeReportDoc: fileSchema,
  otherDocuments: z.array(fileSchema).optional(),
  additionalNotes: z.string().optional(),

  // Step 8 - Communication Preferences
  preferredContactMethod: z.enum(["email", "sms", "both"]),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
})

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
export default function ThirdPartySubmitPage() {
  const router = useRouter()
  const { apiRequest } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [stepErrors, setStepErrors] = useState<number[]>([])
  const [tenants, setTenants] = useState<Tenant[]>()
  const [previews, setPreviews] = useState({
    damagePhotos: [] as string[],
  })

  const totalSteps = 8
  // Fetch tenants from API
  useEffect(() => {
    async function fetchTenants() {
      try {
        const response = await apiRequest(`${API_URL}tenants`, "GET")
        setTenants(response)
      } catch (error) {
        console.error("Failed to fetch tenants:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load insurance companies. Please try again.",
        })
      }
    }
    fetchTenants()
  }, [toast])
  
type FormData = z.infer<typeof formSchema>;
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Step 1 - Incident Information
      incidentDate: undefined,
      incidentTime: "",
      incidentLocation: "",
      incidentDescription: "",

      // Step 2 - Policyholder Information
      policyholderVehiclePlate: "",
      policyholderVehicleMake: "",
      policyholderVehicleModel: "",
      policyholderName: "",
      policyholderInsuranceCompany: "",
      policyNumber: "",

      // Step 3 - Your Information
      yourName: "",
      yourSurname: "",
      yourPhone: "",
      yourEmail: "",
      yourAddress: "",

      // Step 4 - Your Vehicle Information
      hasVehicle: false,
      yourVehiclePlate: "",
      yourVehicleMake: "",
      yourVehicleModel: "",
      yourVehicleYear: "",
      yourInsuranceCompany: "",
      yourPolicyNumber: "",

      // Step 5 - Damage Information
      damageType: "",
      damageDescription: "",
      estimatedAmount: "",

      // Step 6 - Police Information
      policeReported: false,
      policeStation: "",
      policeReportNumber: "",
      policeReportDate: undefined,

      // Step 7 - Documents and Photos
      damagePhotos: [],
      policeReportDoc: undefined,
      otherDocuments: [],
      additionalNotes: "",

      // Step 8 - Communication Preferences
      preferredContactMethod: "email",
      agreeToTerms: false,
    },
  })

  // Define validation schemas for each step
  const stepValidationSchemas = [
    // Step 1 - Incident Information
    z.object({
      incidentDate: z.date(),
      incidentTime: z.string().min(1),
      incidentLocation: z.string().min(2),
      incidentDescription: z.string().min(10),
    }),

    // Step 2 - Policyholder Information
    z.object({
      policyholderVehiclePlate: z.string().min(2),
    }),

    // Step 3 - Your Information
    z.object({
      yourName: z.string().min(2),
      yourSurname: z.string().min(2),
      yourPhone: z.string().min(6),
      yourEmail: z.string().email(),
      yourAddress: z.string().min(5),
    }),

    // Step 4 - Your Vehicle Information (optional)
    z.object({}),

    // Step 5 - Damage Information
    z.object({
      damageType: z.string().min(1),
      damageDescription: z.string().min(10),
    }),

    // Step 6 - Police Information (optional)
    z.object({}),

    // Step 7 - Documents and Photos (at least one photo required)
    z.object({
      damagePhotos: z.array(z.any()).min(1, "At least one damage photo is required"),
    }),

    // Step 8 - Communication Preferences
    z.object({
      preferredContactMethod: z.enum(["email", "sms", "both"]),
      agreeToTerms: z.boolean().refine((val) => val === true),
    }),
  ]

  // Function to validate the current step
  const validateStep = async (stepNumber: number) => {
    try {
      const currentSchema = stepValidationSchemas[stepNumber - 1]
      const values = form.getValues()

      // Extract only the fields needed for this step's validation
      const stepFields: any = {}
      Object.keys(currentSchema.shape).forEach((key) => {
        stepFields[key] = values[key as keyof typeof values]
      })

      await currentSchema.parseAsync(stepFields)

      // If validation passes, mark step as completed
      if (!completedSteps.includes(stepNumber)) {
        setCompletedSteps((prev) => [...prev, stepNumber])
      }

      // Remove from errors if it was there
      if (stepErrors.includes(stepNumber)) {
        setStepErrors((prev) => prev.filter((s) => s !== stepNumber))
      }

      return true
    } catch (error) {
      // If validation fails, mark step as having errors
      if (!stepErrors.includes(stepNumber)) {
        setStepErrors((prev) => [...prev, stepNumber])
      }

      // Show toast for validation error
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please complete all required fields before proceeding.",
      })

      return false
    }
  }

  // Handle Save and Next
  const handleSaveAndNext = async () => {
    const isValid = await validateStep(step)
    if (isValid && step < totalSteps) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  // Handle Previous
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  const onSubmit = async (data: FormData) => {
    let allValid = true

    // Validate current step first
    const currentStepValid = await validateStep(step)
    if (!currentStepValid) {
      allValid = false
    }

    // Check if all previous steps are completed
    for (let i = 1; i <= totalSteps; i++) {
      if (!completedSteps.includes(i)) {
        // Try to validate this step
        const stepValid = await validateStep(i)
        if (!stepValid) {
          allValid = false
        }
      }
    }

    if (!allValid) {
      toast({
        variant: "destructive",
        title: "Incomplete Steps",
        description: "Please complete all required steps before submitting.",
      })
      return
    }

    // Final submission
    setIsSubmitting(true)
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "incidentDate" || key === "policeReportDate") {
        formData.append(key, value ? value.toISOString() : "");
      } else if (key === "damagePhotos" && value) {
        value.forEach((file: string | Blob, index: number) => {
          if (file) formData.append(`damagePhotos[${index}]`, file);
        });
      } else if (key === "otherDocuments" && value) {
        value.forEach((file: string | Blob, index: number) => {
          if (file) formData.append(`otherDocuments[${index}]`, file);
        });
      } else if (key === "policeReportDoc" && value) {
        formData.append(key, value);
      } else {
        formData.append(key, value ? value.toString() : "");
      }
    });
    const tenant_id = tenants?.find(t => t.name === formData.get('policyholderInsuranceCompany'))?.id;
    formData.append("tenant_id", tenant_id + "");

    try {
      const response = await apiRequest(`${API_URL}third-party-claims`, "POST", formData);
      setStep(1);
      const trackingId = response.claim.tracking_id

      toast({
        title: "Claim Submitted Successfully",
        description: "Your claim " + trackingId + " has been submitted and is pending review.",
      })

      // Redirect to success page with tracking ID
      router.push(`/third-party/success?trackingId=${trackingId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: JSON.stringify(error) + " Failed to submit claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false)
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (fieldName === "damagePhotos") {
      const newFiles = Array.from(files)
      const currentFiles = form.getValues(fieldName as any) || []
      form.setValue(fieldName as any, [...currentFiles, ...newFiles] as any)

      // Create preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => ({
        ...prev,
        [fieldName]: [...(prev[fieldName as keyof typeof prev] as string[]), ...newPreviews],
      }))
    } else {
      const newFiles = Array.from(files)
      const currentFiles = form.getValues(fieldName as any) || []
      form.setValue(fieldName as any, [...currentFiles, ...newFiles] as any)
    }
  }

  const removeFile = (fieldName: string, index?: number) => {
    if (index !== undefined) {
      // For arrays (multiple files)
      const currentFiles = form.getValues(fieldName as any) || []
      const newFiles = [...currentFiles]
      newFiles.splice(index, 1)
      form.setValue(fieldName as any, newFiles as any)

      // Remove from previews if it's a photo
      if (fieldName === "damagePhotos") {
        const currentPreviews = [...(previews[fieldName as keyof typeof previews] as string[])]

        // Revoke the Object URL to avoid memory leaks
        URL.revokeObjectURL(currentPreviews[index])

        currentPreviews.splice(index, 1)
        setPreviews((prev) => ({
          ...prev,
          [fieldName]: currentPreviews,
        }))
      }
    } else {
      // For single files
      form.setValue(fieldName as any, undefined)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => router.push("/third-party")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Third-Party Portal
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit a Third-Party Claim</h1>
        <p className="text-muted-foreground">Please provide the information below to submit your third-party claim.</p>
      </div>

      <Stepper currentStep={step} className="mb-8">
        <Step completed={completedSteps.includes(1)} error={stepErrors.includes(1)}>
          <StepTitle>Incident</StepTitle>
          <StepDescription>Incident details</StepDescription>
        </Step>
        <Step completed={completedSteps.includes(2)} error={stepErrors.includes(2)}>
          <StepTitle>Policyholder</StepTitle>
          <StepDescription>Their information</StepDescription>
        </Step>
        <Step completed={completedSteps.includes(3)} error={stepErrors.includes(3)}>
          <StepTitle>Your Info</StepTitle>
          <StepDescription>Contact details</StepDescription>
        </Step>
        <Step completed={completedSteps.includes(4)} error={stepErrors.includes(4)}>
          <StepTitle>Your Vehicle</StepTitle>
          <StepDescription>If applicable</StepDescription>
        </Step>
        <Step completed={completedSteps.includes(5)} error={stepErrors.includes(5)}>
          <StepTitle>Damages</StepTitle>
          <StepDescription>Damage details</StepDescription>
        </Step>
        <Step completed={completedSteps.includes(6)} error={stepErrors.includes(6)}>
          <StepTitle>Police</StepTitle>
          <StepDescription>Report details</StepDescription>
        </Step>
        <Step completed={completedSteps.includes(7)} error={stepErrors.includes(7)}>
          <StepTitle>Documents</StepTitle>
          <StepDescription>Upload files</StepDescription>
        </Step>
        <Step completed={completedSteps.includes(8)} error={stepErrors.includes(8)}>
          <StepTitle>Preferences</StepTitle>
          <StepDescription>Communication</StepDescription>
        </Step>
      </Stepper>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Incident Information</CardTitle>
                <CardDescription>Provide details about when and where the incident occurred</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="incidentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Incident*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => field.onChange(date)}
                              disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incidentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time of Incident*</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="incidentLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location of Incident*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kimironko Junction, Kigali" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="incidentDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description of Incident*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a detailed description of what happened"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include as much detail as possible about how the incident occurred.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Policyholder Information</CardTitle>
                <CardDescription>Provide details about the policyholder involved in the incident</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    At minimum, we need the vehicle plate number of the policyholder. Other information is helpful but
                    optional. If you have the policy number or insurance company name, please provide it.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="policyholderVehiclePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policyholder's Vehicle Plate Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., RAA 123A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="policyholderVehicleMake"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Make</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Toyota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="policyholderVehicleModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., RAV4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="policyholderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policyholder's Name (if known)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="policyholderInsuranceCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Company (if known)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select insurance company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tenants?.map(company => (
                              <SelectItem key={company.id} value={company.name}>{company.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="policyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Number (if known)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., POL-2024-12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>Provide your personal and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="yourName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your First Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yourSurname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Last Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="yourPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+250 788 123 456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yourEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address*</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="yourAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Address*</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Your full address" className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Vehicle Information</CardTitle>
                <CardDescription>Provide details about your vehicle if it was involved in the incident</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasVehicle"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>My vehicle was involved in the incident</FormLabel>
                        <FormDescription>
                          Check this box if your vehicle was damaged or involved in the incident
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("hasVehicle") && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="yourVehiclePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Vehicle Plate Number*</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., RAB 456B" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yourVehicleYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Year</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2022" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="yourVehicleMake"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Make</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Honda" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yourVehicleModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Model</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Civic" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="yourInsuranceCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Insurance Company</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select insurance company" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Sanlam Alianz">Sanlam Alianz</SelectItem>
                                <SelectItem value="SONARWA">SONARWA</SelectItem>
                                <SelectItem value="SORAS">SORAS</SelectItem>
                                <SelectItem value="Radiant">Radiant</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                                <SelectItem value="None">None (Uninsured)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yourPolicyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Policy Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., POL-2024-67890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Damage Information</CardTitle>
                <CardDescription>Provide details about the damages incurred</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="damageType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Type of Damage*</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vehicle" id="damage-vehicle" />
                            <label htmlFor="damage-vehicle">Vehicle Damage</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="property" id="damage-property" />
                            <label htmlFor="damage-property">Property Damage</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="personal_injury" id="damage-injury" />
                            <label htmlFor="damage-injury">Personal Injury</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="multiple" id="damage-multiple" />
                            <label htmlFor="damage-multiple">Multiple Types of Damage</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="damageDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description of Damages*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a detailed description of all damages"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include all damages to your vehicle, property, or any injuries sustained.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Amount (RWF)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 350000" {...field} />
                      </FormControl>
                      <FormDescription>
                        If you have an estimate for repairs or medical costs, please provide it here.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Police Information</CardTitle>
                <CardDescription>Provide details about any police reports filed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="policeReported"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>The incident was reported to the police</FormLabel>
                        <FormDescription>Check this box if a police report was filed for the incident</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("policeReported") && (
                  <div className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="policeStation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Police Station</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Kimironko Police Station" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="policeReportNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Police Report Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., PR-2025-0123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="policeReportDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Report Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => field.onChange(date)}
                                  disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 7 && (
            <Card>
              <CardHeader>
                <CardTitle>Documents and Photos</CardTitle>
                <CardDescription>Upload supporting documents and photos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="damagePhotos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Damage Photos*</FormLabel>
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            id="damagePhotos"
                            className="sr-only"
                            multiple
                            onChange={(e) => handleFileChange(e, "damagePhotos")}
                          />
                          <label
                            htmlFor="damagePhotos"
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Add Photos
                          </label>
                        </div>
                        {previews.damagePhotos.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                            {previews.damagePhotos.map((preview, index) => (
                              <div
                                key={index}
                                className="relative rounded-md overflow-hidden border border-border group"
                              >
                                <AspectRatio ratio={1} className="bg-muted">
                                  <img
                                    src={preview || "/placeholder.svg"}
                                    alt={`Damage Photo ${index + 1}`}
                                    className="object-cover w-full h-full"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeFile("damagePhotos", index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </AspectRatio>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <FormDescription className="mt-1">
                        Upload clear photos of all damages. This is required for processing your claim.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("policeReported") && (
                  <FormField
                    control={form.control}
                    name="policeReportDoc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Police Report Document</FormLabel>
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            id="policeReportDoc"
                            onChange={(e) => handleFileChange(e, "policeReportDoc")}
                          />
                          {form.watch("policeReportDoc") && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeFile("policeReportDoc")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormDescription className="mt-1">
                          Upload a copy of the police report if available.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="otherDocuments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Supporting Documents</FormLabel>
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            id="otherDocuments"
                            multiple
                            onChange={(e) => handleFileChange(e, "otherDocuments")}
                          />
                          {form.watch("otherDocuments")?.length > 0 && (
                            <Button type="button" variant="outline" onClick={() => form.setValue("otherDocuments", [])}>
                              Clear All
                            </Button>
                          )}
                        </div>
                        {form.watch("otherDocuments")?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-2">Uploaded files:</p>
                            <ul className="space-y-1">
                              {form.watch("otherDocuments")?.map((file: File, index: number) => (
                                <li key={index} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center">
                                    <File className="h-4 w-4 mr-2" />
                                    {file.name}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile("otherDocuments", index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <FormDescription className="mt-1">
                        Upload any additional documents that support your claim (repair estimates, medical reports,
                        etc.).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information you'd like to provide"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === 8 && (
            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>Choose how you'd like to receive updates about your claim</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="preferredContactMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Preferred Contact Method*</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="contact-email" />
                            <label htmlFor="contact-email">Email Only</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sms" id="contact-sms" />
                            <label htmlFor="contact-sms">SMS Only</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="contact-both" />
                            <label htmlFor="contact-both">Both Email and SMS</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        You'll receive claim status updates and notifications through your preferred method.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    After submission, you'll receive a unique tracking ID that you can use to check the status of your
                    claim at any time.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I agree to the terms and conditions*</FormLabel>
                        <FormDescription>
                          By submitting this claim, I confirm that all information provided is accurate and complete to
                          the best of my knowledge.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}

            {step < totalSteps ? (
              <Button type="button" onClick={handleSaveAndNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Claim"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
