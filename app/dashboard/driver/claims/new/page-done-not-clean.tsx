"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  Upload,
  X,
  ImageIcon,
  FileText,
  File as FileIcon,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-provider";
import { useLanguage } from "@/lib/language-context";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { GarageRecommendations } from "@/components/garage-recommendations";
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
const WEB_URL = process.env.NEXT_PUBLIC_APP_WEB_URL;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Custom file validation for Zod
const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 10MB`)
  .refine(
    (file) => [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES].includes(file.type),
    `Only .jpg, .jpeg, .png, .pdf, .doc, .docx formats are supported`,
  )
  .optional();

const formSchema = z.object({
  // Step 1 - Basic Info
  claim_type_id: z.string().uuid({ message: "Please select a claim type" }),
  policyNumber: z.string().min(5, { message: "Policy number is required" }),
  amount: z.string(),
  priority: z.string(),
  accidentDate: z.date({ required_error: "Accident date is required" }),
  accidentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)" }),
  accidentLocation: z.string().min(2, { message: "Location is required" }),
  accidentDescription: z.string().min(10, { message: "Please provide a detailed description" }),

  // Step 2 - Driver & Vehicle Information
  driver_details: z.array(
    z.object({
      hasLicense: z.boolean().optional(),
      licenseNumber: z.string().optional(),
      licenseCategory: z.string().optional(),
      licenseIssuedDate: z.date().optional(),
      surname: z.string().min(2, { message: "Surname is required" }),
      name: z.string().min(2, { message: "Name is required" }),
      phone: z.string().min(6, { message: "Valid phone number is required" }),
    }),
  ).min(1, { message: "At least one driver detail is required" }),

  vehicles: z.array(
    z.object({
      vehiclePlateNumber: z.string().min(2, { message: "Plate number is required" }),
      vehicleMake: z.string().min(2, { message: "Make is required" }),
      vehicleModel: z.string().min(2, { message: "Model is required" }),
      vin: z.string().min(17, { message: "VIN (Vehicle Identification Number) is required & 17 characters" }),
      vehicleYear: z
        .string()
        .regex(/^\d{4}$/, { message: "Year must be a 4-digit number" })
        .refine((val) => {
          const year = parseInt(val);
          return year >= 1900 && year <= new Date().getFullYear();
        }, { message: "Year must be between 1900 and the current year" }),
    }),
  ).min(1, { message: "At least one vehicle is required" }),

  // Step 3 - Police Information
  police_assignments: z.array(
    z.object({
      policeVisited: z.boolean().optional(),
      policeStation: z.string().optional(),
      policeOfficerName: z.string().optional(),
      policeOfficerPhone: z.string().optional(),
      policeReportNumber: z.string().optional(),
    }),
  ).optional(),

  // Step 4 - Other Vehicles
  other_vehicles: z.array(
    z.object({
      plate_number: z.string().min(2, { message: "Plate number is required" }),
      make: z.string().min(2, { message: "Make is required" }),
      type: z.string().min(2, { message: "Type is required" }),
      owner_first_name: z.string().min(2, { message: "Owner first name is required" }),
      owner_last_name: z.string().min(2, { message: "Owner last name is required" }),
      owner_address: z.string().min(2, { message: "Owner address is required" }),
      insurer_name: z.string().min(2, { message: "Insurer name is required" }),
      policy_number: z.string().min(2, { message: "Policy number is required" }),
    }),
  ).optional(),

  // Step 5 - Injuries and Material Damage
  injuries: z.array(
    z.object({
      first_name: z.string().min(2, { message: "First name is required" }),
      last_name: z.string().min(2, { message: "Last name is required" }),
      age: z.number().min(0, { message: "Age must be a positive number" }),
      phone: z.string().min(6, { message: "Valid phone number is required" }),
      profession: z.string().min(2, { message: "Profession is required" }),
      injury_description: z.string().min(10, { message: "Injury description is required" }),
      is_deceased: z.boolean().optional(),
    }),
  ).optional(),

  damages: z.array(
    z.object({
      type: z.string().min(2, { message: "Damage type is required" }),
      owner_name: z.string().min(2, { message: "Owner name is required" }),
      description: z.string().min(10, { message: "Damage description is required" }),
    }),
  ).optional(),

  // Step 6 - Garage Information
  garages: z.array(
    z.object({
      name: z.string().min(2, { message: "Garage name is required" }),
      address: z.string().min(2, { message: "Garage address is required" }),
      phone: z.string().min(6, { message: "Valid phone number is required" }).optional(),
      repair_estimate: z.number().min(0, { message: "Repair estimate must be a positive number" }).optional(),
    }),
  ).optional(),

  // Step 7 - Documents and Photos
  documents: z.array(
    z.object({
      type: z.enum([
        "driver_license",
        "vehicle_registration",
        "accident_scene",
        "vehicle_damage",
        "police_report",
        "witness_statement",
        "other",
      ]),
      file: fileSchema,
    }),
  ).optional(),

  additionalNotes: z.string().optional(),
});

// validation schemas for all steps
const stepValidationSchemas = [
  // Step 1
  z.object({
    claim_type_id: z.string().uuid(),
    policyNumber: z.string().min(5),
    amount: z.string().min(1),
    priority: z.string(),
    accidentDate: z.date(),
    accidentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    accidentLocation: z.string().min(2),
    accidentDescription: z.string().min(10),
  }),
  // Step 2
  z.object({
    driver_details: z.array(z.object({
      surname: z.string().min(2),
      name: z.string().min(2),
      phone: z.string().min(6),
    })).min(1),
    vehicles: z.array(
      z.object({
        vehiclePlateNumber: z.string().min(2),
        vehicleMake: z.string().min(2),
        vehicleModel: z.string().min(2),
        vin: z.string().min(17),
        vehicleYear: z.string().regex(/^\d{4}$/),
      }),
    ).min(1),
  }),
  // Step 3
  z.object({
    police_assignments: z.array(z.object({ policeVisited: z.boolean() })).optional(),
  }),
  // Step 4
  z.object({
    other_vehicles: z.array(z.object({
      plate_number: z.string().min(2),
      make: z.string().min(2),
      type: z.string().min(2),
      owner_first_name: z.string().min(2),
      owner_last_name: z.string().min(2),
      owner_address: z.string().min(2),
      insurer_name: z.string().min(2),
      policy_number: z.string().min(2),
    })).optional(),
  }),
  // Step 5
  z.object({
    injuries: z.array(z.object({
      first_name: z.string().min(2),
      last_name: z.string().min(2),
      age: z.number().min(0),
      phone: z.string().min(6),
      profession: z.string().min(2),
      injury_description: z.string().min(10),
      is_deceased: z.boolean().optional(),
    })).optional(),
    damages: z.array(z.object({
      type: z.string().min(2),
      owner_name: z.string().min(2),
      description: z.string().min(10),
    })).optional(),
  }),
  // Step 6
  z.object({
    garages: z.array(z.object({
      name: z.string().min(2),
      address: z.string().min(2),
    })).optional(),
  }),
  // Step 7
  z.object({
    documents: z.array(z.object({
      type: z.enum([
        "driver_license",
        "vehicle_registration",
        "accident_scene",
        "vehicle_damage",
        "police_report",
        "witness_statement",
        "other",
      ]),
      file: fileSchema,
    })).optional(),
  }),
];

export default function NewClaimPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, apiRequest, webRequest, apiPOST } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepErrors, setStepErrors] = useState<number[]>([]);
  const [claimId, setClaimId] = useState<string | null>(null);

  const [previews, setPreviews] = useState({
    driverLicensePhoto: "",
    vehicleRegistrationPhoto: "",
    accidentScenePhotos: [] as string[],
    vehicleDamagePhotos: [] as string[],
    policeReportDoc: "",
    witnessStatements: [] as string[],
    otherDocuments: [] as string[],
  });
  const [claimTypes, setClaimTypes] = useState<{ id: string; name: string }[]>([]);
  const [wantsGarageRecommendations, setWantsGarageRecommendations] = useState<boolean | null>(null);
  const [showGarageRecommendations, setShowGarageRecommendations] = useState(false);

  // Fetch claim types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("ottqen");
        const [claimTypesRes] = await Promise.all([
          await apiRequest(`${API_URL}claim-types`, "GET")

        ]);
        setClaimTypes(claimTypesRes);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch claim types",
        });
      }
    };
    fetchData();
  }, [user, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      claim_type_id: "",
      amount: "0",
      priority: "",
      policyNumber: "",
      accidentDate: undefined,
      accidentTime: "",
      accidentLocation: "",
      accidentDescription: "",
      driver_details: [{
        hasLicense: true,
        licenseNumber: "",
        licenseCategory: "",
        licenseIssuedDate: undefined,
        surname: "",
        name: "",
        phone: "",
      }],
      vehicles: [
        {
          vehiclePlateNumber: "",
          vehicleMake: "",
          vehicleModel: "",
          vehicleYear: "",
          vin: "",
        },
      ],
      police_assignments: [],
      other_vehicles: [],
      injuries: [],
      damages: [],
      garages: [],
      documents: [],
      additionalNotes: "",
    },
  });

  // Field arrays for dynamic inputs
  const { fields: driverFields, append: appendDriver, remove: removeDriver } = useFieldArray({
    control: form.control,
    name: "driver_details",
  });
  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control: form.control,
    name: "vehicles",
  });
  const { fields: policeFields, append: appendPolice, remove: removePolice } = useFieldArray({
    control: form.control,
    name: "police_assignments",
  });
  const { fields: otherVehicleFields, append: appendOtherVehicle, remove: removeOtherVehicle } = useFieldArray({
    control: form.control,
    name: "other_vehicles",
  });
  const { fields: injuryFields, append: appendInjury, remove: removeInjury } = useFieldArray({
    control: form.control,
    name: "injuries",
  });
  const { fields: damageFields, append: appendDamage, remove: removeDamage } = useFieldArray({
    control: form.control,
    name: "damages",
  });
  const { fields: garageFields, append: appendGarage, remove: removeGarage } = useFieldArray({
    control: form.control,
    name: "garages",
  });
  const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const formatString = (str: string, params: Record<string, any>) => {
    return Object.entries(params).reduce((result, [key, value]) => {
      return result.replace(new RegExp(`{{${key}}}`, "g"), value.toString());
    }, str);
  };

  const validateStep = async (stepNumber: number) => {
    try {
      const currentSchema = stepValidationSchemas[stepNumber - 1];
      const values = form.getValues();
      const stepFields: any = {};
      Object.keys(currentSchema.shape).forEach((key) => {
        stepFields[key] = values[key as keyof typeof values];
      });
      await currentSchema.parseAsync(stepFields);
      if (!completedSteps.includes(stepNumber)) {
        setCompletedSteps((prev) => [...prev, stepNumber]);
      }
      if (stepErrors.includes(stepNumber)) {
        setStepErrors((prev) => prev.filter((s) => s !== stepNumber));
      }
      return true;
    } catch (error) {
      if (!stepErrors.includes(stepNumber)) {
        setStepErrors((prev) => [...prev, stepNumber]);
      }
      toast({
        variant: "destructive",
        title: `Kanda Claim - ${t("claims.validation_error")}`,
        description: t("claims.please_complete_required: " + error),
      });
      return false;
    }
  };

  const handleSaveAndNext = async () => {
    const isValid = await validateStep(step);
    if (isValid && step < 7) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let allValid = true;
    const currentStepValid = await validateStep(step);
    if (!currentStepValid) allValid = false;

    for (let i = 1; i <= 7; i++) {
      if (!completedSteps.includes(i)) {
        const stepValid = await validateStep(i);
        if (!stepValid) allValid = false;
      }
    }

    if (!allValid) {
      toast({
        variant: "destructive",
        title: `Kanda Claim - ${t("claims.incomplete_steps")}`,
        description: t("claims.complete_all_steps"),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      console.log("Form Values:", values); // Debug form values
      const token = sessionStorage.getItem("ottqen");
      // Append claim fields
      formData.append("claim_type_id", values.claim_type_id);
      formData.append("amount", values.amount);
      formData.append("currency", "RWF");
      formData.append("status", "Draft");
      formData.append("priority", values.priority);
      formData.append("policy_number", values.policyNumber);
      formData.append("accident_date", values.accidentDate.toISOString().split("T")[0]);
      formData.append("accident_time", values.accidentTime);
      formData.append("location", values.accidentLocation);
      formData.append("description", values.accidentDescription);
      formData.append("note", values.additionalNotes || "");

      // Append driver details
      values.driver_details.forEach((driver, index) => {
        formData.append(`driver_details[${index}][user_id]`, user.id); // Adjust based on auth
        formData.append(`driver_details[${index}][has_license]`, driver.hasLicense ? true : false);
        if (driver.hasLicense) {
          formData.append(`driver_details[${index}][license_number]`, driver.licenseNumber || "");
          formData.append(`driver_details[${index}][license_category]`, driver.licenseCategory || "");
          formData.append(
            `driver_details[${index}][license_issued_date]`,
            driver.licenseIssuedDate?.toISOString().split("T")[0] || "",
          );
        }
      });

      // Append vehicles
      values.vehicles.forEach((vehicle, index) => {
        formData.append(`vehicles[${index}][plate_number]`, vehicle.vehiclePlateNumber);
        formData.append(`vehicles[${index}][make]`, vehicle.vehicleMake);
        formData.append(`vehicles[${index}][model]`, vehicle.vehicleModel);
        formData.append(`vehicles[${index}][vin]`, vehicle.vin);
        formData.append(`vehicles[${index}][year]`, vehicle.vehicleYear);
      });
      // Append police assignments
      values.police_assignments?.forEach((police, index) => {
        formData.append(`police_assignments[${index}][police_visited]`, police.policeVisited ? true : false);
        formData.append(`police_assignments[${index}][police_station]`, police.policeStation || "");
        formData.append(`police_assignments[${index}][police_report_number]`, police.policeReportNumber || "");
        formData.append(`police_assignments[${index}][police_officer_name]`, police.policeOfficerName || "");
        formData.append(`police_assignments[${index}][police_officer_phone]`, police.policeOfficerPhone || "");
      });

      // Append other vehicles
      values.other_vehicles?.forEach((vehicle, index) => {
        formData.append(`other_vehicles[${index}][plate_number]`, vehicle.plate_number);
        formData.append(`other_vehicles[${index}][make]`, vehicle.make);
        formData.append(`other_vehicles[${index}][type]`, vehicle.type);
        formData.append(`other_vehicles[${index}][owner_first_name]`, vehicle.owner_first_name);
        formData.append(`other_vehicles[${index}][owner_last_name]`, vehicle.owner_last_name);
        formData.append(`other_vehicles[${index}][owner_address]`, vehicle.owner_address);
        formData.append(`other_vehicles[${index}][insurer_name]`, vehicle.insurer_name);
        formData.append(`other_vehicles[${index}][policy_number]`, vehicle.policy_number);
      });

      // Append injuries
      values.injuries?.forEach((injury, index) => {
        formData.append(`injuries[${index}][first_name]`, injury.first_name);
        formData.append(`injuries[${index}][last_name]`, injury.last_name);
        formData.append(`injuries[${index}][age]`, injury.age.toString());
        formData.append(`injuries[${index}][phone]`, injury.phone);
        formData.append(`injuries[${index}][profession]`, injury.profession);
        formData.append(`injuries[${index}][injury_description]`, injury.injury_description);
        formData.append(`injuries[${index}][is_deceased]`, injury.is_deceased ? true : false);
      });

      // Append damages
      values.damages?.forEach((damage, index) => {
        formData.append(`damages[${index}][type]`, damage.type);
        formData.append(`damages[${index}][owner_name]`, damage.owner_name);
        formData.append(`damages[${index}][description]`, damage.description);
      });

      // Append garages
      values.garages?.forEach((garage, index) => {
        formData.append(`garages[${index}][name]`, garage.name);
        formData.append(`garages[${index}][address]`, garage.address);
        formData.append(`garages[${index}][phone]`, garage.phone || "");
        formData.append(`garages[${index}][repair_estimate]`, garage.repair_estimate?.toString() || "");
      });

      // Append documents
      values.documents?.forEach((doc, index) => {
        if (doc.file) {
          console.log(`Document ${index}:`, { type: doc.type, file: doc.file.name });
          formData.append(`documents[${index}][type]`, doc.type);
          formData.append(`documents[${index}][file]`, doc.file);
        }
      });



      var jjsson = []
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? value.name : value);
        jjsson.push(`${key}:`, value)
      }
      console.log('my form dATA', jjsson);
      const responses = await apiRequest(`${API_URL}claims/all`, "POST", formData)
      toast({
        title: `Kanda Claim - ${t("claims.submission_success")}`,
        description: t("claims.submission_pending"),
      });

      router.push("/dashboard/driver");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Kanda Claim - ${t("claims.submission_failed")}`,
        description: error.response?.data?.message || t("claims.submission_error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      appendDocument({ type, file });
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => {
        if (type === "driver_license") return { ...prev, driverLicensePhoto: previewUrl };
        if (type === "vehicle_registration") return { ...prev, vehicleRegistrationPhoto: previewUrl };
        if (type === "accident_scene") return { ...prev, accidentScenePhotos: [...prev.accidentScenePhotos, previewUrl] };
        if (type === "vehicle_damage") return { ...prev, vehicleDamagePhotos: [...prev.vehicleDamagePhotos, previewUrl] };
        if (type === "police_report") return { ...prev, policeReportDoc: previewUrl };
        if (type === "witness_statement") return { ...prev, witnessStatements: [...prev.witnessStatements, previewUrl] };
        if (type === "other") return { ...prev, otherDocuments: [...prev.otherDocuments, previewUrl] };
        return prev;
      });
    });
  };

  const removeFile = (index: number, type: string) => {
    const doc = documentFields[index];
    if (doc) {
      URL.revokeObjectURL(previews[type as keyof typeof previews] as string);
      removeDocument(index);
      setPreviews((prev) => {
        if (type === "driver_license") return { ...prev, driverLicensePhoto: "" };
        if (type === "vehicle_registration") return { ...prev, vehicleRegistrationPhoto: "" };
        if (type === "accident_scene") {
          const newPreviews = [...prev.accidentScenePhotos];
          newPreviews.splice(index, 1);
          return { ...prev, accidentScenePhotos: newPreviews };
        }
        if (type === "vehicle_damage") {
          const newPreviews = [...prev.vehicleDamagePhotos];
          newPreviews.splice(index, 1);
          return { ...prev, vehicleDamagePhotos: newPreviews };
        }
        if (type === "police_report") return { ...prev, policeReportDoc: "" };
        if (type === "witness_statement") {
          const newPreviews = [...prev.witnessStatements];
          newPreviews.splice(index, 1);
          return { ...prev, witnessStatements: newPreviews };
        }
        if (type === "other") {
          const newPreviews = [...prev.otherDocuments];
          newPreviews.splice(index, 1);
          return { ...prev, otherDocuments: newPreviews };
        }
        return prev;
      });
    }
  };

  const getStepStatusIcon = (stepNumber: number) => {
    if (stepErrors.includes(stepNumber)) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    } else if (completedSteps.includes(stepNumber)) {
      return <CheckCircle2 className="h-4 w-4 text-primary" />;
    }
    return null;
  };

  const handleGarageSelection = (garage: any) => {
    appendGarage({
      name: garage.name,
      address: garage.address,
      phone: garage.phone || "",
      repair_estimate: 0,
    });
    setShowGarageRecommendations(false);
  };
  //   const validateStep = async (stepNumber: number) => {
  //     const fields = {
  //         1: ["claim_type_id", "policyNumber", "accidentDate", "accidentTime", "accidentLocation", "accidentDescription"],
  //         2: ["driver_details"],
  //         3: ["vehicles"],
  //         4: ["police_assignments"],
  //         5: ["other_vehicles"],
  //         6: ["injuries", "damages", "garages"],
  //         7: ["documents"],
  //     }[stepNumber];

  //     try {
  //         await form.trigger(fields);
  //         return !Object.keys(form.formState.errors).some((key) => fields.includes(key));
  //     } catch (error) {
  //         return false;
  //     }
  // };
  const saveStep = async () => {
    console.log('form data now', form.getValues());

    const currentStepValid = await validateStep(step);
    if (!currentStepValid) {
      toast({
        variant: "destructive",
        title: `Step ${step} Invalid`,
        description: "Please complete all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const values = form.getValues();
      let response;


      if (step === 1) {
        const data = {
          claim_type_id: values.claim_type_id,
          policy_number: values.policyNumber,
          amount: Number(values.amount),
          priority: values.priority,
          accident_date: values.accidentDate.toISOString().split("T")[0],
          accident_time: values.accidentTime,
          location: values.accidentLocation,
          description: values.accidentDescription,
          note: values.additionalNotes || "",
          tenant_id: user?.tenant_id,
          role_id: user?.role_id,
          user_id: user?.id,
        };
        response = await apiRequest(`${API_URL}claims`, "POST", data);
        //response = await apiPOST(data, 'claims');
        setClaimId(response.id);
      } else if (step === 2) {
        if (values.driver_details && values.driver_details.length > 0) {
          const driver = values.driver_details[0]; // Get only the first driver
          const driverData = {
            user_id: user?.id,
            has_license: driver.hasLicense ? true : false,
            license_number: driver.hasLicense ? (driver.licenseNumber || "") : "",
            license_category: driver.hasLicense ? (driver.licenseCategory || "") : "",
            license_issued_date: driver.hasLicense ? (driver.licenseIssuedDate?.toISOString().split("T")[0] || "") : ""
          };

          await apiRequest(`${API_URL}claims/${claimId}/driver-details`, "POST", driverData);
        }

        // Add vehicle if available (just the first vehicle)
        if (values.vehicles && values.vehicles.length > 0) {
          const vehicle = values.vehicles[0]; // Get only the first vehicle
          const vehicleData = {
            plate_number: vehicle.vehiclePlateNumber,
            make: vehicle.vehicleMake,
            model: vehicle.vehicleModel,
            year: vehicle.vehicleYear,
            vin: vehicle.vin,
            user_id: user?.id,
            tenant_id: user?.tenant_id,
          };

          await apiRequest(`${API_URL}vehicles`, "POST", vehicleData);
        }
      } else if (step === 3) {
        // const data = { police_assignments: values.police_assignments };
        const data = {
          police_assignments: values.police_assignments?.map(police => ({
            police_visited: police.policeVisited ? true : false,
            police_station: police.policeStation || "",
            police_report_number: police.policeReportNumber || "",
            police_officer_name: police.policeOfficerName || "",
            police_officer_phone: police.policeOfficerPhone || ""
          }))
        }
        response = await apiRequest(`${API_URL}claims/${claimId}/police-assignments`, "POST", data);
      } else if (step === 4) {
        const data = {
          other_vehicles: values.other_vehicles?.map(vehicle => ({
            plate_number: vehicle.plate_number,
            make: vehicle.make,
            type: vehicle.type,
            owner_first_name: vehicle.owner_first_name,
            owner_last_name: vehicle.owner_last_name,
            owner_address: vehicle.owner_address,
            insurer_name: vehicle.insurer_name,
            policy_number: vehicle.policy_number
          }))
        }
        data.other_vehicles?.map(async car => { response = await apiRequest(`${API_URL}claims/${claimId}/other-vehicles`, "POST", car); })

      } else if (step === 5) {
        // const data = { injuries: values.injuries, damages: values.damages, garages: values.garages };
        const dataInjuries = {
          injuries: values.injuries?.map(injury => ({
            first_name: injury.first_name,
            last_name: injury.last_name,
            age: injury.age.toString(),
            phone: injury.phone,
            profession: injury.profession,
            injury_description: injury.injury_description,
            is_deceased: injury.is_deceased ? true : false
          }))
        }
        dataInjuries.injuries?.map(async injury => { response = await apiRequest(`${API_URL}claims/${claimId}/injuries`, "POST", injury); })

        const dataDamages = {
          // Damages
          damages: values.damages?.map(damage => ({
            type: damage.type,
            owner_name: damage.owner_name,
            description: damage.description
          }))
        }
        dataDamages.damages?.map(async damage =>{ await apiRequest(`${API_URL}claims/${claimId}/damages`, "POST", damage);}) 
      } else if (step === 6) {
        const dataGarages = {
          // Garages
          garages: values.garages?.map(garage => ({
            name: garage.name,
            address: garage.address,
            phone: garage.phone || "",
            repair_estimate: garage.repair_estimate?.toString() || ""
          }))
        };
        dataGarages.garages?.map(async garage => { await apiRequest(`${API_URL}claims/${claimId}/garages`, "POST", garage);}) 
      } else if (step === 7) {
        const formData = new FormData();
        values.documents?.forEach((doc, index) => {
          if (doc.file) {
            formData.append(`documents[${index}][type]`, doc.type);
            formData.append(`documents[${index}][file]`, doc.file);
          }
        });
        response = await apiRequest(`${API_URL}claims/${claimId}/documents`, "POST", formData);
      }

      setCompletedSteps((prev) => [...prev, step]);
      toast({
        title: `Step ${step} Saved`,
        description: `Step ${step} has been successfully saved.`,
      });

      if (step < 7) {
        setStep(step + 1);
      } else {
        router.push("/dashboard/driver");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Step ${step} Failed: ` + error,
        description: error.response?.data?.message || "An error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="claim_type_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.claim_type")}*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("form.select_claim_type")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {claimTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
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
                          <FormLabel>{t("form.policy_number")}*</FormLabel>
                          <FormControl>
                            <Input placeholder={t("form.policy_number_placeholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.priority")}*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("form.select_priority")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem key="low" value="low">{t("form.low")}</SelectItem>
                              <SelectItem key="medium" value="medium">{t("form.medium")}</SelectItem>
                              <SelectItem key="high" value="high">{t("form.high")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.amount_estimated")}*</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder={t("form.amount_estimated")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("claims.driver_vehicle_info")}</CardTitle>
                  <CardDescription>{t("claims.driver_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {driverFields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{formatString(t("form.driver_details"), { number: index + 1 })}</h3>
                        {/* {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDriver(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )} */}
                      </div>
                      <FormField
                        control={form.control}
                        name={`driver_details.${index}.hasLicense`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>{t("form.has_license")}</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      {form.watch(`driver_details.${index}.hasLicense`) && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`driver_details.${index}.licenseNumber`}
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
                              name={`driver_details.${index}.licenseCategory`}
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
                              name={`driver_details.${index}.licenseIssuedDate`}
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
                          name={`driver_details.${index}.surname`}
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
                          name={`driver_details.${index}.name`}
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
                        name={`driver_details.${index}.phone`}
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
                    </div>
                  ))}
                  {/* <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendDriver({
                        hasLicense: true,
                        licenseNumber: "",
                        licenseCategory: "",
                        licenseIssuedDate: undefined,
                        surname: "",
                        name: "",
                        phone: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("form.add_driver")}
                  </Button> */}

                  {vehicleFields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md space-y-4 mt-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{formatString(t("form.vehicle_details"), { number: index + 1 })}</h3>
                        {/* {index > 0 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeVehicle(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )} */}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`vehicles.${index}.vehiclePlateNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("form.vehicle_plate_number")}*</FormLabel>
                              <FormControl>
                                <Input placeholder={t("form.vehicle_plate_number_placeholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`vehicles.${index}.vin`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("form.vin")}*</FormLabel>
                              <FormControl>
                                <Input placeholder={t("form.vin_placeholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`vehicles.${index}.vehicleMake`}
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
                        <FormField
                          control={form.control}
                          name={`vehicles.${index}.vehicleModel`}
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
                          name={`vehicles.${index}.vehicleYear`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("form.vehicle_year")}*</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={t("form.vehicle_year_placeholder")}
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {/* <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendVehicle({
                        vehiclePlateNumber: "",
                        vehicleMake: "",
                        vehicleModel: "",
                        vehicleYear: "",
                        vin: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("form.add_vehicle")}
                  </Button> */}
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
                  {policeFields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{formatString(t("form.police_report_info_details"), { number: index + 1 })}</h3>
                        {/* <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePolice(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </div>
                      <FormField
                        control={form.control}
                        name={`police_assignments.${index}.policeVisited`}
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>{t("form.police_visited")}?</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => field.onChange(value === "true")}
                                defaultValue={field.value ? true : false}
                                className="flex flex-row space-x-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="true" id={`police-yes-${index}`} />
                                  <label htmlFor={`police-yes-${index}`}>{t("action.yes")}</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="false" id={`police-no-${index}`} />
                                  <label htmlFor={`police-no-${index}`}>{t("action.no")}</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch(`police_assignments.${index}.policeVisited`) && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`police_assignments.${index}.policeStation`}
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
                              name={`police_assignments.${index}.policeReportNumber`}
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
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`police_assignments.${index}.policeOfficerName`}
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
                              name={`police_assignments.${index}.policeOfficerPhone`}
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
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendPolice({
                        policeVisited: false,
                        policeStation: "",
                        policeOfficerName: "",
                        policeOfficerPhone: "",
                        policeReportNumber: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("action.add_police_assignment")}
                  </Button>
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
                  {otherVehicleFields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{formatString(t("form.vehicle_details"), { number: index + 1 })}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOtherVehicle(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`other_vehicles.${index}.plate_number`}
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
                          name={`other_vehicles.${index}.make`}
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
                          name={`other_vehicles.${index}.type`}
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
                          name={`other_vehicles.${index}.owner_first_name`}
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
                          name={`other_vehicles.${index}.owner_last_name`}
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
                        name={`other_vehicles.${index}.owner_address`}
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
                          name={`other_vehicles.${index}.insurer_name`}
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
                          name={`other_vehicles.${index}.policy_number`}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendOtherVehicle({
                        plate_number: "",
                        make: "",
                        type: "",
                        owner_first_name: "",
                        owner_last_name: "",
                        owner_address: "",
                        insurer_name: "",
                        policy_number: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("form.add_vehicle")}
                  </Button>
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
                  {injuryFields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{formatString(t("form.injured_person_details"), { number: index + 1 })}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInjury(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`injuries.${index}.first_name`}
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
                          name={`injuries.${index}.last_name`}
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
                          name={`injuries.${index}.age`}
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
                          name={`injuries.${index}.phone`} // Fix: Use correct template literal syntax
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
                          name={`injuries.${index}.profession`}
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
                        name={`injuries.${index}.injury_description`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>{t("form.injury_description")}*</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("form.injury_description_placeholder")}
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`injuries.${index}.is_deceased`}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendInjury({
                        first_name: "",
                        last_name: "",
                        age: 0,
                        phone: "",
                        profession: "",
                        injury_description: "",
                        is_deceased: false,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("form.add_injury")}
                  </Button>

                  {damageFields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md space-y-4 mt-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{formatString(t("form.damage_details"), { number: index + 1 })}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDamage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`damages.${index}.type`}
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
                        name={`damages.${index}.owner_name`}
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
                        name={`damages.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.damage_description")}*</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("form.damage_description_placeholder")}
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendDamage({
                        type: "",
                        owner_name: "",
                        description: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("form.add_damage")}
                  </Button>
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
                  {garageFields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{formatString(t("form.garage_details"), { number: index + 1 })}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGarage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`garages.${index}.name`}
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
                        name={`garages.${index}.address`}
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
                        name={`garages.${index}.phone`}
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
                        name={`garages.${index}.repair_estimate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.repair_estimate")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="50000"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  {garageFields.length === 0 && wantsGarageRecommendations === null && (
                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-2">{t("garage.need_recommendations")}</h3>
                        <p className="text-muted-foreground mb-4">{t("garage.recommendations_description")}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            onClick={() => {
                              setWantsGarageRecommendations(true);
                              setShowGarageRecommendations(true);
                            }}
                          >
                            {t("action.yes")}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setWantsGarageRecommendations(false);
                              appendGarage({
                                name: "",
                                address: "",
                                phone: "",
                                repair_estimate: 0,
                              });
                            }}
                          >
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
                  {wantsGarageRecommendations === false && !showGarageRecommendations && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          appendGarage({
                            name: "",
                            address: "",
                            phone: "",
                            repair_estimate: 0,
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("form.add_garage")}
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
                  {[
                    { type: "driver_license", label: t("form.driver_license"), accept: "image/*" },
                    { type: "vehicle_registration", label: t("form.vehicle_registration"), accept: "image/*" },
                    { type: "accident_scene", label: t("form.accident_scene_photos"), accept: "image/*", multiple: true },
                    { type: "vehicle_damage", label: t("form.vehicle_damage_photos"), accept: "image/*", multiple: true },
                    { type: "police_report", label: t("form.police_report"), accept: ".pdf,.doc,.docx" },
                    { type: "witness_statement", label: t("form.witness_statements"), accept: ".pdf,.doc,.docx", multiple: true },
                    { type: "other", label: t("form.additional_documents"), accept: ".jpg,.png,.pdf,.doc,.docx", multiple: true },
                  ].map(({ type, label, accept, multiple }) => (
                    <FormItem key={type}>
                      <FormLabel>{label} {type.includes("optional") ? "(optional)" : ""}</FormLabel>
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept={accept}
                            id={type}
                            className={multiple ? "sr-only" : ""}
                            multiple={multiple}
                            onChange={(e) => handleFileChange(e, type)}
                          />
                          <label
                            htmlFor={type}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          >
                            {multiple ? <ImageIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                            {multiple ? t("action.add_photos") : t("action.upload")}
                          </label>
                        </div>
                        {previews[type as keyof typeof previews] && (
                          <div className="mt-2">
                            {Array.isArray(previews[type as keyof typeof previews]) ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {(previews[type as keyof typeof previews] as string[]).map((preview, idx) => (
                                  <div
                                    key={idx}
                                    className="relative rounded-md overflow-hidden border border-border group"
                                  >
                                    <AspectRatio ratio={1} className="bg-muted">
                                      <img
                                        src={preview || "/placeholder.svg"}
                                        alt={`${type} ${idx + 1}`}
                                        className="object-cover w-full h-full"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeFile(documentFields.findIndex((d) => d.type === type && d.file?.name === preview.split("/").pop()), type)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </AspectRatio>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="relative rounded-md overflow-hidden border border-border">
                                <AspectRatio ratio={16 / 10}>
                                  <img
                                    src={previews[type as keyof typeof previews] as string || "/placeholder.svg"}
                                    alt={label}
                                    className="object-cover w-full h-full"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6"
                                    onClick={() => removeFile(documentFields.findIndex((d) => d.type === type), type)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </AspectRatio>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <FormDescription className="mt-1">{t(`form.${type}_description`)}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  ))}
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

            <div className="flex justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="mx-6">
                  {t("action.previous")}
                </Button>
              )}
              {step < 7 ? (
                <Button type="button" onClick={saveStep} className="mx-6">
                  {t("action.save_and_next")}
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="mx-6">
                  {isSubmitting ? t("action.submitting") : t("action.submit_claim")}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}