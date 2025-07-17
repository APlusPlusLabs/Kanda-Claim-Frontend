'use client';

import { toast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Car, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-provider';
import { useLanguage } from '@/lib/language-context';
import { GarageRecommendations } from '@/components/garage-recommendations';
import { useParams } from 'next/navigation';
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL+"storage/";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ACCEPTED_DOC_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

type DocumentType =
    | 'driver_license'
    | 'vehicle_registration'
    | 'accident_scene'
    | 'vehicle_damage'
    | 'police_report'
    | 'witness_statement'
    | 'constat'
    | 'other';

interface Garage {
    id: number;
    name: string;
    address: string;
    phone?: string;
    distance?: number;
    rating?: number;
    specializations?: string[];
    openHours?: string;
    description?: string;
    repair_estimate?: number;
}

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

const formSchema = z.object({
    claim_type_id: z.string().min(1, { message: 'Required' }),
    policyNumber: z.string().min(1, { message: 'Required' }),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: 'Invalid amount' }),
    priority: z.enum(['low', 'medium', 'high']),
    accidentDate: z.date(),
    accidentTime: z.string().min(1, { message: 'Required' }),
    accidentLocation: z.string().min(1, { message: 'Required' }),
    accidentDescription: z.string().min(1, { message: 'Required' }),
    additionalNotes: z.string().optional(),
    driver_details: z.array(
        z.object({
            id: z.string().optional(),
            hasLicense: z.boolean(),
            licenseNumber: z.string().optional(),
            licenseCategory: z.string().optional(),
            licenseIssuedDate: z.date().optional(),
        })
    ),
    vehicles: z.array(
        z.object({
            id: z.string().optional(),
            vehicleLicensePlate: z.string().min(1, { message: 'Required' }),
            vehicleMake: z.string().min(1, { message: 'Required' }),
            vehicleModel: z.string().min(1, { message: 'Required' }),
            vehicleYear: z.string().regex(/^\d{4}$/, { message: 'Invalid year' }),
            vin: z.string().optional(),
        })
    ),
    police_assignments: z.array(
        z.object({
            id: z.string(),
            policeVisited: z.boolean().optional(),
            policeStation: z.string().optional(),
            policeReportNumber: z.string().optional(),
            policeOfficerName: z.string().optional(),
            policeOfficerPhone: z.string().optional(),
        })
    ).optional(),
    other_vehicles: z.array(
        z.object({
            id: z.string().optional(),
            license_plate: z.string().min(1, { message: 'Required' }),
            make: z.string().min(1, { message: 'Required' }),
            type: z.string().min(1, { message: 'Required' }),
            owner_first_name: z.string().min(1, { message: 'Required' }),
            owner_last_name: z.string().min(1, { message: 'Required' }),
            owner_address: z.string().min(1, { message: 'Required' }),
            insurer_name: z.string().optional(),
            policy_number: z.string().optional(),
        })
    ).optional(),
    injuries: z.array(
        z.object({
            id: z.string().optional(),
            first_name: z.string().min(1, { message: 'Required' }),
            last_name: z.string().min(1, { message: 'Required' }),
            age: z.number().min(0, { message: 'Invalid age' }),
            phone: z.string().optional(),
            profession: z.string().optional(),
            injury_description: z.string().min(1, { message: 'Required' }),
            is_deceased: z.boolean(),
        })
    ).optional(),
    damages: z.array(
        z.object({
            id: z.string().optional(),
            type: z.string().min(1, { message: 'Required' }),
            owner_name: z.string().min(1, { message: 'Required' }),
            description: z.string().min(1, { message: 'Required' }),
        })
    ).optional(),
    garages: z
        .array(
            z.object({
                id: z.string().optional(),
                name: z.string().min(1, 'Required'),
                address: z.string().min(1, 'Required'),
                phone: z.string().optional(),
                repair_estimate: z.number().optional(),
                distance: z.number().optional(),
            })
        )
        .optional(),
    documents: z
        .array(
            z.object({
                id: z.string().optional(),
                type: z.enum([
                    'driver_license',
                    'vehicle_registration',
                    'accident_scene',
                    'vehicle_damage',
                    'police_report',
                    'witness_statement',
                    'constat',
                    'other',
                ]),
                file: z.any().optional(),
                url: z.string().optional(),
            })
        )
        .optional(),
});

const ErrorFallback = ({ error }: { error: Error }) => (
    <div className="p-4 text-red-500">
        <h2>Something went wrong:</h2>
        <pre>{error.message}</pre>
    </div>
);

