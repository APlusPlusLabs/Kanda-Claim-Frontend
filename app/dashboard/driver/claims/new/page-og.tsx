"use client"

import type React from "react"

import { useState } from "react"
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
import { CalendarIcon, Upload, X, ImageIcon, FileText, File, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-provider"
import { useLanguage } from "@/lib/language-context"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { GarageRecommendations } from "@/components/garage-recommendations"

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
  // Step 1 - Basic Info
  policyNumber: z.string().min(5, {
    message: "Policy number is required/Nomero y'amasezerano igomba kuzuzwa",
  }),
  accidentDate: z.date({
    required_error: "Accident date is required/Itariki igomba kuzuzwa",
  }),
  accidentTime: z.string().min(1, {
    message: "Accident time is required/Amasaha agomba kuzuzwa",
  }),
  accidentLocation: z.string().min(2, {
    message: "Location is required/Ahantu hagomba kuzuzwa",
  }),
  accidentDescription: z.string().min(10, {
    message: "Please provide a detailed description/Tanga ibisobanuro birambuye",
  }),

  // Step 2 - Driver & Vehicle Information
  hasLicense: z.boolean().optional(),
  driverLicenseNumber: z.string().optional(),
  driverLicenseCategory: z.string().optional(),
  driverLicenseIssuedBy: z.string().optional(),
  driverLicenseIssuedDate: z.date().optional(),
  driverSurname: z.string().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  vehiclePlateNumber: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),

  // Step 3 - Police Information
  policeVisited: z.boolean().optional(),
  policeStation: z.string().optional(),
  policeOfficerName: z.string().optional(),
  policeOfficerPhone: z.string().optional(),
  policeReportNumber: z.string().optional(),

  // Step 4 - Other Vehicles
  otherVehiclesInvolved: z.boolean().optional(),
  numberOfOtherVehicles: z.number().optional(),
  // otherVehiclePlate: z.string().optional(),
  // otherVehicleMake: z.string().optional(),
  // otherVehicleType: z.string().optional(),
  // otherVehicleOwnerName: z.string().optional(),
  // otherVehicleOwnerSurname: z.string().optional(),
  // otherVehicleOwnerAddress: z.string().optional(),
  // otherVehicleInsurer: z.string().optional(),
  // otherVehiclePolicyNumber: z.string().optional(),

  // Step 5 - Injuries and Material Damage
  anyInjuries: z.boolean().optional(),
  numberOfInjured: z.number().optional(),
  // injuredPersonName: z.string().optional(),
  // injuredPersonSurname: z.string().optional(),
  // injuredPersonAge: z.string().optional(),
  // injuredPersonAddress: z.string().optional(),
  // injuredPersonPhone: z.string().optional(),
  // injuredPersonProfession: z.string().optional(),
  // injuryDescription: z.string().optional(),
  isDead: z.boolean().optional(),
  materialDamage: z.boolean().optional(),
  numberOfDamages: z.number().optional(),
  damageType: z.string().optional(),
  damageOwnerName: z.string().optional(),
  damageLocation: z.string().optional(),
  damageDescription: z.string().optional(),

  // Step 6 - Garage Information
  inGarage: z.boolean().optional(),
  garageName: z.string().optional(),
  garageAddress: z.string().optional(),
  garagePhone: z.string().optional(),
  repairEstimate: z.string().optional(),

  // Step 7 - Documents and Photos
  driverLicensePhoto: imageSchema,
  vehicleRegistrationPhoto: imageSchema,
  accidentScenePhotos: z.array(imageSchema).optional(),
  vehicleDamagePhotos: z.array(imageSchema).optional(),
  policeReportDoc: fileSchema,
  witnessStatements: z.array(fileSchema).optional(),
  otherDocuments: z.array(fileSchema).optional(),
  additionalNotes: z.string().optional(),
})

