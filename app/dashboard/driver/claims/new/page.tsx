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
  Badge,
  Eye,
  Loader2,
  ChevronLeft,
  Save,
  ChevronRight,
  Send,
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
import { Separator } from "@/components/ui/separator";
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

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
  driver_details: z.object({
    has_license: z.boolean().optional(),
    license_number: z.string().optional(),
    license_category: z.string().optional(),
    license_issued_date: z.date().optional(),
    surname: z.string().min(2, { message: "Surname is required" }),
    name: z.string().min(2, { message: "Name is required" }),
    phone: z.string().min(6, { message: "Valid phone number is required" }),
  }),

  // New vehicle selection fields
  vehicle_selection_mode: z.enum(["existing", "new"]).default("new"),
  selected_vehicle_id: z.string().optional(),

  vehicle: z.object({
    license_plate: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    vin: z.string().optional(),
    year: z.string().optional(),
  }).optional(),

  // Step 3 - Police Information
  police_assignment: z.object({
    police_visited: z.boolean().optional(),
    police_station: z.string().optional(),
    police_officer_name: z.string().optional(),
    police_officer_phone: z.string().optional(),
    police_report_number: z.string().optional(),
  }).optional(),

  // Step 4 - Other Vehicles
  other_vehicles: z.array(
    z.object({
      license_plate: z.string().min(2, { message: "Plate number is required" }),
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
      estimated_cost: z.number().optional(),
      owner_name: z.string().min(2, { message: "Owner name is required" }),
      description: z.string().min(10, { message: "Damage description is required" }),
    }),
  ).optional(),

  // Step 6 - Garage Information
  garages: z.array(
    z.object({
      id: z.string().optional(),
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
}).superRefine((data, ctx) => {
  // Conditional validation for vehicle section
  if (data.vehicle_selection_mode === "existing") {
    // When selecting existing vehicle, selected_vehicle_id is required
    if (!data.selected_vehicle_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a vehicle",
        path: ["selected_vehicle_id"],
      });
    }
  } else if (data.vehicle_selection_mode === "new") {
    // When entering new vehicle, all vehicle fields are required
    if (!data.vehicle?.license_plate || data.vehicle.license_plate.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Plate number is required",
        path: ["vehicle", "license_plate"],
      });
    }

    if (!data.vehicle?.make || data.vehicle.make.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Make is required",
        path: ["vehicle", "make"],
      });
    }

    if (!data.vehicle?.model || data.vehicle.model.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Model is required",
        path: ["vehicle", "model"],
      });
    }

    if (!data.vehicle?.vin || data.vehicle.vin.length < 17) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "VIN (Vehicle Identification Number) is required & 17 characters",
        path: ["vehicle", "vin"],
      });
    }

    if (!data.vehicle?.year || !/^\d{4}$/.test(data.vehicle.year)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year must be a 4-digit number",
        path: ["vehicle", "year"],
      });
    } else {
      const year = parseInt(data.vehicle.year);
      if (year < 1900 || year > new Date().getFullYear()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Year must be between 1900 and the current year",
          path: ["vehicle", "year"],
        });
      }
    }
  }
})
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
    driver_details: z.object({
      has_license: z.boolean().optional(),
      license_number: z.string().optional(),
      license_category: z.string().optional(),
      license_issued_date: z.date().optional(),
      surname: z.string().min(2, { message: "Surname is required" }),
      name: z.string().min(2, { message: "Name is required" }),
      phone: z.string().min(6, { message: "Valid phone number is required" }),
    }),
    vehicle_selection_mode: z.enum(["existing", "new"]),
    selected_vehicle_id: z.string().optional(),
    vehicle: z.object({
      license_plate: z.string().optional(),
      make: z.string().optional(),
      model: z.string().optional(),
      vin: z.string().optional(),
      year: z.string().optional(),
    }).optional(),
  }).superRefine((data, ctx) => {
    // Validate license fields if has_license is true
    if (data.driver_details.has_license) {
      if (!data.driver_details.license_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "License number is required",
          path: ["driver_details", "license_number"],
        });
      }
      if (!data.driver_details.license_category) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "License category is required",
          path: ["driver_details", "license_category"],
        });
      }
      if (!data.driver_details.license_issued_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "License issue date is required",
          path: ["driver_details", "license_issued_date"],
        });
      }
    }

    // Conditional validation for vehicle section
    if (data.vehicle_selection_mode === "existing") {
      // When selecting existing vehicle, only validate that one is selected
      if (!data.selected_vehicle_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a vehicle",
          path: ["selected_vehicle_id"],
        });
      }
    } else if (data.vehicle_selection_mode === "new") {
      // When entering new vehicle, validate all vehicle fields
      if (!data.vehicle?.license_plate || data.vehicle.license_plate.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Plate number is required",
          path: ["vehicle", "license_plate"],
        });
      }
      if (!data.vehicle?.make || data.vehicle.make.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Make is required",
          path: ["vehicle", "make"],
        });
      }
      if (!data.vehicle?.model || data.vehicle.model.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Model is required",
          path: ["vehicle", "model"],
        });
      }
      if (!data.vehicle?.vin || data.vehicle.vin.length < 17) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "VIN (Vehicle Identification Number) is required & 17 characters",
          path: ["vehicle", "vin"],
        });
      }
      if (!data.vehicle?.year || !/^\d{4}$/.test(data.vehicle.year)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Year must be a 4-digit number",
          path: ["vehicle", "year"],
        });
      } else {
        const year = parseInt(data.vehicle.year);
        if (year < 1900 || year > new Date().getFullYear()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Year must be between 1900 and the current year",
            path: ["vehicle", "year"],
          });
        }
      }
    }
  }),
  // Step 3
  z.object({
    police_assignment: z.object({
      police_visited: z.boolean(),
      police_station: z.string().optional(),
      police_officer_name: z.string().optional(),
      police_officer_phone: z.string().optional(),
      police_report_number: z.string().optional(),
    }).optional(),
  }),
  // Step 4
  z.object({
    other_vehicles: z.array(z.object({
      license_plate: z.string().min(2),
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
      estimated_cost: z.any().optional(),
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
  // z.object({
  //   documents: z.array(z.object({
  //     type: z.enum([
  //       "driver_license",
  //       "vehicle_registration",
  //       "accident_scene",
  //       "vehicle_damage",
  //       "police_report",
  //       "witness_statement",
  //       "other",
  //     ]),
  //     file: fileSchema,
  //   })).optional(),
  // }),
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
      file: fileSchema.optional(), // Make optional for existing files
      existing_file_id: z.string().optional(),
      existing_file_name: z.string().optional(),
      existing_file_url: z.string().optional(),
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
  const [isLoadingClaimStatus, setIsLoadingClaimStatus] = useState(true);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
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
        const [claimTypesRes] = await Promise.all([
          await apiRequest(`${API_URL}claim-types/${user.tenant_id}`, "GET")

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
    if (user) {
      fetchData();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only LogedIn Driver can user this panel",
      });
      router.push('/login')
    }
  }, [user, toast]);
  //if there is claim save in sesssion prepopulate field and activate step
  useEffect(() => {
    const initializeClaimStatus = async () => {
      setIsLoadingClaimStatus(true);

      // Check if there's a claim ID in localStorage or URL params
      const savedClaimId = localStorage.getItem('current_claim_id') ||
        new URLSearchParams(window.location.search).get('claim_id');

      if (savedClaimId) {
        try {
          // Fetch claim completion status
          const claimData = await checkClaimCompletionStatus(savedClaimId);

          if (claimData) {
            setClaimId(savedClaimId);

            // Determine completed steps
            const completed = getCompletedStepsFromClaimData(claimData);
            setCompletedSteps(completed);

            // Set current step to next incomplete step
            const nextStep = getNextIncompleteStep(completed);
            setStep(nextStep);

            // Pre-populate form with existing data
            populateFormWithClaimData(claimData);

            toast({
              title: t("claims.claim_resumed"),
              description: t("claims.continuing_from_step") + ` ${nextStep}`,
            });
          } else {
            // Claim not found, start fresh
            localStorage.removeItem('current_claim_id');
            setStep(1);
            setCompletedSteps([]);
          }
        } catch (error) {
          console.error("Error initializing claim status:", error);
          localStorage.removeItem('current_claim_id');
          setStep(1);
          setCompletedSteps([]);
        }
      } else {
        // No saved claim, start fresh
        setStep(1);
        setCompletedSteps([]);
      }

      setIsLoadingClaimStatus(false);
    };

    if (user?.id) {
      initializeClaimStatus();
    }
  }, [user?.id]);

  // existing claim data
  const populateFormWithClaimData = (claimData: any) => {
    // Step 1: Basic Info
    if (claimData.claim_type_id) {
      form.setValue("claim_type_id", claimData.claim_type_id);
    }
    if (claimData.policy_number) {
      form.setValue("policyNumber", claimData.policy_number);
    }
    if (claimData.amount) {
      form.setValue("amount", claimData.amount.toString());
    }
    if (claimData.priority) {
      form.setValue("priority", claimData.priority);
    }
    if (claimData.accident_date) {
      form.setValue("accidentDate", new Date(claimData.accident_date));
    }
    if (claimData.accident_time) {
      form.setValue("accidentTime", claimData.accident_time);
    }
    if (claimData.accident_location) {
      form.setValue("accidentLocation", claimData.accident_location);
    }
    if (claimData.accident_description) {
      form.setValue("accidentDescription", claimData.accident_description);
    }

    // Step 2: Driver Details
    if (claimData.driver_details) {
      const driver = claimData.driver_details;
      form.setValue("driver_details", {
        has_license: driver.has_license,
        license_number: driver.license_number || "",
        license_category: driver.license_category || "",
        license_issued_date: driver.license_issued_date ? new Date(driver.license_issued_date) : undefined,
        surname: driver.surname || user.first_name,
        name: driver.name || user.last_name,
        phone: driver.phone || user.phone,
      });
    }

    // Step 2: Vehicle Data
    if (claimData.vehicles?.length > 0) {
      const vehicle = claimData.vehicles[0]; // Get first vehicle
      if (vehicle.user_id === user?.id) {
        // User's existing vehicle
        form.setValue("vehicle_selection_mode", "existing");
        form.setValue("selected_vehicle_id", vehicle.id);
      } else {
        // New vehicle entered during claim
        form.setValue("vehicle_selection_mode", "new");
        form.setValue("vehicle", {
          license_plate: vehicle.license_plate,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year.toString(),
          vin: vehicle.vin,
        });
      }
    }

    // Step 3: Police Assignment
    if (claimData.police_assignment) {
      const police = claimData.police_assignment;
      form.setValue("police_assignment", {
        police_visited: police.police_visited || false,
        police_station: police.police_station || "",
        police_officer_name: police.police_officer_name || "",
        police_officer_phone: police.police_officer_phone || "",
        police_report_number: police.police_report_number || "",
      });
    }

    // Step 4: Other Vehicles
    if (claimData.other_vehicles) {
      const otherVehicles = claimData.other_vehicles.map((vehicle: any) => ({
        license_plate: vehicle.license_plate || "",
        make: vehicle.make || "",
        type: vehicle.type || "",
        owner_first_name: vehicle.owner_first_name || "",
        owner_last_name: vehicle.owner_last_name || "",
        owner_address: vehicle.owner_address || "",
        insurer_name: vehicle.insurer_name || "",
        policy_number: vehicle.policy_number || "",
      }));
      form.setValue("other_vehicles", otherVehicles);
    }

    // Step 5: Injuries
    if (claimData.injuries) {
      const injuries = claimData.injuries.map((injury: any) => ({
        first_name: injury.first_name || "",
        last_name: injury.last_name || "",
        age: injury.age || 0,
        phone: injury.phone || "",
        profession: injury.profession || "",
        injury_description: injury.injury_description || "",
        is_deceased: injury.is_deceased || false,
      }));
      form.setValue("injuries", injuries);
    }

    // Step 5: Damages
    if (claimData.damages) {
      const damages = claimData.damages.map((damage: any) => ({
        type: damage.type || "",
        estimated_cost: damage.estimated_cost || 0,
        owner_name: damage.owner_name || "",
        description: damage.description || "",
      }));
      form.setValue("damages", damages);
    }

    // Step 6: Garages
    if (claimData.garages) {
      const garages = claimData.garages.map((garage: any) => ({
        name: garage.name || "",
        address: garage.address || "",
      }));
      form.setValue("garages", garages);
    }

    // Step 7: Documents
    // if (claimData.documents) {
    //   const documents = claimData.documents.map((document: any) => ({
    //     type: document.type || "other",
    //     file: document.file || null, // Note: Files might need special handling
    //   }));
    //   form.setValue("documents", documents);
    // }
    // if (claimData.documents) {
    //   const documents = claimData.documents.map((document: any) => ({
    //     type: document.type || "other",
    //     file: null,
    //     existing_file_id: document.id,
    //     existing_file_name: document.file_name,
    //     existing_file_url: document.file_url,
    //   }));
    //   form.setValue("documents", documents);

    //   // You might want to store existing documents separately
    //   setExistingDocuments(claimData.documents);
    // }
    if (claimData.documents) {
      loadExistingDocuments(claimData.documents);

      const documentEntries = claimData.documents.map((document: any) => ({
        type: document.type || "other",
        file: null,
        existing_file_id: document.id,
        existing_file_name: document.file_name || document.name,
        existing_file_url: document.file_url || document.url,
        is_existing: true,
      }));
      form.setValue("documents", documentEntries);
    }

    // Additional Notes (if exists)
    if (claimData.additional_notes) {
      form.setValue("additionalNotes", claimData.additional_notes);
    }
  };
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
      driver_details: {
        has_license: true,
        license_number: "",
        license_category: "",
        license_issued_date: undefined,
        surname: user.first_name,
        name: user.last_name,
        phone: user.phone,
      },
      vehicle_selection_mode: "new",
      selected_vehicle_id: "",
      vehicle: {
        license_plate: "",
        make: "",
        model: "",
        year: "",
        vin: "",
      },
      police_assignment: {
        police_visited: true,
        police_station: "",
        police_officer_name: "",
        police_officer_phone: "",
        police_report_number: "",
      },
      other_vehicles: [],
      injuries: [],
      damages: [],
      garages: [],
      documents: [],
      additionalNotes: "",
    },
  });
  // Field arrays for dynamic inputs
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

  // const validateStep = async (stepNumber: number) => {
  //   try {
  //     const currentSchema = stepValidationSchemas[stepNumber - 1];
  //     const values = form.getValues();
  //     const stepFields: any = {};
  //     Object.keys(currentSchema.shape).forEach((key) => {
  //       stepFields[key] = values[key as keyof typeof values];
  //     });
  //     await currentSchema.parseAsync(stepFields);
  //     if (!completedSteps.includes(stepNumber)) {
  //       setCompletedSteps((prev) => [...prev, stepNumber]);
  //     }
  //     if (stepErrors.includes(stepNumber)) {
  //       setStepErrors((prev) => prev.filter((s) => s !== stepNumber));
  //     }
  //     return true;
  //   } catch (error) {
  //     if (!stepErrors.includes(stepNumber)) {
  //       setStepErrors((prev) => [...prev, stepNumber]);
  //     }
  //     toast({
  //       variant: "destructive",
  //       title: `Kanda Claim - ${t("claims.validation_error")}`,
  //       description: t("claims.please_complete_required: " + error),
  //     });
  //     return false;
  //   }
  // };
  const validateStep = async (stepNumber: number) => {
    try {
      const values = form.getValues();
      
      // Special handling for Step 2 (Driver & Vehicle)
      if (stepNumber === 2) {
        if (!values.driver_details?.surname || values.driver_details.surname.length < 2) {
          throw new Error("Surname is required");
        }
        if (!values.driver_details?.name || values.driver_details.name.length < 2) {
          throw new Error("Name is required");
        }
        if (!values.driver_details?.phone || values.driver_details.phone.length < 6) {
          throw new Error("Valid phone number is required");
        }
        
        // License validation if has_license is true
        if (values.driver_details?.has_license) {
          if (!values.driver_details?.license_number) {
            throw new Error("License number is required");
          }
          if (!values.driver_details?.license_category) {
            throw new Error("License category is required");
          }
          if (!values.driver_details?.license_issued_date) {
            throw new Error("License issue date is required");
          }
        }
        
        // Vehicle validation based on selection mode
        if (values.vehicle_selection_mode === "existing") {
          if (!values.selected_vehicle_id) {
            throw new Error("Please select a vehicle");
          }
        } else if (values.vehicle_selection_mode === "new") {
          if (!values.vehicle?.license_plate || values.vehicle.license_plate.length < 2) {
            throw new Error("Plate number is required");
          }
          if (!values.vehicle?.make || values.vehicle.make.length < 2) {
            throw new Error("Make is required");
          }
          if (!values.vehicle?.model || values.vehicle.model.length < 2) {
            throw new Error("Model is required");
          }
          if (!values.vehicle?.vin || values.vehicle.vin.length < 17) {
            throw new Error("VIN (Vehicle Identification Number) is required & 17 characters");
          }
          if (!values.vehicle?.year || !/^\d{4}$/.test(values.vehicle.year)) {
            throw new Error("Year must be a 4-digit number");
          } else {
            const year = parseInt(values.vehicle.year);
            if (year < 1900 || year > new Date().getFullYear()) {
              throw new Error("Year must be between 1900 and the current year");
            }
          }
        } else {
          throw new Error("Please select vehicle input mode");
        }
        
        // Mark step as completed and return true
        if (!completedSteps.includes(stepNumber)) {
          setCompletedSteps((prev) => [...prev, stepNumber]);
        }
        if (stepErrors.includes(stepNumber)) {
          setStepErrors((prev) => prev.filter((s) => s !== stepNumber));
        }
        return true;
      }
      
      // Standard schema validation for all other steps
      const currentSchema = stepValidationSchemas[stepNumber - 1];
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
        description: error instanceof Error ? error.message : String(error),
      });
      return false;
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

  const handleGarageSelection = (garage: any) => {
    appendGarage({
      id: garage.id,
      name: garage.name,
      address: garage.address,
      phone: garage.phone || "",
      repair_estimate: 0,
    });
    setShowGarageRecommendations(false);
  };
  // Handle vehicle selection
  const handleVehicleSelection = (vehicleId: string) => {
    const selectedVehicle = user.vehicles?.find(v => v.id === vehicleId);
    if (selectedVehicle) {
      // Clear vehicle form fields since we're using existing vehicle
      form.setValue("vehicle", {
        license_plate: "",
        make: "",
        model: "",
        vin: "",
        year: ""
      });
    }
  };
  const saveStep = async () => {
    if (isSaving) return;
    if (step > 1 && !claimId) {
      toast({
        variant: "destructive",
        title: "Claim Basic Info Missing",
        description: "Please complete Step 1 to create a claim.",
      });
      setStep(1);
      return;
    }
    setIsSaving(true);
    setIsSubmitting(true);
    try {
      const currentStepValid = (step === 2 && form.getValues().vehicle_selection_mode === "existing")? true : await validateStep(step);
      if (!currentStepValid) {
        toast({
          variant: "destructive",
          title: `Step ${step} Invalid`,
          description: "Please complete all required fields.",
        });
        return;
      }
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
          submitted_at: new Date().toDateString(),
          submitted_by: user?.name,
        };
        response = await apiRequest(`${API_URL}claims`, "POST", data);
        if (!response.id) throw new Error("Claim ID not returned from API");
        setClaimId(response.id);
        localStorage.setItem('current_claim_id', response.id);
      } else if (step === 2) {
        if (values.driver_details) {
          const driver = values.driver_details;
          const driverData = {
            user_id: user?.id,
            has_license: driver.has_license ? true : false,
            license_number: driver.has_license ? (driver.license_number || "") : "",
            license_category: driver.has_license ? (driver.license_category || "") : "",
            license_issued_date: driver.has_license ? (driver.license_issued_date?.toISOString().split("T")[0] || "") : "",
          };
          await apiRequest(`${API_URL}claims/${claimId}/driver-details`, "POST", driverData);
        }
        let vehicleId;

        if (values.vehicle_selection_mode === "existing" && values.selected_vehicle_id) {
          // Use existing vehicle
          vehicleId = values.selected_vehicle_id;
        } else if (values.vehicle_selection_mode === "new" && values.vehicle) {
          const vehicle = values.vehicle;
          const vehicleData = {
            license_plate: vehicle.license_plate,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            vin: vehicle.vin,
            user_id: user?.id,
            tenant_id: user?.tenant_id,
          };

          const createdVehicle = await apiRequest(`${API_URL}vehicles`, "POST", vehicleData);
          vehicleId = createdVehicle.id;
        }
        if (vehicleId) {
          const claimVehicleData = {
            claim_id: claimId,
            vehicle_id: vehicleId,
            tenant_id: user?.tenant_id,
          };
          await apiRequest(`${API_URL}claims/${claimId}/vehicle`, "POST", claimVehicleData);
        }
      }
      else if (step === 3) {
        const police = values.police_assignment
        if (police) {
          const data = {
            police_visited: police.police_visited ? true : false,
            police_station: police.police_station || "",
            police_report_number: police.police_report_number || "",
            police_officer_name: police.police_officer_name || "",
            police_officer_phone: police.police_officer_phone || "",
          }
          response = await apiRequest(`${API_URL}claims/${claimId}/police-assignments`, "POST", data);
        }
      } else if (step === 4) {
        const data = {
          other_vehicles: values.other_vehicles?.map((vehicle) => ({
            license_plate: vehicle.license_plate,
            make: vehicle.make,
            type: vehicle.type,
            owner_first_name: vehicle.owner_first_name,
            owner_last_name: vehicle.owner_last_name,
            owner_address: vehicle.owner_address,
            insurer_name: vehicle.insurer_name,
            policy_number: vehicle.policy_number,
          })),
        };
        if (data.other_vehicles?.length) {
          for (const car of data.other_vehicles) {
            await apiRequest(`${API_URL}claims/${claimId}/other-vehicles`, "POST", car);
          }
        }
      } else if (step === 5) {
        const dataInjuries = {
          injuries: values.injuries?.map((injury) => ({
            first_name: injury.first_name,
            last_name: injury.last_name,
            age: injury.age.toString(),
            phone: injury.phone,
            profession: injury.profession,
            injury_description: injury.injury_description,
            is_deceased: injury.is_deceased ? true : false,
          })),
        };
        if (dataInjuries.injuries?.length) {
          for (const injury of dataInjuries.injuries) {
            await apiRequest(`${API_URL}claims/${claimId}/injuries`, "POST", injury);
          }
        }

        const dataDamages = {
          damages: values.damages?.map((damage) => ({
            type: damage.type,
            estimated_cost: Number(damage.estimated_cost),
            owner_name: damage.owner_name,
            description: damage.description,
          })),
        };
        if (dataDamages.damages?.length) {
          for (const damage of dataDamages.damages) {
            await apiRequest(`${API_URL}claims/${claimId}/damages`, "POST", damage);
          }
        }
      } else if (step === 6) {
        const dataGarages = {
          garages: values.garages?.map((garage) => ({
            id: garage.id,
            name: garage.name,
            address: garage.address,
            phone: garage.phone || "",
            repair_estimate: garage.repair_estimate?.toString() || "",
          })),
        };
        if (dataGarages.garages?.length) {
          for (const garage of dataGarages.garages) {
            await apiRequest(`${API_URL}claims/${claimId}/garages`, "POST", garage);
          }
        }
      } else if (step === 7) {
        const documents = values.documents || [];
        const newDocuments = documents.filter((doc: any) => doc.file && !doc.is_existing);

        // Upload new documents
        for (const doc of newDocuments) {
          if (doc.file) {
            const formData = new FormData();
            formData.append('file', doc.file);
            formData.append('type', doc.type);
            formData.append('claim_id', claimId + "");
            formData.append('tenant_id', user?.tenant_id);

            await apiRequest(`${API_URL}claims/${claimId}/documents`, "POST", formData);
          }
        }

        for (const documentId of documentsToDelete) {
          try {
            await apiRequest(`${API_URL}claims/${claimId}/documents/${documentId}`, "DELETE");
          } catch (error) {
            console.error("Error deleting document:", error);
          }
        }

        setDocumentsToDelete([]);

        // Update additional notes
        if (values.additionalNotes) {
          await apiRequest(`${API_URL}claims/${claimId}/notes`, "POST", {
            notes: values.additionalNotes
          });
        }
      }

      setCompletedSteps((prev) => [...prev, step]);
      toast({
        title: `Step ${step} Saved`,
        description: `Step ${step} has been successfully saved.`,
      });

      if (step < 7) {
        setStep(step + 1);
      } else if (step === 7) {
        await apiRequest(`${API_URL}claims/${claimId}/status`, "PATCH", { status: "submitted" });
        localStorage.removeItem('current_claim_id');
        toast({
          title: "Claim Submitted",
          description: "Your claim, including documents, has been successfully submitted.",
        });
        router.push("/dashboard/driver");
      }
    } catch (error: any) {
      console.error(`Error in Step ${step}:`, error);
      toast({
        variant: "destructive",
        title: `Step ${step} Failed`,
        description: error.response?.data?.message || "An error occurred.",
      });
    } finally {
      setIsSaving(false);
      setIsSubmitting(false);
    }
  };


  // Function to check claim completion status
  const checkClaimCompletionStatus = async (claimId: string) => {
    try {
      const response = await apiRequest(`${API_URL}claims/${claimId}/completion-status`, "GET");
      return response;
    } catch (error) {
      console.error("Error checking claim completion status:", error);
      return null;
    }
  };

  // steps are completed based on claim data
  const getCompletedStepsFromClaimData = (claimData: any) => {
    const completed: number[] = [];

    // Step 1: Basic info (always completed if claim exists)
    if (claimData.id) {
      completed.push(1);
    }

    // Step 2: Driver and vehicle info
    if (claimData.driver_details && claimData.vehicles?.length > 0) {
      completed.push(2);
    }

    // Step 3: Police info
    if (claimData.police_assignment) {
      completed.push(3);
    }

    // Step 4: Other vehicles (check if step was visited, even with empty array)
    if (claimData.other_vehicles !== undefined) {
      completed.push(4);
    }

    // Step 5: Injuries and damages (check if step was visited)
    if (claimData.injuries !== undefined && claimData.damages !== undefined) {
      completed.push(5);
    }

    // Step 6: Garage info (check if step was visited)
    if (claimData.garages !== undefined) {
      completed.push(6);
    }

    // Step 7: Documents (check if step was visited)
    if (claimData.documents !== undefined) {
      completed.push(7);
    }

    return completed;
  };

  // Function to get the next incomplete step
  const getNextIncompleteStep = (completedSteps: number[]) => {
    for (let i = 1; i <= 7; i++) {
      if (!completedSteps.includes(i)) {
        return i;
      }
    }
    return 7; // All steps completed, show last step
  };

  const isImageFile = (filename: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRemoveExistingDocument = (documentId: string) => {
    // Add to delete list
    setDocumentsToDelete(prev => [...prev, documentId]);

    // Remove from existing documents display
    setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: t("documents.document_removed"),
      description: t("documents.document_will_be_deleted"),
    });
  };

  const loadExistingDocuments = (documents: any[]) => {
    const existingDocs = documents.map((doc: any) => ({
      id: doc.id,
      type: doc.type,
      file_name: doc.file_name || doc.name || 'Unknown file',
      file_url: doc.file_url || doc.url,
      file_size: doc.file_size || doc.size || 0,
      uploaded_at: doc.created_at || doc.uploaded_at,
      is_existing: true,
    }));

    setExistingDocuments(existingDocs);
  };

  return (
    <DashboardLayout
      user={{ name: user.name, role: user.role.name + " @ " + user.tenant.name, avatar: '/placeholder.svg' }}
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
      <div className="container mx-auto p-4">
        <div className="mb-8">
          {isLoadingClaimStatus ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
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
                  onClick={() => {
                    // Only allow navigation to completed steps or the next incomplete step
                    const nextIncomplete = getNextIncompleteStep(completedSteps);
                    if (completedSteps.includes(s.number) || s.number === nextIncomplete) {
                      setStep(s.number);
                    }
                  }}
                  disabled={!completedSteps.includes(s.number) && s.number > getNextIncompleteStep(completedSteps)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border transition-colors w-full md:w-auto justify-center md:justify-start",
                    step === s.number
                      ? "bg-primary text-primary-foreground border-primary"
                      : completedSteps.includes(s.number)
                        ? "bg-primary/20 text-primary hover:bg-primary/30 border-primary/30"
                        : stepErrors.includes(s.number)
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30"
                          : s.number > getNextIncompleteStep(completedSteps)
                            ? "bg-muted/50 text-muted-foreground/50 border-muted/50 cursor-not-allowed"
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
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">Kanda Claim - {t("claims.new")}</h1>
          <p className="text-muted-foreground mt-2">{t("claims.provide_information")}</p>
        </div>

        <Form {...form}>
          <form className="space-y-8">
            {/* claim init details */}
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
            {/* driver and vehicle */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("claims.driver_vehicle_info")}</CardTitle>
                  <CardDescription>{t("claims.driver_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border p-4 rounded-md space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{t("form.driver_details")}</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name={`driver_details.has_license`}
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
                    {form.watch(`driver_details.has_license`) && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`driver_details.license_number`}
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
                            name={`driver_details.license_category`}
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
                            name={`driver_details.license_issued_date`}
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
                        name={`driver_details.surname`}
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
                        name={`driver_details.name`}
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
                      name={`driver_details.phone`}
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

                  <div className="border p-4 rounded-md space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{t("form.vehicle_details")}</h3>
                    </div>

                    {/* Vehicle Selection Mode */}
                    <FormField
                      control={form.control}
                      name="vehicle_selection_mode"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t("form.vehicle_selection")}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-row space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="existing" id="existing" />
                                <label htmlFor="existing">{t("form.select_existing_vehicle")}</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="new" id="new" />
                                <label htmlFor="new">{t("form.enter_new_vehicle")}</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Existing Vehicle Selection */}
                    {form.watch("vehicle_selection_mode") === "existing" && (
                      <FormField
                        control={form.control}
                        name="selected_vehicle_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.select_vehicle")}*</FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              handleVehicleSelection(value);
                            }} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("form.choose_vehicle")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {user.vehicles.map((vehicle) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                    {vehicle.license_plate} - {vehicle.make} {vehicle.model} ({vehicle.year})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* New Vehicle Form - Show when mode is 'new' or no existing vehicles */}
                    {(form.watch("vehicle_selection_mode") === "new" || user.vehicles.length === 0) && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="vehicle.license_plate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("form.vehicle_plate_number")}*</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("form.vehicle_plate_placeholder")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="vehicle.vin"
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
                            name="vehicle.make"
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
                            name="vehicle.model"
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
                            name="vehicle.year"
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
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("claims.driver_vehicle_info")}</CardTitle>
                  <CardDescription>{t("claims.driver_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border p-4 rounded-md space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{t("form.driver_details")}</h3>

                    </div>
                    <FormField
                      control={form.control}
                      name={`driver_details.has_license`}
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
                    {form.watch(`driver_details.has_license`) && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`driver_details.license_number`}
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
                            name={`driver_details.license_category`}
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
                            name={`driver_details.license_issued_date`}
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
                        name={`driver_details.surname`}
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
                        name={`driver_details.name`}
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
                      name={`driver_details.phone`}
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

                  <div className="border p-4 rounded-md space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{t("form.vehicle_details")}</h3>

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`vehicle.license_plate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.vehicle_plate_number")}*</FormLabel>
                            <FormControl>
                              <Input placeholder={t("form.vehicle_plate_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`vehicle.vin`}
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
                        name={`vehicle.make`}
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
                        name={`vehicle.model`}
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
                        name={`vehicle.year`}
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
                </CardContent>
              </Card>
            )} */}
            {/* police statements */}
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
                  <div className="border p-4 rounded-md space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{t("form.police_report_info_details")}</h3>

                    </div>
                    <FormField
                      control={form.control}
                      name={`police_assignment.police_visited`}
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
                                <RadioGroupItem value="true" id={`police-yes`} />
                                <label htmlFor={`police-yes`}>{t("action.yes")}</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id={`police-no`} />
                                <label htmlFor={`police-no`}>{t("action.no")}</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch(`police_assignment.police_visited`) && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`police_assignment.police_station`}
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
                            name={`police_assignment.police_report_number`}
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
                            name={`police_assignment.police_officer_name`}
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
                            name={`police_assignment.police_officer_phone`}
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
                </CardContent>
              </Card>
            )}
            {/* other vehicles */}
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
                          name={`other_vehicles.${index}.license_plate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("form.license_plate")}*</FormLabel>
                              <FormControl>
                                <Input placeholder={t("form.license_plate_placeholder")} {...field} />
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
                        license_plate: "",
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
            {/* injuries and damages */}
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
                      <div className="grid grid-col-2">

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
                          name={`damages.${index}.estimated_cost`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("form.estimated_cost")}*</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder={t("form.estimated_cost_placeholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
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
                        estimated_cost: 0,
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
            {/* garages */}
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
                          {t("form.close")}
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
            {/* documents */}
            {/* {step === 7 && (
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
            )} */}
            {step === 7 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("claims.documents_photos")}</CardTitle>
                  <CardDescription>{t("claims.documents_details")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Show existing documents section if any */}
                  {existingDocuments.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-lg">{t("documents.existing_documents")}</h3>
                        <Badge variant="secondary">{existingDocuments.length} {t("documents.files")}</Badge>
                      </div>

                      {/* Group existing documents by type */}
                      {[
                        { type: "driver_license", label: t("form.driver_license") },
                        { type: "vehicle_registration", label: t("form.vehicle_registration") },
                        { type: "accident_scene", label: t("form.accident_scene_photos") },
                        { type: "vehicle_damage", label: t("form.vehicle_damage_photos") },
                        { type: "police_report", label: t("form.police_report") },
                        { type: "witness_statement", label: t("form.witness_statements") },
                        { type: "other", label: t("form.additional_documents") },
                      ].map(({ type, label }) => {
                        const existingOfType = existingDocuments.filter(doc => doc.type === type);
                        if (existingOfType.length === 0) return null;

                        return (
                          <div key={`existing-${type}`} className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground">{label}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {existingOfType.map((doc) => (
                                <div key={doc.id} className="relative rounded-md overflow-hidden border border-border group">
                                  <AspectRatio ratio={1} className="bg-muted">
                                    {isImageFile(doc.file_name) ? (
                                      <img
                                        src={doc.file_url || "/placeholder.svg"}
                                        alt={doc.file_name}
                                        className="object-cover w-full h-full"
                                      />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center w-full h-full bg-muted">
                                        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-xs text-center px-2 font-medium">
                                          {doc.file_name}
                                        </span>
                                      </div>
                                    )}

                                    {/* Document actions overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => window.open(doc.file_url, '_blank')}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemoveExistingDocument(doc.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </AspectRatio>

                                  {/* Document info */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                                    <p className="text-xs font-medium truncate">{doc.file_name}</p>
                                    <p className="text-xs opacity-80">
                                      {formatFileSize(doc.file_size || 0)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      <Separator className="my-6" />
                    </div>
                  )}

                  {/* Add new documents section */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">{t("documents.add_new_documents")}</h3>

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
                  </div>

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
            {/* <div className="flex justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="mx-6">
                  {t("action.previous")}
                </Button>
              )}
              {step < 7 ? (
                <Button type="button" onClick={saveStep} disabled={isSubmitting} className="mx-6">
                  {step < 7 ? t("action.save_and_next") : isSubmitting ? t("action.submitting") : t("action.submit_claim")}
                </Button>
              ) : (
                <Button type="button" onClick={saveStep} disabled={isSubmitting} className="mx-6">
                  {step < 7 ? t("action.save_and_next") : isSubmitting ? t("action.submitting") : t("action.submit_claim")}
                </Button>
              )}
            </div> */}
            <div className="flex justify-between">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="mx-6"
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("action.previous")}
                </Button>
              )}

              {/* <Button
                type="button"
                onClick={saveStep}
                disabled={isSubmitting || isLoadingClaimStatus}
                className={cn(
                  "mx-6 ml-auto transition-all duration-200",
                  isSubmitting && "opacity-90"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="animate-pulse">
                      {step < 7 ? t("action.saving") : t("action.submitting")}
                    </span>
                  </>
                ) : (
                  <>
                    {step < 7 ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("action.save_and_next")}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t("action.submit_claim")}
                      </>
                    )}
                  </>
                )}
              </Button> */}
              <Button
                type="button"
                onClick={saveStep}
                disabled={isSubmitting}
                className="mx-6 ml-auto min-w-[140px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{step < 7 ? t("action.saving") : t("action.submitting")}</span>
                    <span className="text-xs opacity-70">
                      {Math.round((step / 7) * 100)}%
                    </span>
                  </div>
                ) : (
                  <>
                    {step < 7 ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("action.save_and_next")}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t("action.submit_claim")}
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}