export default function EditClaimPage() {
    const router = useRouter();
    const params = useParams();
    const claimId = params.id as string;
    //   const { id: claimId } = router.query;
    const { t } = useLanguage();
    const { user, apiRequest } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            claim_type_id: '',
            policyNumber: '',
            amount: '0',
            priority: 'medium',
            accidentDate: undefined,
            accidentTime: '',
            accidentLocation: '',
            accidentDescription: '',
            additionalNotes: '',
            driver_details: [{ hasLicense: true, licenseNumber: '', licenseCategory: '', licenseIssuedDate: undefined }],
            vehicles: [{ vehicleLicensePlate: '', vehicleMake: '', vehicleModel: '', vehicleYear: '', vin: '' }],
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
        name: 'police_assignments',
    });
    const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
        control: form.control,
        name: 'documents',
    });
    const { fields: otherVehicleFields, append: appendOtherVehicle, remove: removeOtherVehicle } = useFieldArray({
        control: form.control,
        name: 'other_vehicles',
    });
    const { fields: injuryFields, append: appendInjury, remove: removeInjury } = useFieldArray({
        control: form.control,
        name: 'injuries',
    });
    const { fields: damageFields, append: appendDamage, remove: removeDamage } = useFieldArray({
        control: form.control,
        name: 'damages',
    });
    const { fields: garageFields, append: appendGarage, remove: removeGarage } = useFieldArray({
        control: form.control,
        name: 'garages',
    });

    const [step, setStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [stepErrors, setStepErrors] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [previews, setPreviews] = useState<Previews>({
        driverLicensePhoto: '',
        vehicleRegistrationPhoto: '',
        accidentScenePhotos: [],
        vehicleDamagePhotos: [],
        policeReportDoc: '',
        witnessStatements: [],
        otherDocuments: [],
        constatPhotos: [],
    });
    const [driverDetails, setDriverDetails] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [policeAssignments, setPoliceAssignments] = useState<any[]>([]);
    const [otherVehicles, setOtherVehicles] = useState<any[]>([]);
    const [injuries, setInjuries] = useState<any[]>([]);
    const [damages, setDamages] = useState<any[]>([]);
    const [garages, setGarages] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);

    const [claimTypes, setClaimTypes] = useState<{ id: string; name: string }[]>([]);
    const [claimTypeId, setClaimTypeId] = useState<string>();
    useEffect(() => {

        const fetchClaimData = async () => {

            if (!claimId || typeof claimId !== 'string' || !user) return;

            // first claim typs
            try {
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

            try {
                const claimResponse = await apiRequest(`${API_URL}claims/${claimId}`, 'GET');
                const claim = claimResponse.data
                setClaimTypeId(claim.claim_type_id)
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
                    apiRequest(`${API_URL}claims/${claimId}/driver-details`, 'GET'),
                    apiRequest(`${API_URL}vehicles?claim_id=${claimId}`, 'GET'),
                    apiRequest(`${API_URL}claims/${claimId}/police-assignments`, 'GET'),
                    apiRequest(`${API_URL}claims/${claimId}/other-vehicles`, 'GET'),
                    apiRequest(`${API_URL}claims/${claimId}/injuries`, 'GET'),
                    apiRequest(`${API_URL}claims/${claimId}/damages`, 'GET'),
                    apiRequest(`${API_URL}claims/${claimId}/garages`, 'GET'),
                    apiRequest(`${API_URL}claims/${claimId}/documents`, 'GET'),
                ]);

                setDriverDetails(driverDetailsRes || []);
                setVehicles(vehiclesRes || []);
                setPoliceAssignments(policeAssignmentsRes || []);
                setOtherVehicles(otherVehiclesRes || []);
                setInjuries(injuriesRes || []);
                setDamages(damagesRes || []);
                setGarages(garagesRes || []);
                setDocuments(documentsRes || []);

                const formData = {
                    claim_type_id: claim.claim_type_id + '' || '',
                    policyNumber: claim.policy_number || '',
                    amount: claim.amount?.toString() || '0',
                    priority: claim.priority || 'medium',
                    accidentDate: claim.accident_date ? new Date(claim.accident_date) : undefined,
                    accidentTime: claim.accident_time || '',
                    accidentLocation: claim.location || '',
                    accidentDescription: claim.description || '',
                    additionalNotes: claim.note || '',
                    driver_details: driverDetailsRes.length
                        ? driverDetailsRes.map((d: any) => ({
                            id: d.id,
                            hasLicense: d.has_license,
                            licenseNumber: d.license_number || '',
                            licenseCategory: d.license_category || '',
                            licenseIssuedDate: d.license_issued_date ? new Date(d.license_issued_date) : undefined,
                        }))
                        : [{ hasLicense: true, licenseNumber: '', licenseCategory: '', licenseIssuedDate: undefined }],
                    vehicles: vehiclesRes.length
                        ? vehiclesRes.map((v: any) => ({
                            id: v.id,
                            vehicleLicensePlate: v.license_plate || '',
                            vehicleMake: v.make || '',
                            vehicleModel: v.model || '',
                            vehicleYear: v.year?.toString() || '',
                            vin: v.vin || '',
                        }))
                        : [{ vehicleLicensePlate: '', vehicleMake: '', vehicleModel: '', vehicleYear: '', vin: '' }],
                    police_assignments: policeAssignmentsRes.length
                        ? policeAssignmentsRes.map((p: any) => ({
                            id: p.id,
                            policeVisited: p.police_visited || true,
                            policeStation: p.police_station || '',
                            policeReportNumber: p.police_report_number || '',
                            policeOfficerName: p.police_officer_name || '',
                            policeOfficerPhone: p.police_officer_phone || '',
                        }))
                        : [],
                    other_vehicles: otherVehiclesRes.length
                        ? otherVehiclesRes.map((v: any) => ({
                            id: v.id,
                            license_plate: v.license_plate || '',
                            make: v.make || '',
                            type: v.type || '',
                            owner_first_name: v.owner_first_name || '',
                            owner_last_name: v.owner_last_name || '',
                            owner_address: v.owner_address || '',
                            insurer_name: v.insurer_name || '',
                            policy_number: v.policy_number || '',
                        }))
                        : [],
                    injuries: injuriesRes.length
                        ? injuriesRes.map((i: any) => ({
                            id: i.id,
                            first_name: i.first_name || '',
                            last_name: i.last_name || '',
                            age: i.age ? Number(i.age) : 0,
                            phone: i.phone || '',
                            profession: i.profession || '',
                            injury_description: i.injury_description || '',
                            is_deceased: i.is_deceased || false,
                        }))
                        : [],
                    damages: damagesRes.length
                        ? damagesRes.map((d: any) => ({
                            id: d.id,
                            type: d.type || '',
                            owner_name: d.owner_name || '',
                            description: d.description || '',
                        }))
                        : [],
                    garages: garagesRes.length
                        ? garagesRes.map((g: any) => ({
                            id: g.id,
                            name: g.name || '',
                            address: g.address || '',
                            phone: g.phone || '',
                            repair_estimate: g.repair_estimate ? Number(g.repair_estimate) : undefined,
                            distance: g.distance ? Number(g.distance) : undefined,
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

                form.reset(formData);

                setPreviews({
                    driverLicensePhoto: documentsRes.find((d: any) => d.type === 'driver_license')?.url || '',
                    vehicleRegistrationPhoto: documentsRes.find((d: any) => d.type === 'vehicle_registration')?.url || '',
                    accidentScenePhotos: documentsRes.filter((d: any) => d.type === 'accident_scene').map((d: any) => d.url) || [],
                    vehicleDamagePhotos: documentsRes.filter((d: any) => d.type === 'vehicle_damage').map((d: any) => d.url) || [],
                    policeReportDoc: documentsRes.find((d: any) => d.type === 'police_report')?.url || '',
                    witnessStatements: documentsRes.filter((d: any) => d.type === 'witness_statement').map((d: any) => d.url) || [],
                    otherDocuments: documentsRes.filter((d: any) => d.type === 'other').map((d: any) => d.url) || [],
                    constatPhotos: documentsRes.filter((d: any) => d.type === 'constat').map((d: any) => d.url) || [],
                });
                // form.reset({
                //     claim_type_id: claim.claim_type_id?.toString() || '',
                // });
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
                    variant: 'destructive',
                    title: 'Failed to Load Claim',
                    description: error.response?.data?.message || 'An error occurred while fetching claim data.',
                });
                router.push('/dashboard/driver/claims');
            }
        };

        fetchClaimData();

    }, [user, claimId, form, router, apiRequest]);

    const validateStep = async (step: number) => {
        const fieldsToValidate: Record<number, (keyof z.infer<typeof formSchema>)[]> = {
            1: [
                'claim_type_id',
                'policyNumber',
                'amount',
                'priority',
                'accidentDate',
                'accidentTime',
                'accidentLocation',
                'accidentDescription',
            ],
            2: ['driver_details', 'vehicles'],
            3: ['police_assignments'],
            4: ['other_vehicles'],
            5: ['injuries', 'damages'],
            6: ['garages'],
            7: ['documents'],
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

    const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
                { headers: { 'User-Agent': 'KandaClaim/1.0' } }
            );
            const data = await response.json();
            if (data.length > 0) {
                return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
            }
            return null;
        } catch (error) {
            console.error('Geocoding failed:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchCoordinates = async () => {
            const location = form.getValues('accidentLocation');
            if (location) {
                const coords = await geocodeLocation(location);
                setUserLocation(coords);
            } else {
                setUserLocation(null);
            }
        };
        fetchCoordinates();
    }, [form]);

    const saveStep = async () => {
        if (isSaving) return;
        if (!claimId || typeof claimId !== 'string') {
            toast({
                variant: 'destructive',
                title: 'Claim ID Missing',
                description: 'Invalid claim ID.',
            });
            router.push('/dashboard/driver/claims');
            return;
        }
        setIsSaving(true);
        try {
            const currentStepValid = await validateStep(step);
            if (!currentStepValid) {
                toast({
                    variant: 'destructive',
                    title: `Step ${step} Invalid`,
                    description: 'Please complete all required fields.',
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
                    accident_date: values.accidentDate.toISOString().split('T')[0],
                    accident_time: values.accidentTime,
                    location: values.accidentLocation,
                    description: values.accidentDescription,
                    note: values.additionalNotes || '',
                    tenant_id: user?.tenant_id,
                    role_id: user?.role_id,
                    user_id: user?.id,
                };
                await apiRequest(`${API_URL}claims/${claimId}`, 'PUT', data);
            } else if (step === 2) {
                if (values.driver_details?.length) {
                    const drivers = values.driver_details;
                    drivers.map(async driver => {
                        const driverData = {
                            user_id: user?.id, id: driver.id,
                            has_license: driver.hasLicense,
                            license_number: driver.hasLicense ? (driver.licenseNumber || '') : '',
                            license_category: driver.hasLicense ? (driver.licenseCategory || '') : '',
                            license_issued_date: driver.hasLicense ? (driver.licenseIssuedDate?.toISOString().split('T')[0] || '') : '',
                        };
                        await apiRequest(`${API_URL}claims/${claimId}/driver-details/${driver.id}`, 'PUT', driverData);
                    })
                }
                if (values.vehicles?.length) {
                    const vehicles = values.vehicles;
                    vehicles.map(async vehicle => {
                        const vehicleData = {
                            id: vehicle.id,
                            license_plate: vehicle.vehicleLicensePlate,
                            make: vehicle.vehicleMake,
                            model: vehicle.vehicleModel,
                            year: Number(vehicle.vehicleYear),
                            vin: vehicle.vin,
                            user_id: user?.id,
                            tenant_id: user?.tenant_id,
                            claim_id: claimId,
                        };
                        await apiRequest(
                            `${API_URL}vehicles/${vehicle.id}`, 'PUT', vehicleData);
                    })
                }
            } else if (step === 3) {
                const policedata = {
                    police_assignments: values.police_assignments?.map((police) => ({

                        id: police.id,
                        police_visited: police.policeVisited,
                        police_station: police.policeStation || '',
                        police_report_number: police.policeReportNumber || '',
                        police_officer_name: police.policeOfficerName || '',
                        police_officer_phone: police.policeOfficerPhone || ''
                    })
                    )
                    //await apiRequest(`${API_URL}claims/${claimId}/police-assignments/${police.id}`, 'PUT', pdata);
                }
                const existingIds = policedata?.police_assignments?.map((v: any) => v.id);
                const newIds = policedata?.police_assignments?.map((v) => v.id).filter(Boolean) || [];
                const deletedIds = existingIds?.filter((id: any) => !newIds.includes(id));
                if (deletedIds) {
                    for (const id of deletedIds) {
                        await apiRequest(`${API_URL}claims/${claimId}/police-assignments/${id}`, 'DELETE');
                    }
                }
                if (policedata?.police_assignments?.length) {
                    for (const police of policedata.police_assignments) {
                        await apiRequest(
                            `${API_URL}claims/${claimId}/police-assignments${police.id ? `/${police.id}` : ''}`,
                            police.id ? 'PUT' : 'POST',
                            police
                        );
                    }
                }


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
                const existingIds = otherVehicles.map((v: any) => v.id);
                const newIds = data.other_vehicles?.map((v) => v.id).filter(Boolean) || [];
                const deletedIds = existingIds.filter((id: any) => !newIds.includes(id));
                for (const id of deletedIds) {
                    await apiRequest(`${API_URL}claims/${claimId}/other-vehicles/${id}`, 'DELETE');
                }
                if (data.other_vehicles?.length) {
                    for (const car of data.other_vehicles) {
                        await apiRequest(
                            `${API_URL}claims/${claimId}/other-vehicles${car.id ? `/${car.id}` : ''}`,
                            car.id ? 'PUT' : 'POST',
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
                const existingInjuryIds = injuries.map((i: any) => i.id);
                const newInjuryIds = dataInjuries.injuries?.map((i) => i.id).filter(Boolean) || [];
                const deletedInjuryIds = existingInjuryIds.filter((id: any) => !newInjuryIds.includes(id));
                for (const id of deletedInjuryIds) {
                    await apiRequest(`${API_URL}claims/${claimId}/injuries/${id}`, 'DELETE');
                }
                if (dataInjuries.injuries?.length) {
                    for (const injury of dataInjuries.injuries) {
                        await apiRequest(
                            `${API_URL}claims/${claimId}/injuries${injury.id ? `/${injury.id}` : ''}`,
                            injury.id ? 'PUT' : 'POST',
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
                const existingDamageIds = damages.map((d: any) => d.id);
                const newDamageIds = dataDamages.damages?.map((d) => d.id).filter(Boolean) || [];
                const deletedDamageIds = existingDamageIds.filter((id: any) => !newDamageIds.includes(id));
                for (const id of deletedDamageIds) {
                    await apiRequest(`${API_URL}claims/${claimId}/damages/${id}`, 'DELETE');
                }
                if (dataDamages.damages?.length) {
                    for (const damage of dataDamages.damages) {
                        await apiRequest(
                            `${API_URL}claims/${claimId}/damages${damage.id ? `/${damage.id}` : ''}`,
                            damage.id ? 'PUT' : 'POST',
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
                        phone: garage.phone || '',
                        repair_estimate: garage.repair_estimate?.toString() || '',
                        distance: garage.distance?.toString() || '',
                    })),
                };
                const existingGarageIds = garages.map((g: any) => g.id);
                const newGarageIds = dataGarages.garages?.map((g) => g.id).filter(Boolean) || [];
                const deletedGarageIds = existingGarageIds.filter((id: any) => !newGarageIds.includes(id));
                for (const id of deletedGarageIds) {
                    await apiRequest(`${API_URL}claims/${claimId}/garages/${id}`, 'DELETE');
                }
                if (dataGarages.garages?.length) {
                    for (const garage of dataGarages.garages) {
                        await apiRequest(
                            `${API_URL}claims/${claimId}/garages${garage.id ? `/${garage.id}` : ''}`,
                            garage.id ? 'PUT' : 'POST',
                            garage
                        );
                    }
                }
            } else if (step === 7) {
                values.documents?.forEach(async (doc, index) => {
                    if (doc.file) {
                        const formData = new FormData();
                        formData.append('id', doc.id || '');
                        formData.append('type', doc.type);
                        formData.append('file', doc.file);
                        formData.append('claim_id', claimId);

                        // const existingDocIds = documents.map((d: any) => d.id);
                        // const newDocIds = values.documents?.map((d) => d.id).filter(Boolean) || [];
                        // const deletedDocIds = existingDocIds.filter((id: any) => !newDocIds.includes(id));
                        // for (const id of deletedDocIds) {
                        //     await apiRequest(`${API_URL}claims/${claimId}/documents/${id}`, 'DELETE');
                        // }
                        // if (!values.documents?.length) {
                        //     const confirmSubmit = window.confirm(t('claims.confirm_no_documents'));
                        //     if (!confirmSubmit) return;
                        // }
                        //   if (formData.getAll('documents[0][file]').length) {
                        await apiRequest(`${API_URL}claims/${claimId}/documents`, 'POST', formData);
                        const updatedDocuments = await apiRequest(`${API_URL}claims/${claimId}/documents`, 'GET');
                        setDocuments(updatedDocuments);
                        const updatedPreviews = {
                            driverLicensePhoto: updatedDocuments.find((d: any) => d.type === 'driver_license')?.url || '',
                            vehicleRegistrationPhoto: updatedDocuments.find((d: any) => d.type === 'vehicle_registration')?.url || '',
                            accidentScenePhotos: updatedDocuments.filter((d: any) => d.type === 'accident_scene').map((d: any) => d.url) || [],
                            vehicleDamagePhotos: updatedDocuments.filter((d: any) => d.type === 'vehicle_damage').map((d: any) => d.url) || [],
                            policeReportDoc: updatedDocuments.find((d: any) => d.type === 'police_report')?.url || '',
                            witnessStatements: updatedDocuments.filter((d: any) => d.type === 'witness_statement').map((d: any) => d.url) || [],
                            otherDocuments: updatedDocuments.filter((d: any) => d.type === 'other').map((d: any) => d.url) || [],
                            constatPhotos: updatedDocuments.filter((d: any) => d.type === 'constat').map((d: any) => d.url) || [],
                        };
                        setPreviews(updatedPreviews);
                        form.setValue(
                            'documents',
                            updatedDocuments.map((d: any) => ({
                                id: d.id,
                                type: d.type,
                                file: null,
                                url: d.url,
                            }))
                        );
                        //   }
                    }
                });

            }

            setCompletedSteps((prev) => [...new Set([...prev, step])]);
            toast({
                title: `Step ${step} Saved`,
                description: `Step ${step} has been successfully updated.`,
            });
            setStep(step + 1);
        } catch (error: any) {
            console.error(`Error in Step ${step}: `, error);
            toast({
                variant: 'destructive',
                title: `Step ${step} Failed`,
                description: error.response?.data?.message || 'An error occurred.',
            });
        } finally {
            setIsSaving(false);
        }
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
                });
                return;
            }
            if (
                !ACCEPTED_IMAGE_TYPES.includes(file.type) &&
                !ACCEPTED_DOC_TYPES.includes(file.type) &&
                (type === 'accident_scene' || type === 'vehicle_damage' || type === 'constat')
            ) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid File Type',
                    description: 'Only images or PDFs are allowed for this document type.',
                });
                return;
            }
            appendDocument({ type, file, id: '', url: '' });
            const previewUrl = URL.createObjectURL(file);
            setPreviews((prev) => {
                if (type === 'driver_license') return { ...prev, driverLicensePhoto: previewUrl };
                if (type === 'vehicle_registration') return { ...prev, vehicleRegistrationPhoto: previewUrl };
                if (type === 'accident_scene') return { ...prev, accidentScenePhotos: [...prev.accidentScenePhotos, previewUrl] };
                if (type === 'vehicle_damage') return { ...prev, vehicleDamagePhotos: [...prev.vehicleDamagePhotos, previewUrl] };
                if (type === 'police_report') return { ...prev, policeReportDoc: previewUrl };
                if (type === 'witness_statement') return { ...prev, witnessStatements: [...prev.witnessStatements, previewUrl] };
                if (type === 'other') return { ...prev, otherDocuments: [...prev.otherDocuments, previewUrl] };
                if (type === 'constat') return { ...prev, constatPhotos: [...prev.constatPhotos, previewUrl] };
                return prev;
            });
        });
    };

    const removeFile = (index: number, type: DocumentType) => {
        const doc = documentFields[index];
        if (doc) {
            if (doc.url && !doc.file) {
                URL.revokeObjectURL(doc.url);
            }
            removeDocument(index);
            setPreviews((prev) => {
                if (type === 'driver_license') return { ...prev, driverLicensePhoto: '' };
                if (type === 'vehicle_registration') return { ...prev, vehicleRegistrationPhoto: '' };
                if (type === 'accident_scene') {
                    const newPreviews = [...prev.accidentScenePhotos];
                    newPreviews.splice(index, 1);
                    return { ...prev, accidentScenePhotos: newPreviews };
                }
                if (type === 'vehicle_damage') {
                    const newPreviews = [...prev.vehicleDamagePhotos];
                    newPreviews.splice(index, 1);
                    return { ...prev, vehicleDamagePhotos: newPreviews };
                }
                if (type === 'police_report') return { ...prev, policeReportDoc: '' };
                if (type === 'witness_statement') {
                    const newPreviews = [...prev.witnessStatements];
                    newPreviews.splice(index, 1);
                    return { ...prev, witnessStatements: newPreviews };
                }
                if (type === 'other') {
                    const newPreviews = [...prev.otherDocuments];
                    newPreviews.splice(index, 1);
                    return { ...prev, otherDocuments: newPreviews };
                }
                if (type === 'constat') {
                    const newPreviews = [...prev.constatPhotos];
                    newPreviews.splice(index, 1);
                    return { ...prev, constatPhotos: newPreviews };
                }
                return prev;
            });
        }
    };

    const getStepStatusIcon = (stepNumber: number) => {
        if (completedSteps.includes(stepNumber)) {
            return (
                <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
            );
        }
        if (stepErrors.includes(stepNumber)) {
            return (
                <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM11 7v4H9V7h2zm0 6v2H9v-2h2z" />
                </svg>
            );
        }
        return null;
    };

    useEffect(() => {
        if (step === 6) {
            console.log('Form context in Step 6:', form.control);
        }
    }, [step, form.control]);

    return (
            <DashboardLayout
                user={{ name: user?.name || 'Driver', role: 'Driver', avatar: '/placeholder.svg' }}
                navigation={[
                    { name: "Dashboard", href: "/dashboard/driver", icon: <Car className="h-5 w-5" /> },
                    { name: "My Claims", href: "/dashboard/driver/claims", icon: <FileText className="h-5 w-5" /> },
                ]}
            >
                <div className="container mx-auto p-4">
                    <h1 className="text-3xl font-bold mb-4">{t('claims.edit_title')}</h1>
                    <div className="mb-8">
                        <div className="flex justify-between">
                            {[1, 2, 3, 4, 5, 6, 7].map((stepNumber) => (
                                <Button
                                    key={stepNumber}
                                    variant={step === stepNumber ? 'default' : 'outline'}
                                    onClick={() => setStep(stepNumber)}
                                    className="flex items-center space-x-2"
                                >
                                    <span>Step {stepNumber}</span>
                                    {getStepStatusIcon(stepNumber)}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(saveStep)} className="space-y-8">
                            {step === 1 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('claims.accident_details')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="claim_type_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('form.claim_type')}</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={claimTypeId?.toString() || field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select claim type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>{claimTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
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
                                                        <FormLabel>{t('form.policy_number')}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="amount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('form.amount')}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="number" step="0.01" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="priority"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('form.priority')}</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select priority" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="low">Low</SelectItem>
                                                                <SelectItem value="medium">Medium</SelectItem>
                                                                <SelectItem value="high">High</SelectItem>
                                                            </SelectContent>
                                                        </Select>
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
                                                        <FormLabel>{t('form.accident_date')}</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={cn(
                                                                            'w-[240px] pl-3 text-left font-normal',
                                                                            !field.value && 'text-muted-foreground'
                                                                        )}
                                                                    >
                                                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value}
                                                                    onSelect={field.onChange}
                                                                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
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
                                                        <FormLabel>{t('form.accident_time')}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="time" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="accidentLocation"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('form.accident_location')}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
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
                                                        <FormLabel>{t('form.accident_description')}</FormLabel>
                                                        <FormControl>
                                                            <Textarea {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="additionalNotes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('form.additional_notes')}</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} />
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
                                        <CardTitle>{t('claims.driver_vehicle_details')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {form.getValues('driver_details')?.map((driver, index) => (
                                            <div key={index} className="space-y-4 border p-4 rounded">
                                                <FormField
                                                    control={form.control}
                                                    name={`driver_details.${index}.hasLicense`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t('form.has_license')}</FormLabel>
                                                            <FormControl>
                                                                <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value.toString()}>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="true">Yes</SelectItem>
                                                                        <SelectItem value="false">No</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {form.getValues(`driver_details.${index}.hasLicense`) && (
                                                    <>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <FormField
                                                                control={form.control}
                                                                name={`driver_details.${index}.licenseNumber`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>{t('form.license_number')}</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name={`driver_details.${index}.licenseCategory`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>{t('form.license_category')}</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name={`driver_details.${index}.licenseIssuedDate`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-col">
                                                                        <FormLabel>{t('form.license_issued_date')}</FormLabel>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <FormControl>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        className={cn(
                                                                                            'w-[240px] pl-3 text-left font-normal',
                                                                                            !field.value && 'text-muted-foreground'
                                                                                        )}
                                                                                    >
                                                                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                                    </Button>
                                                                                </FormControl>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={field.value}
                                                                                    onSelect={field.onChange}
                                                                                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                                                    initialFocus
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            /></div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                        {form.getValues('vehicles')?.map((vehicle, index) => (
                                            <div key={index} className="space-y-4 border p-4 rounded">

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`vehicles.${index}.vehicleLicensePlate`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.vehicle_license_plate')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`vehicles.${index}.vehicleMake`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.vehicle_make')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`vehicles.${index}.vehicleModel`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.vehicle_model')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
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
                                                                <FormLabel>{t('form.vehicle_year')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} type="number" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`vehicles.${index}.vin`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.vin')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                            {step === 3 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('form.police_report_info')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {policeFields.map((field, index) => (
                                            <div key={field.id} className="space-y-4 border p-4 rounded">
                                                <FormField
                                                    control={form.control}
                                                    name={`police_assignments.${index}.policeVisited`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t('form.police_visited')}</FormLabel>
                                                            <FormControl>
                                                                <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value?.toString()}>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="true">Yes</SelectItem>
                                                                        <SelectItem value="false">No</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {form.getValues(`police_assignments.${index}.policeVisited`) && (
                                                    <>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <FormField
                                                                control={form.control}
                                                                name={`police_assignments.${index}.policeStation`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>{t('form.police_station')}</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...field} />
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
                                                                        <FormLabel>{t('form.police_report_number')}</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...field} />
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
                                                                        <FormLabel>{t('form.officer_name')}</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...field} />
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
                                                                        <FormLabel>{t('form.officer_phone')}</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => removePoliceAssignment(index)}
                                                >
                                                    {t('action.remove')}
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                appendPoliceAssignment({
                                                    id: '',
                                                    policeVisited: false,
                                                    policeStation: '',
                                                    policeReportNumber: '',
                                                    policeOfficerName: '',
                                                    policeOfficerPhone: '',
                                                })
                                            }
                                        >
                                            {t('form.add_police_assignment')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                            {/* Steps 4–7 */}
                            {step === 4 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('claims.other_vehicles')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {otherVehicleFields.map((field, index) => (
                                            <div key={field.id} className="space-y-4 border p-4 rounded">

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`other_vehicles.${index}.license_plate`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.plate_number')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
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
                                                                <FormLabel>{t('form.vehicle_make')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`other_vehicles.${index}.type`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.type')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`other_vehicles.${index}.owner_first_name`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.owner_name')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`other_vehicles.${index}.owner_last_name`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.owner_surname')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`other_vehicles.${index}.owner_address`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.owner_address')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`other_vehicles.${index}.insurer_name`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.insurer_name')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
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
                                                                <FormLabel>{t('form.policy_number')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => removeOtherVehicle(index)}
                                                >
                                                    {t('action.remove')}
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                appendOtherVehicle({
                                                    license_plate: '',
                                                    make: '',
                                                    type: '',
                                                    owner_first_name: '',
                                                    owner_last_name: '',
                                                    owner_address: '',
                                                    insurer_name: '',
                                                    policy_number: '',
                                                })
                                            }
                                        >
                                            {t('form.add_vehicle')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                            {step === 5 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('claims.injuries_damages')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{t('claims.injuries')}</h3>
                                            {injuryFields.map((field, index) => (
                                                <div key={field.id} className="space-y-4 border p-4 rounded">

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`injuries.${index}.first_name`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>{t('form.name')}</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
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
                                                                    <FormLabel>{t('form.surname')}</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`injuries.${index}.age`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>{t('form.age')}</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            {...field}
                                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`injuries.${index}.phone`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>{t('form.phone')}</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`injuries.${index}.profession`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>{t('form.profession')}</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`injuries.${index}.injury_description`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>{t('form.injury_description')}</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`injuries.${index}.is_deceased`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>{t('form.check_if_deceased')}</FormLabel>
                                                                    <FormControl>
                                                                        <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value.toString()}>
                                                                            <SelectTrigger>
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="true">Yes</SelectItem>
                                                                                <SelectItem value="false">No</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        /></div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={() => removeInjury(index)}
                                                    >
                                                        {t('action.remove')}
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    appendInjury({
                                                        first_name: '',
                                                        last_name: '',
                                                        age: 0,
                                                        phone: '',
                                                        profession: '',
                                                        injury_description: '',
                                                        is_deceased: false,
                                                    })
                                                }
                                            >
                                                {t('form.add_injury')}
                                            </Button>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{t('claims.damages')}</h3>
                                            {damageFields.map((field, index) => (
                                                <div key={field.id} className="space-y-4 border p-4 rounded">

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`damages.${index}.type`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>{t('form.damage_type')}</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
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
                                                                    <FormLabel>{t('form.owner_name')}</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`damages.${index}.description`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>{t('form.damage_description')}</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        /></div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={() => removeDamage(index)}
                                                    >
                                                        {t('action.remove')}
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    appendDamage({
                                                        type: '',
                                                        owner_name: '',
                                                        description: '',
                                                    })
                                                }
                                            >
                                                {t('form.add_damage')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            {step === 6 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('claims.garage_info')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">

                                        {garageFields.map((field, index) => (
                                            <div key={field.id} className="space-y-4 border p-4 rounded">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`garages.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.garage_name')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
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
                                                                <FormLabel>{t('form.garage_address')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`garages.${index}.phone`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.garage_phone')}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
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
                                                                <FormLabel>{t('form.repair_estimate')}</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`garages.${index}.distance`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t('form.garage_distance')}</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    /></div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => removeGarage(index)}
                                                >
                                                    {t('action.remove')}
                                                </Button>
                                            </div>
                                        ))}
                                        <GarageRecommendations
                                            onSelectGarage={(garage: Garage) =>
                                                appendGarage({
                                                    name: garage.name,
                                                    address: garage.address,
                                                    phone: garage.phone || '',
                                                    repair_estimate: garage.repair_estimate || 0,
                                                    distance: garage.distance || 0,
                                                })
                                            }
                                            userLocation={userLocation || undefined}
                                        />
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                appendGarage({
                                                    name: '',
                                                    address: '',
                                                    phone: '',
                                                    repair_estimate: 0,
                                                    distance: 0,
                                                })
                                            }
                                        >
                                            {t('action.add_garage')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {step === 7 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('claims.documents')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {[
                                            { type: 'driver_license', label: t('form.driver_license'), multiple: false },
                                            { type: 'vehicle_registration', label: t('form.vehicle_registration'), multiple: false },
                                            { type: 'accident_scene', label: t('form.accident_scene'), multiple: true },
                                            { type: 'vehicle_damage', label: t('form.vehicle_damage'), multiple: true },
                                            { type: 'police_report', label: t('form.police_report'), multiple: false },
                                            { type: 'witness_statement', label: t('form.witness_statement'), multiple: true },
                                            { type: 'constat', label: t('form.constat'), multiple: true },
                                            { type: 'other', label: t('form.other'), multiple: true },
                                        ].map(({ type, label, multiple }) => (
                                            <div key={type} className="space-y-2">
                                                <FormLabel>{label}</FormLabel>
                                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                                    <Input
                                                        type="file"
                                                        accept={
                                                            type === 'police_report' || type === 'witness_statement' || type === 'other'
                                                                ? [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES].join(',')
                                                                : ACCEPTED_IMAGE_TYPES.join(',')
                                                        }
                                                        multiple={multiple}
                                                        onChange={(e) => handleFileChange(e, type as DocumentType)}
                                                    />
                                                    <div className="flex flex-wrap gap-2">
                                                        {(type === 'driver_license' && previews.driverLicensePhoto && (
                                                            <div className="relative">
                                                                <img src={`${STORAGES_URL+previews.driverLicensePhoto}`} alt="Driver License" className="h-20 w-20 object-cover" />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="absolute top-0 right-0"
                                                                    onClick={() => removeFile(documentFields.findIndex((d) => d.type === type), type as DocumentType)}
                                                                >
                                                                    X
                                                                </Button>
                                                            </div>
                                                        )) ||
                                                            (type === 'vehicle_registration' && previews.vehicleRegistrationPhoto && (
                                                                <div className="relative">
                                                                    <img src={`${STORAGES_URL+previews.vehicleRegistrationPhoto}`} alt="Vehicle Registration" className="h-20 w-20 object-cover" />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="absolute top-0 right-0"
                                                                        onClick={() => removeFile(documentFields.findIndex((d) => d.type === type), type as DocumentType)}
                                                                    >
                                                                        X
                                                                    </Button>
                                                                </div>
                                                            )) ||
                                                            (type === 'accident_scene' &&
                                                                previews.accidentScenePhotos.map((photo, idx) => (
                                                                    <div key={idx} className="relative">
                                                                        <img src={`${STORAGES_URL+photo}`} alt={`Accident Scene ${idx + 1} `} className="h-20 w-20 object-cover" />
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            className="absolute top-0 right-0"
                                                                            onClick={() => removeFile(documentFields.findIndex((d) => d.type === type && d.url === photo), type as DocumentType)}
                                                                        >
                                                                            X
                                                                        </Button>
                                                                    </div>
                                                                ))) ||
                                                            (type === 'vehicle_damage' &&
                                                                previews.vehicleDamagePhotos.map((photo, idx) => (
                                                                    <div key={idx} className="relative">
                                                                        <img src={`${STORAGES_URL+photo}`} alt={`Vehicle Damage ${idx + 1} `} className="h-20 w-20 object-cover" />
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            className="absolute top-0 right-0"
                                                                            onClick={() => removeFile(documentFields.findIndex((d) => d.type === type && d.url === photo), type as DocumentType)}
                                                                        >
                                                                            X
                                                                        </Button>
                                                                    </div>
                                                                ))) ||
                                                            (type === 'police_report' && previews.policeReportDoc && (
                                                                <div className="relative">
                                                                    <img src={`${STORAGES_URL+previews.policeReportDoc}`} alt="Police Report" className="h-20 w-20 object-cover" />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="absolute top-0 right-0"
                                                                        onClick={() => removeFile(documentFields.findIndex((d) => d.type === type), type as DocumentType)}
                                                                    >
                                                                        X
                                                                    </Button>
                                                                </div>
                                                            )) ||
                                                            (type === 'witness_statement' &&
                                                                previews.witnessStatements.map((doc, idx) => (
                                                                    <div key={idx} className="relative">
                                                                        <img src={`${STORAGES_URL+doc}`} alt={`Witness Statement ${idx + 1} `} className="h-20 w-20 object-cover" />
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            className="absolute top-0 right-0"
                                                                            onClick={() => removeFile(documentFields.findIndex((d) => d.type === type && d.url === doc), type as DocumentType)}
                                                                        >
                                                                            X
                                                                        </Button>
                                                                    </div>
                                                                ))) ||
                                                            (type === 'constat' &&
                                                                previews.constatPhotos.map((photo, idx) => (
                                                                    <div key={idx} className="relative">
                                                                        <img src={`${STORAGES_URL+photo}`} alt={`Constat ${idx + 1} `} className="h-20 w-20 object-cover" />
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            className="absolute top-0 right-0"
                                                                            onClick={() => removeFile(documentFields.findIndex((d) => d.type === type && d.url === photo), type as DocumentType)}
                                                                        >
                                                                            X
                                                                        </Button>
                                                                    </div>
                                                                ))) ||
                                                            (type === 'other' &&
                                                                previews.otherDocuments.map((doc, idx) => (
                                                                    <div key={idx} className="relative">
                                                                        <img src={`${STORAGES_URL+doc}`} alt={`Other Document ${idx + 1} `} className="h-20 w-20 object-cover" />
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            className="absolute top-0 right-0"
                                                                            onClick={() => removeFile(documentFields.findIndex((d) => d.type === type && d.url === doc), type as DocumentType)}
                                                                        >
                                                                            X
                                                                        </Button>
                                                                    </div>
                                                                )))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                            <div className="flex justify-between">
                                {step > 1 && (
                                    <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                                        {t('action.previous')}
                                    </Button>
                                )}
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? t('action.saving') : step === 7 ? t('action.submit') : t('action.save_and_next')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DashboardLayout>
        
    );
}