// Define validation schemas for each step
const stepValidationSchemas = [
  // Step 1
  z.object({
    policyNumber: z.string().min(5),
    accidentDate: z.date(),
    accidentTime: z.string().min(1),
    accidentLocation: z.string().min(2),
    accidentDescription: z.string().min(10),
  }),
  // Step 2
  z.object({
    driverSurname: z.string().min(2, { message: "Driver surname is required" }),
    driverName: z.string().min(2, { message: "Driver name is required" }),
    driverPhone: z.string().min(6, { message: "Valid phone number is required" }),
    vehiclePlateNumber: z.string().min(2, { message: "Vehicle plate number is required" }),
    vehicleMake: z.string().min(2, { message: "Vehicle make is required" }),
    vehicleModel: z.string().min(2, { message: "Vehicle model is required" }),
    vehicleYear: z.string().min(4, { message: "Valid year is required" }),
  }),
  // Step 3 - Police info is optional
  z.object({
    policeVisited: z.boolean(),
  }),
  // Step 4
  z.object({
    otherVehiclesInvolved: z.boolean(),
  }),
  // Step 5
  z.object({
    anyInjuries: z.boolean(),
    materialDamage: z.boolean(),
  }),
  // Step 6
  z.object({
    inGarage: z.boolean(),
  }),
  // Step 7 - Documents are optional
  z.object({}),
]

