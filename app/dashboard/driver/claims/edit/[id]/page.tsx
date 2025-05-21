"use client"
import { toast } from "@/components/ui/use-toast"; // Adjust path to your toast component
import { Label } from "@/components/ui/label"; // Adjust path to your label component
// Add other specific components (e.g., DatePicker, Select) used in your form

import type React from "react";
import { useState, useEffect, use } from "react";
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_DOC_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type DocumentType =
    | "driver_license"
    | "vehicle_registration"
    | "accident_scene"
    | "vehicle_damage"
    | "police_report"
    | "witness_statement"
    | "constat"
    | "other";
interface Garage {
    id: number;
    name: string;
    address: string;
    phone?: string;
    distance?: number; // in km, calculated from userLocation
    rating?: number;
    specializations?: string[];
    openHours?: string;
    description?: string;
}

interface GarageRecommendationsProps {
    onSelect: (garage: Garage) => void;
    // Add other props if needed (e.g., search criteria)
    searchLocation?: string; // Optional, in case location is supported
}
interface Props {
    params: Promise<{ id: string }>;
}
// Component
export default function EditClaimPage({ params }: Props) {
    const router = useRouter()
    const { id } = use(params);

    const { t } = useLanguage();
    const { user, apiRequest, webRequest, apiPOST } = useAuth();

    // Form schema
    const formSchema = z.object({
        claim_type_id: z.string().min(1, { message: t("form.required") }),
        policyNumber: z.string().min(1, { message: t("form.required") }),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: t("form.invalid_amount") }),
        priority: z.enum(["low", "medium", "high"]),
        accidentDate: z.date(),
        accidentTime: z.string().min(1, { message: t("form.required") }),
        accidentLocation: z.string().min(1, { message: t("form.required") }),
        accidentDescription: z.string().min(1, { message: t("form.required") }),
        additionalNotes: z.string().optional(),
        driver_details: z.array(
            z.object({
                hasLicense: z.boolean(),
                licenseNumber: z.string().optional(),
                licenseCategory: z.string().optional(),
                licenseIssuedDate: z.date().optional(),
            })
        ),
        vehicles: z.array(
            z.object({
                vehicleLicensePlate: z.string().min(1, { message: t("form.required") }),
                vehicleMake: z.string().min(1, { message: t("form.required") }),
                vehicleModel: z.string().min(1, { message: t("form.required") }),
                vehicleYear: z.string().regex(/^\d{4}$/, { message: t("form.invalid_year") }),
                vin: z.string().optional(),
            })
        ),
        police_assignments: z.array(
            z.object({
                policeVisited: z.boolean(),
                policeStation: z.string().optional(),
                policeReportNumber: z.string().optional(),
                policeOfficerName: z.string().optional(),
                policeOfficerPhone: z.string().optional(),
            })
        ).optional(),
        other_vehicles: z.array(
            z.object({
                id: z.string().optional(), // Add for editing
                license_plate: z.string().min(1, { message: t("form.required") }),
                make: z.string().min(1, { message: t("form.required") }),
                type: z.string().min(1, { message: t("form.required") }),
                owner_first_name: z.string().min(1, { message: t("form.required") }),
                owner_last_name: z.string().min(1, { message: t("form.required") }),
                owner_address: z.string().min(1, { message: t("form.required") }),
                insurer_name: z.string().optional(),
                policy_number: z.string().optional(),
            })
        ).optional(),
        injuries: z.array(
            z.object({
                id: z.string().optional(), // Add for editing
                first_name: z.string().min(1, { message: t("form.required") }),
                last_name: z.string().min(1, { message: t("form.required") }),
                age: z.number().min(0, { message: t("form.invalid_age") }),
                phone: z.string().optional(),
                profession: z.string().optional(),
                injury_description: z.string().min(1, { message: t("form.required") }),
                is_deceased: z.boolean(),
            })
        ).optional(),
        damages: z.array(
            z.object({
                id: z.string().optional(), // Add for editing
                type: z.string().min(1, { message: t("form.required") }),
                owner_name: z.string().min(1, { message: t("form.required") }),
                description: z.string().min(1, { message: t("form.required") }),
            })
        ).optional(),
        garages: z.array(
            z.object({
                id: z.string().optional(),
                name: z.string().min(1, t("form.required")),
                address: z.string().min(1, t("form.required")),
                phone: z.string().optional(),
                repair_estimate: z.number().optional(),
                distance: z.number().optional(), // Add distance
            })
        )
            .optional(),
        documents: z.array(
            z.object({
                id: z.string().optional(), // Add for editing
                type: z.enum([
                    "driver_license",
                    "vehicle_registration",
                    "accident_scene",
                    "vehicle_damage",
                    "police_report",
                    "witness_statement",
                    "constat", // Add for Rwanda
                    "other",
                ]),
                file: z.any().optional(),
                url: z.string().optional(), // Add for preview
            })
        ).optional(),
    });
    // Form initialization
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            claim_type_id: "",
            policyNumber: "",
            amount: "0",
            priority: "medium",
            accidentDate: undefined,
            accidentTime: "",
            accidentLocation: "",
            accidentDescription: "",
            additionalNotes: "",
            driver_details: [{ hasLicense: true, licenseNumber: "", licenseCategory: "", licenseIssuedDate: undefined }],
            vehicles: [{ vehicleLicensePlate: "", vehicleMake: "", vehicleModel: "", vehicleYear: "", vin: "" }],
            police_assignments: [],
            other_vehicles: [],
            injuries: [],
            damages: [],
            garages: [],
            documents: [],
        },
    });

    const { fields: policeFields, append: appendPoliceAssignment, remove: removePoliceAssignment } = useFieldArray({
        control: form.control,
        name: "police_assignments",
    });
    const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
        control: form.control,
        name: "documents",
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

    // State declarations
    const [step, setStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [stepErrors, setStepErrors] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [claimId, setClaimId] = useState<string | null>(null);

    interface Previews {
        driverLicensePhoto: string;
        vehicleRegistrationPhoto: string;
        accidentScenePhotos: string[];
        vehicleDamagePhotos: string[];
        policeReportDoc: string;
        witnessStatements: string[];
        otherDocuments: string[];
        constatPhotos: string[];
    }

    const [previews, setPreviews] = useState<Previews>({
        driverLicensePhoto: "",
        vehicleRegistrationPhoto: "",
        accidentScenePhotos: [],
        vehicleDamagePhotos: [],
        policeReportDoc: "",
        witnessStatements: [],
        otherDocuments: [],
        constatPhotos: [],
    });
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    // Cache fetched data to track changes
    const [driverDetails, setDriverDetails] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [policeAssignments, setPoliceAssignments] = useState<any[]>([]);
    const [otherVehicles, setOtherVehicles] = useState<any[]>([]);
    const [injuries, setInjuries] = useState<any[]>([]);
    const [damages, setDamages] = useState<any[]>([]);
    const [garages, setGarages] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);

    // Fetch claim data
    useEffect(() => {
        setClaimId(id)
        const fetchClaimData = async () => {
            if (!claimId || !user) return;
            try {
                // Fetch claim data
                const claim = await apiRequest(`${API_URL}claims/${claimId}`, "GET");
                // Fetch related data
                const [
                    driverDetailsRes,
                    vehiclesRes,
                    policeAssignmentsRes,
                    otherVehiclesRes,
                    injuriesRes,
                    damagesRes,
                    garagesRes,
                    documentsRes,
                ] = await Promise.all([
                    apiRequest(`${API_URL}claims/${claimId}/driver-details`, "GET"),
                    apiRequest(`${API_URL}vehicles?claim_id=${claimId}`, "GET"),
                    apiRequest(`${API_URL}claims/${claimId}/police-assignments`, "GET"),
                    apiRequest(`${API_URL}claims/${claimId}/other-vehicles`, "GET"),
                    apiRequest(`${API_URL}claims/${claimId}/injuries`, "GET"),
                    apiRequest(`${API_URL}claims/${claimId}/damages`, "GET"),
                    apiRequest(`${API_URL}claims/${claimId}/garages`, "GET"),
                    apiRequest(`${API_URL}claims/${claimId}/documents`, "GET"),
                ]);

                // Store fetched data
                setDriverDetails(driverDetailsRes || []);
                setVehicles(vehiclesRes || []);
                setPoliceAssignments(policeAssignmentsRes || []);
                setOtherVehicles(otherVehiclesRes || []);
                setInjuries(injuriesRes || []);
                setDamages(damagesRes || []);
                setGarages(garagesRes || []);
                setDocuments(documentsRes || []);

                // Format data for form
                const formData = {
                    claim_type_id: claim.claim_type_id || "",
                    policyNumber: claim.policy_number || "",
                    amount: claim.amount?.toString() || "0",
                    priority: claim.priority || "medium",
                    accidentDate: claim.accident_date ? new Date(claim.accident_date) : undefined,
                    accidentTime: claim.accident_time || "",
                    accidentLocation: claim.location || "",
                    accidentDescription: claim.description || "",
                    additionalNotes: claim.note || "",
                    driver_details: driverDetailsRes.length
                        ? driverDetailsRes.map((d: any) => ({
                            hasLicense: d.has_license,
                            licenseNumber: d.license_number || "",
                            licenseCategory: d.license_category || "",
                            licenseIssuedDate: d.license_issued_date ? new Date(d.license_issued_date) : undefined,
                        }))
                        : [{ hasLicense: true, licenseNumber: "", licenseCategory: "", licenseIssuedDate: undefined }],
                    vehicles: vehiclesRes.length
                        ? vehiclesRes.map((v: any) => ({
                            id: v.id,
                            vehicleLicensePlate: v.license_plate || "",
                            vehicleMake: v.make || "",
                            vehicleModel: v.model || "",
                            vehicleYear: v.year?.toString() || "",
                            vin: v.vin || "",
                        }))
                        : [{ vehicleLicensePlate: "", vehicleMake: "", vehicleModel: "", vehicleYear: "", vin: "" }],
                    police_assignments: policeAssignmentsRes.length
                        ? policeAssignmentsRes.map((p: any) => ({
                            policeVisited: p.police_visited,
                            policeStation: p.police_station || "",
                            policeReportNumber: p.police_report_number || "",
                            policeOfficerName: p.police_officer_name || "",
                            policeOfficerPhone: p.police_officer_phone || "",
                        }))
                        : [],
                    other_vehicles: otherVehiclesRes.length
                        ? otherVehiclesRes.map((v: any) => ({
                            id: v.id,
                            license_plate: v.license_plate || "",
                            make: v.make || "",
                            type: v.type || "",
                            owner_first_name: v.owner_first_name || "",
                            owner_last_name: v.owner_last_name || "",
                            owner_address: v.owner_address || "",
                            insurer_name: v.insurer_name || "",
                            policy_number: v.policy_number || "",
                        }))
                        : [],
                    injuries: injuriesRes.length
                        ? injuriesRes.map((i: any) => ({
                            id: i.id,
                            first_name: i.first_name || "",
                            last_name: i.last_name || "",
                            age: i.age ? Number(i.age) : 0,
                            phone: i.phone || "",
                            profession: i.profession || "",
                            injury_description: i.injury_description || "",
                            is_deceased: i.is_deceased || false,
                        }))
                        : [],
                    damages: damagesRes.length
                        ? damagesRes.map((d: any) => ({
                            id: d.id,
                            type: d.type || "",
                            owner_name: d.owner_name || "",
                            description: d.description || "",
                        }))
                        : [],
                    garages: garagesRes.length
                        ? garagesRes.map((g: any) => ({
                            id: g.id,
                            name: g.name || "",
                            address: g.address || "",
                            phone: g.phone || "",
                            repair_estimate: g.repair_estimate ? Number(g.repair_estimate) : 0,
                        }))
                        : [],
                    documents: documentsRes.length
                        ? documentsRes.map((d: any) => ({
                            id: d.id,
                            type: d.type,
                            file: null,
                            url: d.url,
                        }))
                        : [],
                };

                // Reset form with fetched data
                form.reset(formData);

                // Set document previews
                setPreviews({
                    driverLicensePhoto: documentsRes.find((d: any) => d.type === "driver_license")?.url || "",
                    vehicleRegistrationPhoto: documentsRes.find((d: any) => d.type === "vehicle_registration")?.url || "",
                    accidentScenePhotos: documentsRes.filter((d: any) => d.type === "accident_scene").map((d: any) => d.url) || [],
                    vehicleDamagePhotos: documentsRes.filter((d: any) => d.type === "vehicle_damage").map((d: any) => d.url) || [],
                    policeReportDoc: documentsRes.find((d: any) => d.type === "police_report")?.url || "",
                    witnessStatements: documentsRes.filter((d: any) => d.type === "witness_statement").map((d: any) => d.url) || [],
                    otherDocuments: documentsRes.filter((d: any) => d.type === "other").map((d: any) => d.url) || [],
                    constatPhotos: documentsRes.filter((d: any) => d.type === "constat").map((d: any) => d.url) || [],
                });

                // Set claimId
                setClaimId(claimId);

                // Mark completed steps
                const completed = [];
                if (claim.claim_type_id) completed.push(1);
                if (driverDetailsRes.length || vehiclesRes.length) completed.push(2);
                if (policeAssignmentsRes.length) completed.push(3);
                if (otherVehiclesRes.length) completed.push(4);
                if (injuriesRes.length || damagesRes.length) completed.push(5);
                if (garagesRes.length) completed.push(6);
                if (documentsRes.length) completed.push(7);
                setCompletedSteps(completed);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Failed to Load Claim",
                    description: error.response?.data?.message || "An error occurred while fetching claim data.",
                });
                router.push("/dashboard/driver/claims");
            }
        };

        fetchClaimData();
    }, [user, claimId, form, toast, router]);

    // Validate individual step
    const validateStep = async (step: number) => {
        const fieldsToValidate: Record<number, (keyof z.infer<typeof formSchema>)[]> = {
            1: [
                "claim_type_id",
                "policyNumber",
                "amount",
                "priority",
                "accidentDate",
                "accidentTime",
                "accidentLocation",
                "accidentDescription",
            ],
            2: ["driver_details", "vehicles"],
            3: ["police_assignments"],
            4: ["other_vehicles"],
            5: ["injuries", "damages"],
            6: ["garages"],
            7: ["documents"],
        };

        try {
            await form.trigger(fieldsToValidate[step]);
            const errors = form.formState.errors;
            const hasErrors = fieldsToValidate[step].some((field) => errors[field]);
            if (hasErrors) {
                setStepErrors((prev) => [...new Set([...prev, step])]);
                return false;
            }
            setStepErrors((prev) => prev.filter((s) => s !== step));
            return true;
        } catch (error) {
            console.error(`Validation failed for step ${step}:`, error);
            return false;
        }
    };
    // Geocoding function using Nominatim (OpenStreetMap)
    const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
                { headers: { "User-Agent": "KandaClaim/1.0" } } // Required by Nominatim
            );
            const data = await response.json();
            if (data.length > 0) {
                return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
            }
            return null;
        } catch (error) {
            console.error("Geocoding failed:", error);
            return null;
        }
    };


    // Fetch coordinates when accidentLocation changes
    useEffect(() => {
        const fetchCoordinates = async () => {
            const location = form.getValues("accidentLocation");
            if (location) {
                const coords = await geocodeLocation(location);
                setUserLocation(coords);
            } else {
                setUserLocation(null);
            }
        };
        fetchCoordinates();
    }, [form.watch("accidentLocation")]); // Use form.watch for reactivity
    // Save step data
    const saveStep = async () => {
        if (isSaving) return;
        if (!claimId) {
            toast({
                variant: "destructive",
                title: "Claim ID Missing",
                description: "Invalid claim ID.",
            });
            router.push("/dashboard/driver/claims");
            return;
        }
        setIsSaving(true);
        try {
            const currentStepValid = await validateStep(step);
            if (!currentStepValid) {
                toast({
                    variant: "destructive",
                    title: `Step ${step} Invalid`,
                    description: "Please complete all required fields.",
                });
                return;
            }
            const values = form.getValues();

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
                await apiRequest(`${API_URL}claims/${claimId}`, "PUT", data);
            } else if (step === 2) {
                if (values.driver_details?.length) {
                    const driver = values.driver_details[0];
                    const driverData = {
                        user_id: user?.id,
                        has_license: driver.hasLicense,
                        license_number: driver.hasLicense ? (driver.licenseNumber || "") : "",
                        license_category: driver.hasLicense ? (driver.licenseCategory || "") : "",
                        license_issued_date: driver.hasLicense ? (driver.licenseIssuedDate?.toISOString().split("T")[0] || "") : "",
                    };
                    await apiRequest(
                        `${API_URL}claims/${claimId}/driver-details`,
                        driverDetails.length ? "PUT" : "POST",
                        driverData
                    );
                }
                if (values.vehicles?.length) {
                    const vehicle = values.vehicles[0];
                    const vehicleData = {
                        license_plate: vehicle.vehicleLicensePlate,
                        make: vehicle.vehicleMake,
                        model: vehicle.vehicleModel,
                        year: vehicle.vehicleYear,
                        vin: vehicle.vin,
                        user_id: user?.id,
                        tenant_id: user?.tenant_id,
                        claim_id: claimId,
                    };
                    await apiRequest(
                        `${API_URL}vehicles${vehicles.length ? `/${vehicles[0].id}` : ""}`,
                        vehicles.length ? "PUT" : "POST",
                        vehicleData
                    );
                }
            } else if (step === 3) {
                const data = {
                    police_assignments: values.police_assignments?.map((police) => ({
                        police_visited: police.policeVisited,
                        police_station: police.policeStation || "",
                        police_report_number: police.policeReportNumber || "",
                        police_officer_name: police.policeOfficerName || "",
                        police_officer_phone: police.policeOfficerPhone || "",
                    })),
                };
                await apiRequest(
                    `${API_URL}claims/${claimId}/police-assignments`,
                    policeAssignments.length ? "PUT" : "POST",
                    data
                );
            } else if (step === 4) {
                const data = {
                    other_vehicles: values.other_vehicles?.map((vehicle) => ({
                        id: vehicle.id,
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
                // Delete removed vehicles
                const existingIds = otherVehicles.map((v: any) => v.id);
                const newIds = data.other_vehicles?.map((v) => v.id).filter(Boolean) || [];
                const deletedIds = existingIds.filter((id: any) => !newIds.includes(id));
                for (const id of deletedIds) {
                    await apiRequest(`${API_URL}claims/${claimId}/other-vehicles/${id}`, "DELETE");
                }
                // Add or update vehicles
                if (data.other_vehicles?.length) {
                    for (const car of data.other_vehicles) {
                        await apiRequest(
                            `${API_URL}claims/${claimId}/other-vehicles${car.id ? `/${car.id}` : ""}`,
                            car.id ? "PUT" : "POST",
                            car
                        );
                    }
                }
            } else if (step === 5) {
                const dataInjuries = {
                    injuries: values.injuries?.map((injury) => ({
                        id: injury.id,
                        first_name: injury.first_name,
                        last_name: injury.last_name,
                        age: injury.age.toString(),
                        phone: injury.phone,
                        profession: injury.profession,
                        injury_description: injury.injury_description,
                        is_deceased: injury.is_deceased,
                    })),
                };
                // Delete removed injuries
                const existingInjuryIds = injuries.map((i: any) => i.id);
                const newInjuryIds = dataInjuries.injuries?.map((i) => i.id).filter(Boolean) || [];
                const deletedInjuryIds = existingInjuryIds.filter((id: any) => !newInjuryIds.includes(id));
                for (const id of deletedInjuryIds) {
                    await apiRequest(`${API_URL}claims/${claimId}/injuries/${id}`, "DELETE");
                }
                // Add or update injuries
                if (dataInjuries.injuries?.length) {
                    for (const injury of dataInjuries.injuries) {
                        await apiRequest(
                            `${API_URL}claims/${claimId}/injuries${injury.id ? `/${injury.id}` : ""}`,
                            injury.id ? "PUT" : "POST",
                            injury
                        );
                    }
                }
                const dataDamages = {
                    damages: values.damages?.map((damage) => ({
                        id: damage.id,
                        type: damage.type,
                        owner_name: damage.owner_name,
                        description: damage.description,
                    })),
                };
                // Delete removed damages
                const existingDamageIds = damages.map((d: any) => d.id);
                const newDamageIds = dataDamages.damages?.map((d) => d.id).filter(Boolean) || [];
                const deletedDamageIds = existingDamageIds.filter((id: any) => !newDamageIds.includes(id));
                for (const id of deletedDamageIds) {
                    await apiRequest(`${API_URL}claims/${claimId}/damages/${id}`, "DELETE");
                }
                // Add or update damages
                if (dataDamages.damages?.length) {
                    for (const damage of dataDamages.damages) {
                        await apiRequest(
                            `${API_URL}claims/${claimId}/damages${damage.id ? `/${damage.id}` : ""}`,
                            damage.id ? "PUT" : "POST",
                            damage
                        );
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
                // Delete removed garages
                const existingGarageIds = garages.map((g: any) => g.id);
                const newGarageIds = dataGarages.garages?.map((g) => g.id).filter(Boolean) || [];
                const deletedGarageIds = existingGarageIds.filter((id: any) => !newGarageIds.includes(id));
                for (const id of deletedGarageIds) {
                    await apiRequest(`${API_URL}claims/${claimId}/garages/${id}`, "DELETE");
                }
                // Add or update garages
                if (dataGarages.garages?.length) {
                    for (const garage of dataGarages.garages) {
                        await apiRequest(
                            `${API_URL}claims/${claimId}/garages${garage.id ? `/${garage.id}` : ""}`,
                            garage.id ? "PUT" : "POST",
                            garage
                        );
                    }
                }
            } else if (step === 7) {
                const formData = new FormData();
                values.documents?.forEach((doc, index) => {
                    if (doc.file) {
                        formData.append(`documents[${index}][id]`, doc.id || "");
                        formData.append(`documents[${index}][type]`, doc.type);
                        formData.append(`documents[${index}][file]`, doc.file);
                        formData.append(`documents[${index}][claim_id]`, claimId);
                    }
                });
                // Delete removed documents
                const existingDocIds = documents.map((d: any) => d.id);
                const newDocIds = values.documents?.map((d) => d.id).filter(Boolean) || [];
                const deletedDocIds = existingDocIds.filter((id: any) => !newDocIds.includes(id));
                for (const id of deletedDocIds) {
                    await apiRequest(`${API_URL}claims/${claimId}/documents/${id}`, "DELETE");
                }
                // Prompt for no documents
                if (!values.documents?.length) {
                    const confirmSubmit = window.confirm(t("claims.confirm_no_documents")); // Translation: "No documents uploaded. Save anyway?"
                    if (!confirmSubmit) return;
                }
                // Add or update documents
                if (formData.getAll("documents[0][file]").length) {
                    await apiRequest(`${API_URL}claims/${claimId}/documents`, "POST", formData);
                    // Refresh documents after upload
                    const updatedDocuments = await apiRequest(`${API_URL}claims/${claimId}/documents`, "GET");
                    setDocuments(updatedDocuments);
                    const updatedPreviews = {
                        driverLicensePhoto: updatedDocuments.find((d: any) => d.type === "driver_license")?.url || "",
                        vehicleRegistrationPhoto: updatedDocuments.find((d: any) => d.type === "vehicle_registration")?.url || "",
                        accidentScenePhotos: updatedDocuments.filter((d: any) => d.type === "accident_scene").map((d: any) => d.url) || [],
                        vehicleDamagePhotos: updatedDocuments.filter((d: any) => d.type === "vehicle_damage").map((d: any) => d.url) || [],
                        policeReportDoc: updatedDocuments.find((d: any) => d.type === "police_report")?.url || "",
                        witnessStatements: updatedDocuments.filter((d: any) => d.type === "witness_statement").map((d: any) => d.url) || [],
                        otherDocuments: updatedDocuments.filter((d: any) => d.type === "other").map((d: any) => d.url) || [],
                        constatPhotos: updatedDocuments.filter((d: any) => d.type === "constat").map((d: any) => d.url) || [],
                    };
                    setPreviews(updatedPreviews);
                    form.setValue(
                        "documents",
                        updatedDocuments.map((d: any) => ({
                            id: d.id,
                            type: d.type,
                            file: null,
                            url: d.url,
                        }))
                    );
                }
            }

            setCompletedSteps((prev) => [...new Set([...prev, step])]);
            toast({
                title: `Step ${step} Saved`,
                description: `Step ${step} has been successfully updated.`,
            });
        } catch (error: any) {
            console.error(`Error in Step ${step}:`, error);
            toast({
                variant: "destructive",
                title: `Step ${step} Failed`,
                description: error.response?.data?.message || "An error occurred.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Handle file uploads
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach((file) => {
            appendDocument({ type, file, id: "", url: "" });
            const previewUrl = URL.createObjectURL(file);
            setPreviews((prev) => {
                if (type === "driver_license") return { ...prev, driverLicensePhoto: previewUrl };
                if (type === "vehicle_registration") return { ...prev, vehicleRegistrationPhoto: previewUrl };
                if (type === "accident_scene") return { ...prev, accidentScenePhotos: [...prev.accidentScenePhotos, previewUrl] };
                if (type === "vehicle_damage") return { ...prev, vehicleDamagePhotos: [...prev.vehicleDamagePhotos, previewUrl] };
                if (type === "police_report") return { ...prev, policeReportDoc: previewUrl };
                if (type === "witness_statement") return { ...prev, witnessStatements: [...prev.witnessStatements, previewUrl] };
                if (type === "other") return { ...prev, otherDocuments: [...prev.otherDocuments, previewUrl] };
                if (type === "constat") return { ...prev, constatPhotos: [...prev.constatPhotos, previewUrl] };
                return prev;
            });
        });
    };

    // Remove file
    const removeFile = (index: number, type: DocumentType) => {
        const doc = documentFields[index];
        if (doc) {
            if (doc.url && !doc.file) {
                URL.revokeObjectURL(doc.url);
            }
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
                if (type === "constat") {
                    const newPreviews = [...prev.constatPhotos];
                    newPreviews.splice(index, 1);
                    return { ...prev, constatPhotos: newPreviews };
                }
                return prev;
            });
        }
    };

    // Helper to get step status icon (assumed from NewClaimPage)
    const getStepStatusIcon = (stepNumber: number) => {
        if (completedSteps.includes(stepNumber)) {
            return <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>;
        }
        if (stepErrors.includes(stepNumber)) {
            return <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM11 7v4H9V7h2zm0 6v2H9v-2h2z" /></svg>;
        }
        return null;
    }
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
                {
                    name: t("nav.claims"),
                    href: "/dashboard/driver/claims",
                    icon: null,
                    translationKey: "nav.claims",
                },
                {
                    name: t("action.edit_claim"), // Translation: "Edit Claim"
                    href: `/dashboard/driver/claims/edit/${claimId}`,
                    icon: null,
                    translationKey: "action.edit_claim",
                },
            ]}
        >
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold">Kanda Claim - {t("claims.edit")}</h1> {/* Translation: "Edit Claim" */}
                    <p className="text-muted-foreground mt-2">{t("claims.edit_information")}</p> {/* Translation: "Update your claim details." */}
                </div>

                {/* Navigation Bar */}
                <div className="flex flex-col md:flex-row gap-2 md:gap-4">
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
                                            : "bg-muted text-muted-foreground hover:bg-muted/80 border-muted"
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

                {/* Form */}
                <form className="space-y-8">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("claims.basic_info")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="claim_type_id"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>{t("form.claim_type")}</Label>
                                            <Select {...field}>
                                                <option value="">{t("form.select")}</option>
                                                {/* Replace with your claim types */}
                                                <option value="collision">{t("form.collision")}</option>
                                                <option value="theft">{t("form.theft")}</option>
                                            </Select>
                                            {form.formState?.errors?.claim_type_id && (
                                                <p className="text-destructive text-sm">
                                                    {form.formState?.errors?.claim_type_id?.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="policyNumber"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>{t("form.policy_number")}</Label>
                                            <Input {...field} />
                                            {form.formState?.errors?.policyNumber && (
                                                <p className="text-destructive text-sm">
                                                    {form.formState?.errors?.policyNumber?.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>{t("form.amount")}</Label>
                                            <Input type="number" step="0.01" {...field} />
                                            {form.formState?.errors?.amount && (
                                                <p className="text-destructive text-sm">
                                                    {form.formState?.errors?.amount?.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>{t("form.priority")}</Label>
                                            <Select {...field}>
                                                <option value="low">{t("form.low")}</option>
                                                <option value="medium">{t("form.medium")}</option>
                                                <option value="high">{t("form.high")}</option>
                                            </Select>
                                            {form.formState?.errors?.priority && (
                                                <p className="text-destructive text-sm">
                                                    {form.formState?.errors?.priority?.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />

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
                                            {form.formState?.errors?.accidentDate && (
                                                <p className="text-destructive text-sm">
                                                    {form.formState?.errors?.accidentDate?.message}
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="accidentTime"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>{t("form.accident_time")}</Label>
                                            <Input type="time" {...field} />
                                            {form.formState?.errors?.accidentTime && (
                                                <p className="text-destructive text-sm">
                                                    {form.formState?.errors?.accidentTime?.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="accidentLocation"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>{t("form.accident_location")}</Label>
                                            <Input {...field} />
                                            {form.formState?.errors?.accidentLocation && (
                                                <p className="text-destructive text-sm">
                                                    {form.formState?.errors?.accidentLocation?.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="accidentDescription"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>{t("form.accident_description")}</Label>
                                            <textarea className="w-full border rounded p-2" {...field} />
                                            {form.formState?.errors?.accidentDescription && (
                                                <p className="text-destructive text-sm">
                                                    {form.formState?.errors?.accidentDescription?.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="additionalNotes"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>{t("form.additional_notes")}</Label>
                                            <textarea className="w-full border rounded p-2" {...field} />
                                        </div>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Driver and Vehicle Info */}
                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("claims.driver_vehicle_info")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium">{t("form.driver_details")}</h3>
                                    {form.getValues("driver_details").map((_, index) => (
                                        <div key={index} className="space-y-4 border p-4 rounded">
                                            <FormField
                                                control={form.control}
                                                name={`driver_details.${index}.hasLicense`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.has_license")}</Label>
                                                        <input
                                                            type="checkbox"
                                                            checked={field.value}
                                                            onChange={field.onChange}
                                                        />
                                                    </div>
                                                )}
                                            />
                                            {form.getValues(`driver_details.${index}.hasLicense`) && (
                                                <>
                                                    <FormField
                                                        control={form.control}
                                                        name={`driver_details.${index}.licenseNumber`}
                                                        render={({ field }) => (
                                                            <div className="space-y-2">
                                                                <Label>{t("form.license_number")}</Label>
                                                                <Input {...field} />
                                                            </div>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`driver_details.${index}.licenseCategory`}
                                                        render={({ field }) => (
                                                            <div className="space-y-2">
                                                                <Label>{t("form.license_category")}</Label>
                                                                <Input {...field} />
                                                            </div>
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
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium">{t("form.vehicle_details")}</h3>
                                    {form.getValues("vehicles").map((_, index) => (
                                        <div key={index} className="space-y-4 border p-4 rounded">
                                            <FormField
                                                control={form.control}
                                                name={`vehicles.${index}.vehicleLicensePlate`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.vehicle_license_plate")}</Label>
                                                        <Input {...field} />
                                                        {form.formState?.errors?.vehicles?.[index]?.vehicleLicensePlate && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.vehicles[index]?.vehicleLicensePlate?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`vehicles.${index}.vehicleMake`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.vehicle_make")}</Label>
                                                        <Input {...field} />
                                                        {form.formState?.errors?.vehicles?.[index]?.vehicleMake && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.vehicles[index]?.vehicleMake?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`vehicles.${index}.vehicleModel`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.vehicle_model")}</Label>
                                                        <Input {...field} />
                                                        {form.formState?.errors?.vehicles?.[index]?.vehicleModel && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.vehicles[index]?.vehicleModel?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`vehicles.${index}.vehicleYear`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.vehicle_year")}</Label>
                                                        <Input {...field} />
                                                        {form.formState?.errors?.vehicles?.[index]?.vehicleYear && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.vehicles[index]?.vehicleYear?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`vehicles.${index}.vin`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.vin")}</Label>
                                                        <Input {...field} />
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Police Info */}
                    {step === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("claims.police_info")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {policeFields.map((_, index) => (
                                    <div key={index} className="space-y-4 border p-4 rounded">
                                        <FormField
                                            control={form.control}
                                            name={`police_assignments.${index}.policeVisited`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.police_visited")}</Label>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`police_assignments.${index}.policeStation`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.police_station")}</Label>
                                                    <Input {...field} />
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`police_assignments.${index}.policeReportNumber`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.police_report_number")}</Label>
                                                    <Input {...field} />
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`police_assignments.${index}.policeOfficerName`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.police_officer_name")}</Label>
                                                    <Input {...field} />
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`police_assignments.${index}.policeOfficerPhone`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.police_officer_phone")}</Label>
                                                    <Input {...field} />
                                                </div>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => removePoliceAssignment(index)}
                                        >
                                            {t("action.remove")}
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    onClick={() =>
                                        appendPoliceAssignment({
                                            policeVisited: false,
                                            policeStation: "",
                                            policeReportNumber: "",
                                            policeOfficerName: "",
                                            policeOfficerPhone: "",
                                        })
                                    }
                                >
                                    {t("action.add_police_assignment")}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Other Vehicles */}
                    {step === 4 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("claims.other_vehicles")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {otherVehicleFields.map((field, index) => (
                                    <div key={field.id} className="space-y-4 border p-4 rounded">
                                        <FormField
                                            control={form.control}
                                            name={`other_vehicles.${index}.license_plate`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.vehicle_license_plate")}</Label>
                                                    <Input {...field} />
                                                    {form.formState?.errors?.other_vehicles?.[index]?.license_plate && (
                                                        <p className="text-destructive text-sm">
                                                            {form.formState?.errors?.other_vehicles[index]?.license_plate?.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`other_vehicles.${index}.make`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.vehicle_make")}</Label>
                                                    <Input {...field} />
                                                    {form.formState?.errors?.other_vehicles?.[index]?.make && (
                                                        <p className="text-destructive text-sm">
                                                            {form.formState?.errors?.other_vehicles[index]?.make?.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`other_vehicles.${index}.type`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.vehicle_type")}</Label>
                                                    <Input {...field} />
                                                    {form.formState?.errors?.other_vehicles?.[index]?.type && (
                                                        <p className="text-destructive text-sm">
                                                            {form.formState?.errors?.other_vehicles[index]?.type?.toString()}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`other_vehicles.${index}.owner_first_name`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.owner_first_name")}</Label>
                                                    <Input {...field} />
                                                    {form.formState?.errors?.other_vehicles?.[index]?.owner_first_name && (
                                                        <p className="text-destructive text-sm">
                                                            {form.formState?.errors?.other_vehicles[index]?.owner_first_name?.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`other_vehicles.${index}.owner_last_name`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.owner_last_name")}</Label>
                                                    <Input {...field} />
                                                    {form.formState?.errors?.other_vehicles?.[index]?.owner_last_name && (
                                                        <p className="text-destructive text-sm">
                                                            {form.formState?.errors?.other_vehicles[index]?.owner_last_name?.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`other_vehicles.${index}.owner_address`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.owner_address")}</Label>
                                                    <Input {...field} />
                                                    {form.formState?.errors?.other_vehicles?.[index]?.owner_address && (
                                                        <p className="text-destructive text-sm">
                                                            {form.formState?.errors?.other_vehicles[index]?.owner_address?.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`other_vehicles.${index}.insurer_name`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.insurer_name")}</Label>
                                                    <Input {...field} />
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`other_vehicles.${index}.policy_number`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.policy_number")}</Label>
                                                    <Input {...field} />
                                                </div>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => removeOtherVehicle(index)}
                                        >
                                            {t("action.remove")}
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
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
                                    {t("action.add_vehicle")}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 5: Injuries and Damages */}
                    {step === 5 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("claims.injuries_damages")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium">{t("form.injuries")}</h3>
                                    {injuryFields.map((field, index) => (
                                        <div key={field.id} className="space-y-4 border p-4 rounded">
                                            <FormField
                                                control={form.control}
                                                name={`injuries.${index}.first_name`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.first_name")}</Label>
                                                        <Input {...field} />
                                                        {form.formState?.errors?.injuries?.[index]?.first_name && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.injuries[index]?.first_name?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`injuries.${index}.last_name`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.last_name")}</Label>
                                                        <Input {...field} />
                                                        {form.formState?.errors?.injuries?.[index]?.last_name && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.injuries[index]?.last_name?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`injuries.${index}.age`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.age")}</Label>
                                                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                        {form.formState?.errors?.injuries?.[index]?.age && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.injuries[index]?.age?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`injuries.${index}.phone`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.phone")}</Label>
                                                        <Input {...field} />
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`injuries.${index}.profession`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.profession")}</Label>
                                                        <Input {...field} />
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`injuries.${index}.injury_description`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.injury_description")}</Label>
                                                        <textarea className="w-full border rounded p-2" {...field} />
                                                        {form.formState?.errors?.injuries?.[index]?.injury_description && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.injuries[index]?.injury_description?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`injuries.${index}.is_deceased`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.is_deceased")}</Label>
                                                        <input
                                                            type="checkbox"
                                                            checked={field.value}
                                                            onChange={field.onChange}
                                                        />
                                                    </div>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() => removeInjury(index)}
                                            >
                                                {t("action.remove")}
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
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
                                        {t("action.add_injury")}
                                    </Button>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium">{t("form.damages")}</h3>
                                    {damageFields.map((field, index) => (
                                        <div key={field.id} className="space-y-4 border p-4 rounded">
                                            <FormField
                                                control={form.control}
                                                name={`damages.${index}.type`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.damage_type")}</Label>
                                                        <Input {...field} />
                                                        {form.formState?.errors?.damages?.[index]?.type && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.damages[index]?.type?.toString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`damages.${index}.owner_name`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.owner_name")}</Label>
                                                        <Input {...field} />
                                                        {form.formState?.errors?.damages?.[index]?.owner_name && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.damages[index]?.owner_name?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`damages.${index}.description`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>{t("form.damage_description")}</Label>
                                                        <textarea className="w-full border rounded p-2" {...field} />
                                                        {form.formState?.errors?.damages?.[index]?.description && (
                                                            <p className="text-destructive text-sm">
                                                                {form.formState?.errors?.damages[index]?.description?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() => removeDamage(index)}
                                            >
                                                {t("action.remove")}
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            appendDamage({
                                                type: "",
                                                owner_name: "",
                                                description: "",
                                            })
                                        }
                                    >
                                        {t("action.add_damage")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 6: Garage Info */}
                    {step === 6 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("claims.garage_info")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <GarageRecommendations
                                    onSelectGarage={(garage: Garage) =>
                                        appendGarage({
                                            name: garage.name,
                                            address: garage.address,
                                            phone: garage.phone || "",
                                            repair_estimate: 0,
                                        })
                                    }
                                    userLocation={userLocation ?? undefined}
                                />
                                {garageFields.map((field, index) => (
                                    <div key={field.id} className="space-y-4 border p-4 rounded">
                                        <FormField
                                            control={form.control}
                                            name={`garages.${index}.name`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.garage_name")}</Label>
                                                    <Input {...field} />
                                                    {form.formState.errors.garages?.[index]?.name && (
                                                        <p className="text-destructive text-sm">
                                                            {form.formState.errors.garages[index]?.name?.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`garages.${index}.address`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.garage_address")}</Label>
                                                    <Input {...field} />
                                                    {form.formState.errors.garages?.[index]?.address && (
                                                        <p className="text-destructive text-sm">
                                                            {form.formState.errors.garages[index]?.address?.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`garages.${index}.phone`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.garage_phone")}</Label>
                                                    <Input {...field} />
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`garages.${index}.repair_estimate`}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label>{t("form.repair_estimate")}</Label>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => removeGarage(index)}
                                        >
                                            {t("action.remove")}
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    onClick={() =>
                                        appendGarage({
                                            name: "",
                                            address: "",
                                            phone: "",
                                            repair_estimate: 0,
                                        })
                                    }
                                >
                                    {t("action.add_garage")}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 7: Documents and Photos */}
                    {step === 7 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("claims.documents_photos")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { type: "driver_license" as DocumentType, label: t("form.driver_license"), accept: ".jpg,.png,.pdf", multiple: false },
                                    { type: "vehicle_registration" as DocumentType, label: t("form.vehicle_registration"), accept: ".jpg,.png,.pdf", multiple: false },
                                    { type: "accident_scene" as DocumentType, label: t("form.accident_scene"), accept: ".jpg,.png", multiple: true },
                                    { type: "vehicle_damage" as DocumentType, label: t("form.vehicle_damage"), accept: ".jpg,.png", multiple: true },
                                    { type: "police_report" as DocumentType, label: t("form.police_report"), accept: ".pdf,.jpg,.png", multiple: false },
                                    { type: "witness_statement" as DocumentType, label: t("form.witness_statement"), accept: ".pdf,.jpg,.png", multiple: true },
                                    { type: "constat" as DocumentType, label: t("form.constat"), accept: ".pdf,.jpg,.png", multiple: true }, // Rwanda-specific
                                    { type: "other" as DocumentType, label: t("form.other"), accept: ".pdf,.jpg,.png", multiple: true },
                                ].map((doc) => (
                                    <div key={doc.type} className="space-y-2">
                                        <Label>{doc.label}</Label>
                                        <Input
                                            type="file"
                                            accept={doc.accept}
                                            multiple={doc.multiple}
                                            onChange={(e) => handleFileChange(e, doc.type)}
                                        />
                                        {previews[doc.type as keyof Previews] && (
                                            <div className="flex flex-wrap gap-2">
                                                {doc.multiple ? (
                                                    // Array fields: map over string[]
                                                    (previews[doc.type as keyof Previews] as string[]).map((url, idx) => (
                                                        url && (
                                                            <div key={idx} className="relative">
                                                                <img src={url} alt={doc.label} className="h-20 w-20 object-cover" />
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="absolute top-0 right-0"
                                                                    onClick={() => {
                                                                        const docIndex = documentFields.findIndex(
                                                                            (d) => d.type === doc.type && (d.url === url || d.file)
                                                                        );
                                                                        if (docIndex !== -1) removeFile(docIndex, doc.type);
                                                                    }}
                                                                >
                                                                    X
                                                                </Button>
                                                            </div>
                                                        )
                                                    ))
                                                ) : (
                                                    // Single-string fields: render directly
                                                    (previews[doc.type as keyof Previews] as string) && (
                                                        <div className="relative">
                                                            <img
                                                                src={previews[doc.type as keyof Previews] as string}
                                                                alt={doc.label}
                                                                className="h-20 w-20 object-cover"
                                                            />
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="absolute top-0 right-0"
                                                                onClick={() => {
                                                                    const docIndex = documentFields.findIndex(
                                                                        (d) => d.type === doc.type && (d.url === previews[doc.type as keyof Previews] || d.file)
                                                                    );
                                                                    if (docIndex !== -1) removeFile(docIndex, doc.type);
                                                                }}
                                                            >
                                                                X
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/dashboard/driver/claims")}
                            className="mx-6"
                        >
                            {t("action.back")} {/* Translation: "Back to Claims" */}
                        </Button>
                        <Button
                            type="button"
                            onClick={saveStep}
                            disabled={isSaving}
                            className="mx-6"
                        >
                            {isSaving ? t("action.saving") : t("action.save_changes")} {/* Translation: "Save Changes" */}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}