export default function NewClaimPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [stepErrors, setStepErrors] = useState<number[]>([])
  const [previews, setPreviews] = useState({
    driverLicensePhoto: "",
    vehicleRegistrationPhoto: "",
    accidentScenePhotos: [] as string[],
    vehicleDamagePhotos: [] as string[],
  })

  const [injuredPersons, setInjuredPersons] = useState<any[]>([{ id: 1 }])
  const [otherVehicles, setOtherVehicles] = useState<any[]>([{ id: 1 }])
  const [wantsGarageRecommendations, setWantsGarageRecommendations] = useState<boolean | null>(null)
  const [showGarageRecommendations, setShowGarageRecommendations] = useState(false)

  // Function to format translation strings with variables
  const formatString = (str: string, params: Record<string, any>) => {
    return Object.entries(params).reduce((result, [key, value]) => {
      return result.replace(new RegExp(`{{${key}}}`, "g"), value.toString())
    }, str)
  }

  // Update the form initialization with proper default values for all fields
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Step 1 - Basic Info
      policyNumber: "",
      accidentDate: undefined, // This will be handled specially in the date picker
      accidentTime: "",
      accidentLocation: "",
      accidentDescription: "",

      // Step 2 - Driver & Vehicle Information
      hasLicense: true,
      driverLicenseNumber: "",
      driverLicenseCategory: "",
      driverLicenseIssuedBy: "",
      driverLicenseIssuedDate: undefined, // This will be handled specially in the date picker
      driverSurname: "",
      driverName: "",
      driverPhone: "",
      vehiclePlateNumber: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",

      // Step 3 - Police Information
      policeVisited: false,
      policeStation: "",
      policeOfficerName: "",
      policeOfficerPhone: "",
      policeReportNumber: "",

      // Step 4 - Other Vehicles
      otherVehiclesInvolved: false,
      numberOfOtherVehicles: 1,

      // Step 5 - Injuries and Material Damage
      anyInjuries: false,
      numberOfInjured: 1,
      isDead: false,
      materialDamage: false,
      numberOfDamages: 1,
      damageType: "",
      damageOwnerName: "",
      damageLocation: "",
      damageDescription: "",

      // Step 6 - Garage Information
      inGarage: false,
      garageName: "",
      garageAddress: "",
      garagePhone: "",
      repairEstimate: "",

      // Step 7 - Documents and Photos
      driverLicensePhoto: undefined,
      vehicleRegistrationPhoto: undefined,
      accidentScenePhotos: [],
      vehicleDamagePhotos: [],
      policeReportDoc: undefined,
      witnessStatements: [],
      otherDocuments: [],
      additionalNotes: "",
    },
  })

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
        title: `Kanda Claim - ${t("claims.validation_error")}`,
        description: t("claims.please_complete_required"),
      })

      return false
    }
  }

  // Handle Save and Next
  const handleSaveAndNext = async () => {
    const isValid = await validateStep(step)
    if (isValid && step < 7) {
      setStep(step + 1)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate all steps before final submission
    try {
      let allValid = true

      // Validate current step first
      const currentStepValid = await validateStep(step)
      if (!currentStepValid) {
        allValid = false
      }

      // Check if all previous steps are completed
      for (let i = 1; i <= 7; i++) {
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
          title: `Kanda Claim - ${t("claims.incomplete_steps")}`,
          description: t("claims.complete_all_steps"),
        })
        return
      }

      // Final submission
      setIsSubmitting(true)
      try {
        // Submit form logic...
        console.log("Claim data:", values)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        toast({
          title: `Kanda Claim - ${t("claims.submission_success")}`,
          description: t("claims.submission_pending"),
        })

        router.push("/dashboard/driver")
      } catch (error) {
        toast({
          variant: "destructive",
          title: `Kanda Claim - ${t("claims.submission_failed")}`,
          description: t("claims.submission_error"),
        })
      } finally {
        setIsSubmitting(false)
      }
    } catch (error) {
      // Validation error - form will show field errors
      console.error("Validation error:", error)

      // Show toast for validation error
      toast({
        variant: "destructive",
        title: `Kanda Claim - ${t("claims.validation_error")}`,
        description: t("claims.please_complete_required"),
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (fieldName === "driverLicensePhoto" || fieldName === "vehicleRegistrationPhoto") {
      form.setValue(fieldName as any, files[0])

      // Create preview URL
      const previewUrl = URL.createObjectURL(files[0])
      setPreviews((prev) => ({
        ...prev,
        [fieldName]: previewUrl,
      }))
    } else if (fieldName === "accidentScenePhotos" || fieldName === "vehicleDamagePhotos") {
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
      if (fieldName === "accidentScenePhotos" || fieldName === "vehicleDamagePhotos") {
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

      // Revoke preview URL if exists
      if (fieldName === "driverLicensePhoto" || fieldName === "vehicleRegistrationPhoto") {
        if (previews[fieldName as keyof typeof previews]) {
          URL.revokeObjectURL(previews[fieldName as keyof typeof previews] as string)
        }
        setPreviews((prev) => ({
          ...prev,
          [fieldName]: "",
        }))
      }
    }
  }

  // Get step status icon
  const getStepStatusIcon = (stepNumber: number) => {
    if (stepErrors.includes(stepNumber)) {
      return <AlertCircle className="h-4 w-4 text-destructive" />
    } else if (completedSteps.includes(stepNumber)) {
      return <CheckCircle2 className="h-4 w-4 text-primary" />
    }
    return null
  }

  const handleGarageSelection = (garage: any) => {
    form.setValue("garageName", garage.name)
    form.setValue("garageAddress", garage.address)
    form.setValue("garagePhone", garage.phone)
    form.setValue("inGarage", true)
    setShowGarageRecommendations(false)
  }

  // Update the render method to handle undefined values properly
  return (
    <DashboardLayout
      user={{
        name: user.name,
        role: "Driver",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        {
          name: `Kanda Claim - ${t("nav.dashboard")}`,
          href: "/dashboard/driver",
          icon: null,
          translationKey: "nav.dashboard",
        },
        { name: t("nav.claims"), href: "/dashboard/driver/claims", icon: null, translationKey: "nav.claims" },
        {
          name: t("action.new_claim"),
          href: "/dashboard/driver/claims/new",
          icon: null,
          translationKey: "action.new_claim",
        },
      ]}
    >
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            {[
              { number: 1, title: t("claims.basic_info") },
              { number: 2, title: t("claims.driver_vehicle_info") },
              { number: 3, title: t("claims.police_info") },
              { number: 4, title: t("claims.other_vehicles") },
              { number: 5, title: t("claims.injuries_damages") },
              { number: 6, title: t("claims.garage_info") },
              { number: 7, title: t("claims.documents_photos") },
            ].map((s) => (
              <button
                key={s.number}
                type="button"
                onClick={() => setStep(s.number)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border transition-colors w-full md:w-auto justify-center md:justify-start",
                  step === s.number
                    ? "bg-primary text-primary-foreground border-primary"
                    : completedSteps.includes(s.number)
                      ? "bg-primary/20 text-primary hover:bg-primary/30 border-primary/30"
                      : stepErrors.includes(s.number)
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 border-muted",
                )}
              >
                <span className="flex items-center justify-center w-8 h-8 bg-background/20 text-sm font-medium">
                  {s.number}
                </span>
                <span className="hidden md:inline text-sm">{s.title}</span>
                <span className="ml-auto">{getStepStatusIcon(s.number)}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Kanda Claim - {t("claims.new")}</h1>
          <p className="text-muted-foreground mt-2">{t("claims.provide_information")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("claims.basic_info")}</CardTitle>
                  <CardDescription>{t("claims.accident_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="policyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.policy_number")}*</FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.policy_number_placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="accidentDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t("form.date")}*</FormLabel>
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
                                  {field.value ? format(field.value, "PPP") : <span>{t("form.pick_date")}</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => field.onChange(date)}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                      name="accidentTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.time")}*</FormLabel>
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
                    name="accidentLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.location")}*</FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.location_placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accidentDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.description")}*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("form.accident_description_placeholder")}
                            className="min-h-[120px]"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
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
                  <CardTitle>{t("claims.driver_vehicle_info")}</CardTitle>
                  <CardDescription>{t("claims.driver_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="hasLicense"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={!field.value} onCheckedChange={(checked) => field.onChange(!checked)} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t("form.driver_no_license")}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("hasLicense") && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="driverLicenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.license_number")}*</FormLabel>
                            <FormControl>
                              <Input placeholder={t("form.license_number_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="driverLicenseCategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("form.license_category")}*</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t("form.select_category")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="A">A</SelectItem>
                                  <SelectItem value="B">B</SelectItem>
                                  <SelectItem value="C">C</SelectItem>
                                  <SelectItem value="D">D</SelectItem>
                                  <SelectItem value="E">E</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="driverLicenseIssuedDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>{t("form.issue_date")}*</FormLabel>
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
                                      {field.value ? format(field.value, "PPP") : <span>{t("form.pick_date")}</span>}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => field.onChange(date)}
                                    disabled={(date) => date > new Date()}
                                    initialFocus
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="driverSurname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.driver_surname")}*</FormLabel>
                          <FormControl>
                            <Input placeholder={t("form.driver_surname_placeholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="driverName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.driver_name")}*</FormLabel>
                          <FormControl>
                            <Input placeholder={t("form.driver_name_placeholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="driverPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.driver_phone")}*</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+250 788 123 456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehiclePlateNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.vehicle_plate")}*</FormLabel>
                          <FormControl>
                            <Input placeholder={t("form.vehicle_plate_placeholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleMake"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.vehicle_make")}*</FormLabel>
                          <FormControl>
                            <Input placeholder={t("form.vehicle_make_placeholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="vehicleModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.vehicle_model")}*</FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.vehicle_model_placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.vehicle_year")}*</FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.vehicle_year_placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("claims.police_info")}</CardTitle>
                  <CardDescription>{t("claims.police_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertDescription>{t("claims.police_report_optional")}</AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="policeVisited"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t("form.police_visited")}?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
                            className="flex flex-row space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="police-yes" />
                              <label htmlFor="police-yes">{t("action.yes")}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="police-no" />
                              <label htmlFor="police-no">{t("action.no")}</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("policeVisited") && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="policeStation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.police_station")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("form.police_station_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="policeReportNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.police_report_number")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("form.police_report_number_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="policeOfficerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("form.officer_name")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("form.officer_name_placeholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="policeOfficerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("form.officer_phone")}</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="+250 788 123 456" {...field} />
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

            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("claims.other_vehicles")}</CardTitle>
                  <CardDescription>{t("claims.other_vehicles_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="otherVehiclesInvolved"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t("form.other_vehicles_involved")}?*</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
                            className="flex flex-row space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="vehicles-yes" />
                              <label htmlFor="vehicles-yes">{t("action.yes")}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="vehicles-no" />
                              <label htmlFor="vehicles-no">{t("action.no")}</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("otherVehiclesInvolved") && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="numberOfOtherVehicles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.number_of_vehicles")}*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => {
                                  const value = Number.parseInt(e.target.value) || 1
                                  field.onChange(value)
                                  // Generate the appropriate number of vehicle forms
                                  setOtherVehicles(Array.from({ length: value }, (_, i) => ({ id: i + 1 })))
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {otherVehicles.map((vehicle, index) => (
                        <div key={vehicle.id} className="mt-6 border p-4 rounded-md">
                          <h3 className="font-medium mb-4">
                            {formatString(t("form.vehicle_details"), { number: index + 1 })}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`otherVehiclePlate${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.plate_number")}*</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("form.plate_number_placeholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`otherVehicleMake${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.make")}*</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("form.make_placeholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`otherVehicleType${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.type")}*</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("form.type_placeholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name={`otherVehicleOwnerName${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.owner_name")}*</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("form.owner_name_placeholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`otherVehicleOwnerSurname${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.owner_surname")}*</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("form.owner_surname_placeholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`otherVehicleOwnerAddress${index}`}
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>{t("form.owner_address")}*</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("form.owner_address_placeholder")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name={`otherVehicleInsurer${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.insurer")}*</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("form.insurer_placeholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`otherVehiclePolicyNumber${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.policy_number")}*</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("form.policy_number_placeholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("claims.injuries_damages")}</CardTitle>
                  <CardDescription>{t("claims.injuries_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="anyInjuries"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t("form.any_injuries")}?*</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
                            className="flex flex-row space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="injuries-yes" />
                              <label htmlFor="injuries-yes">{t("action.yes")}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="injuries-no" />
                              <label htmlFor="injuries-no">{t("action.no")}</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("anyInjuries") && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="numberOfInjured"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.number_of_injured")}*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {injuredPersons.map((person, index) => (
                        <div key={person.id} className="mt-6 border p-4 rounded-md">
                          <h3 className="font-medium mb-4">
                            {formatString(t("form.injured_person_details"), { number: index + 1 })}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`injuredPersonName${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.name")}*</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("form.name_placeholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`injuredPersonSurname${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.surname")}*</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("form.surname_placeholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name={`injuredPersonAge${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.age")}*</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder={t("form.age_placeholder")}
                                      {...field}
                                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`injuredPersonPhone${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.phone")}*</FormLabel>
                                  <FormControl>
                                    <Input type="tel" placeholder="+250 788 123 456" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`injuredPersonProfession${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("form.profession")}*</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("form.profession_placeholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`injuryDescription${index}`}
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>{t("form.injury_description")}*</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={t("form.injury_description_placeholder")}
                                    className="min-h-[120px]"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`isDead${index}`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-4">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>{t("form.check_if_deceased")}</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="materialDamage"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t("form.material_damage")}?*</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
                            className="flex flex-row space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="damage-yes" />
                              <label htmlFor="damage-yes">{t("action.yes")}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="damage-no" />
                              <label htmlFor="damage-no">{t("action.no")}</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("materialDamage") && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="numberOfDamages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.number_of_damages")}*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="damageType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.damage_type")}*</FormLabel>
                            <FormControl>
                              <Input placeholder={t("form.damage_type_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="damageOwnerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.damage_owner")}*</FormLabel>
                            <FormControl>
                              <Input placeholder={t("form.damage_owner_name_placeholder")} {...field} />
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
                            <FormLabel>{t("form.damage_description")}*</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("form.damage_description_placeholder")}
                                className="min-h-[120px]"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("claims.garage_info")}</CardTitle>
                  <CardDescription>{t("claims.garage_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="inGarage"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t("form.in_garage")}?*</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              const isInGarage = value === "true"
                              field.onChange(isInGarage)

                              // Reset garage recommendation state when changing this answer
                              if (isInGarage) {
                                setWantsGarageRecommendations(null)
                                setShowGarageRecommendations(false)
                              } else {
                                setWantsGarageRecommendations(null)
                              }
                            }}
                            defaultValue={field.value ? "true" : "false"}
                            className="flex flex-row space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="garage-yes" />
                              <label htmlFor="garage-yes">{t("action.yes")}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="garage-no" />
                              <label htmlFor="garage-no">{t("action.no")}</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("inGarage") === false && wantsGarageRecommendations === null && (
                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-2">{t("garage.need_recommendations")}</h3>
                        <p className="text-muted-foreground mb-4">{t("garage.recommendations_description")}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            onClick={() => {
                              setWantsGarageRecommendations(true)
                              setShowGarageRecommendations(true)
                            }}
                          >
                            {t("action.yes")}
                          </Button>
                          <Button variant="outline" onClick={() => setWantsGarageRecommendations(false)}>
                            {t("action.no")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {showGarageRecommendations && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{t("garage.nearby_garages")}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => setShowGarageRecommendations(false)}
                        >
                          {t("action.close")}
                        </Button>
                      </div>
                      <GarageRecommendations onSelectGarage={handleGarageSelection} />
                    </div>
                  )}

                  {(form.watch("inGarage") || wantsGarageRecommendations === false) && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="garageName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.garage_name")}*</FormLabel>
                            <FormControl>
                              <Input placeholder={t("form.garage_name_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="garageAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.garage_address")}*</FormLabel>
                            <FormControl>
                              <Input placeholder={t("form.garage_address_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="garagePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.garage_phone")}</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+250 788 123 456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="repairEstimate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.repair_estimate")}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="50000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {wantsGarageRecommendations === false && !showGarageRecommendations && (
                    <div className="flex justify-end">
                      <Button
                        variant="link"
                        onClick={() => {
                          setWantsGarageRecommendations(true)
                          setShowGarageRecommendations(true)
                        }}
                        className="px-0"
                      >
                        {t("garage.show_recommendations")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 7 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("claims.documents_photos")}</CardTitle>
                  <CardDescription>{t("claims.documents_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="driverLicensePhoto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.driver_license")}</FormLabel>
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              id="driverLicensePhoto"
                              className="sr-only"
                              onChange={(e) => handleFileChange(e, "driverLicensePhoto")}
                            />
                            <label
                              htmlFor="driverLicensePhoto"
                              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              <Upload className="h-4 w-4" />
                              {t("action.upload")}
                            </label>
                            {previews.driverLicensePhoto && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeFile("driverLicensePhoto")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {previews.driverLicensePhoto && (
                            <div className="relative rounded-md overflow-hidden border border-border">
                              <AspectRatio ratio={16 / 10}>
                                <img
                                  src={previews.driverLicensePhoto || "/placeholder.svg"}
                                  alt="Driver's License"
                                  className="object-cover w-full h-full"
                                />
                              </AspectRatio>
                            </div>
                          )}
                        </div>
                        <FormDescription className="mt-1">{t("form.driver_license_description")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleRegistrationPhoto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.vehicle_registration")}</FormLabel>
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              id="vehicleRegistrationPhoto"
                              className="sr-only"
                              onChange={(e) => handleFileChange(e, "vehicleRegistrationPhoto")}
                            />
                            <label
                              htmlFor="vehicleRegistrationPhoto"
                              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              <Upload className="h-4 w-4" />
                              {t("action.upload")}
                            </label>
                            {previews.vehicleRegistrationPhoto && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeFile("vehicleRegistrationPhoto")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {previews.vehicleRegistrationPhoto && (
                            <div className="relative rounded-md overflow-hidden border border-border">
                              <AspectRatio ratio={16 / 10}>
                                <img
                                  src={previews.vehicleRegistrationPhoto || "/placeholder.svg"}
                                  alt="Vehicle Registration"
                                  className="object-cover w-full h-full"
                                />
                              </AspectRatio>
                            </div>
                          )}
                        </div>
                        <FormDescription className="mt-1">{t("form.vehicle_registration_description")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accidentScenePhotos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.accident_scene_photos")}</FormLabel>
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              id="accidentScenePhotos"
                              className="sr-only"
                              multiple
                              onChange={(e) => handleFileChange(e, "accidentScenePhotos")}
                            />
                            <label
                              htmlFor="accidentScenePhotos"
                              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              <ImageIcon className="h-4 w-4" />
                              {t("action.add_photos")}
                            </label>
                          </div>
                          {previews.accidentScenePhotos.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                              {previews.accidentScenePhotos.map((preview, index) => (
                                <div
                                  key={index}
                                  className="relative rounded-md overflow-hidden border border-border group"
                                >
                                  <AspectRatio ratio={1} className="bg-muted">
                                    <img
                                      src={preview || "/placeholder.svg"}
                                      alt={`Accident Scene ${index + 1}`}
                                      className="object-cover w-full h-full"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeFile("accidentScenePhotos", index)}
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
                          {t("form.accident_scene_photos_description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleDamagePhotos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.vehicle_damage_photos")}</FormLabel>
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              id="vehicleDamagePhotos"
                              className="sr-only"
                              multiple
                              onChange={(e) => handleFileChange(e, "vehicleDamagePhotos")}
                            />
                            <label
                              htmlFor="vehicleDamagePhotos"
                              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              <ImageIcon className="h-4 w-4" />
                              {t("action.add_photos")}
                            </label>
                          </div>
                          {previews.vehicleDamagePhotos.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                              {previews.vehicleDamagePhotos.map((preview, index) => (
                                <div
                                  key={index}
                                  className="relative rounded-md overflow-hidden border border-border group"
                                >
                                  <AspectRatio ratio={1} className="bg-muted">
                                    <img
                                      src={preview || "/placeholder.svg"}
                                      alt={`Vehicle Damage ${index + 1}`}
                                      className="object-cover w-full h-full"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeFile("vehicleDamagePhotos", index)}
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
                          {t("form.vehicle_damage_photos_description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="policeReportDoc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.police_report")} (optional)</FormLabel>
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
                        <FormDescription className="mt-1">{t("form.police_report_description")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="witnessStatements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.witness_statements")} (optional)</FormLabel>
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              id="witnessStatements"
                              multiple
                              onChange={(e) => handleFileChange(e, "witnessStatements")}
                            />
                            {form.watch("witnessStatements")?.length > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.setValue("witnessStatements", [])}
                              >
                                {t("action.clear_all")}
                              </Button>
                            )}
                          </div>
                          {form.watch("witnessStatements")?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-2">{t("form.uploaded_files")}:</p>
                              <ul className="space-y-1">
                                {form.watch("witnessStatements")?.map((file: File, index: number) => (
                                  <li key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 mr-2" />
                                      {file.name}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile("witnessStatements", index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <FormDescription className="mt-1">{t("form.witness_statements_description")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otherDocuments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.additional_documents")} (optional)</FormLabel>
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              id="otherDocuments"
                              multiple
                              onChange={(e) => handleFileChange(e, "otherDocuments")}
                            />
                            {form.watch("otherDocuments")?.length > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.setValue("otherDocuments", [])}
                              >
                                {t("action.clear_all")}
                              </Button>
                            )}
                          </div>
                          {form.watch("otherDocuments")?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-2">{t("form.uploaded_files")}:</p>
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
                        <FormDescription className="mt-1">{t("form.additional_documents_description")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.additional_notes")} (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("form.additional_notes_placeholder")}
                            className="min-h-[120px]"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  {t("action.previous")}
                </Button>
              )}

              {step < 7 ? (
                <Button type="button" onClick={handleSaveAndNext}>
                  {t("action.save_and_next")}
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("action.submitting") : t("action.submit_claim")}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  )
}
