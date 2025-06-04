"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit, Plus, MapPin, Phone, Mail, Star, Wrench, Trash2, Settings } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
type Day = keyof GarageFormValues['openHours'];
const days: Day[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const garageSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    address: z.string().min(1, "Address is required"),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    email: z.string().email("Invalid email address").max(255),
    rating: z.coerce.number().min(0).max(5).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    specializations: z.array(z.string().max(255)).optional(),
    openHours: z.object({
        monday: z.string().optional(),
        tuesday: z.string().optional(),
        wednesday: z.string().optional(),
        thursday: z.string().optional(),
        friday: z.string().optional(),
        saturday: z.string().optional(),
        sunday: z.string().optional(),
    }).optional(),
    description: z.string().optional(),
});

type GarageFormValues = z.infer<typeof garageSchema>;

interface Garage {
    id: string;
    tenant_id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    rating: number;
    latitude?: number;
    longitude?: number;
    specializations: string[];
    openHours: {
        monday?: string;
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
        saturday?: string;
        sunday?: string;
    };
    description?: string;
}

export default function GaragesPage() {
    const { user, apiRequest } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [garages, setGarages] = useState<Garage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
    const [isGeolocating, setIsGeolocating] = useState(false);

    const form = useForm<GarageFormValues>({
        resolver: zodResolver(garageSchema),
        defaultValues: {
            name: "",
            address: "",
            phone: "",
            email: "",
            rating: 0,
            latitude: undefined,
            longitude: undefined,
            specializations: [],
            openHours: {
                monday: "09:00 - 17:00",
                tuesday: "09:00 - 17:00",
                wednesday: "09:00 - 17:00",
                thursday: "09:00 - 17:00",
                friday: "09:00 - 17:00",
                saturday: "09:00 - 17:00",
                sunday: "09:00 - 17:00",
            },
            description: "",
        },
    });

    // Fetch garages
    useEffect(() => {
        const fetchGarages = async () => {
            setIsLoading(true);
            try {
                const response = await apiRequest(`${API_URL}garages/${user.tenant_id}`, "GET");
                setGarages(response.map((garage: Garage) => ({
                    ...garage,
                    rating: garage.rating !== null ? Number(garage.rating) : null,
                    latitude: garage.latitude !== null ? Number(garage.latitude) : null,
                    longitude: garage.longitude !== null ? Number(garage.longitude) : null,
                })));
            } catch (error) {
                console.error("Error fetching garages:", error);
                toast({
                    title: "Error Loading Garages",
                    description: "Failed to load garages. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.tenant_id) {
            fetchGarages();
        }
    }, [user, toast]);
    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            toast({
                title: "Geolocation Unavailable",
                description: "Your browser does not support geolocation.",
                variant: "destructive",
            });
            return;
        }

        setIsGeolocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                form.setValue("latitude", Number(position.coords.latitude));
                form.setValue("longitude", Number(position.coords.longitude));
                toast({
                    title: "Location Acquired",
                    description: "Current location set successfully.",
                });
                setIsGeolocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast({
                    title: "Geolocation Error",
                    description: "Failed to get current location. Please enter coordinates manually.",
                    variant: "destructive",
                });
                setIsGeolocating(false);
            }
        );
    };
    // Handle create garage
    const handleCreateGarage = async (values: GarageFormValues) => {
        try {
            const payload = {
                ...values,
                tenant_id: user.tenant_id,
            };

            const response = await apiRequest(`${API_URL}garages`, "POST", payload);

            setGarages([...garages, response.garage]);
            toast({
                title: "Garage Created",
                description: `Garage ${response.garage.name} has been created.`,
            });
            setCreateDialogOpen(false);
            form.reset();
        } catch (error: any) {
            console.error("Error creating garage:", error);
            toast({
                title: "Error Creating Garage",
                description: error.response?.data?.message || "Failed to create garage. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Handle edit garage
    const handleEditGarage = (garage: Garage) => {
        setSelectedGarage(garage);
        form.reset({
            name: garage.name,
            address: garage.address,
            phone: garage.phone,
            email: garage.email,
            rating: garage.rating !== null ? Number(garage.rating) : undefined,
            latitude: garage.latitude !== null ? Number(garage.latitude) : undefined,
            longitude: garage.longitude !== null ? Number(garage.longitude) : undefined,
            specializations: garage.specializations,
            openHours: garage.openHours || days,
            description: garage.description,
        });
        setEditDialogOpen(true);
    };

    const handleUpdateGarage = async (values: GarageFormValues) => {
        if (!selectedGarage) return;

        try {
            const payload = {
                ...values,
                tenant_id: user.tenant_id,
            };

            const response = await apiRequest(`${API_URL}garages/${selectedGarage.id}`, "PUT", payload);

            setGarages(
                garages.map((g) => (g.id === selectedGarage.id ? response.garage : g))
            );
            toast({
                title: "Garage Updated",
                description: `Garage ${response.garage.name} has been updated.`,
            });
            setEditDialogOpen(false);
            setSelectedGarage(null);
            form.reset();
        } catch (error: any) {
            console.error("Error updating garage:", error);
            toast({
                title: "Error Updating Garage",
                description: error.response?.data?.message || "Failed to update garage. Please try again.",
                variant: "destructive",
            });
        }
    };
    const handleDeleteGarage = async () => {
        if (!selectedGarage) return;

        try {
            await apiRequest(`${API_URL}garages/${selectedGarage.id}`, "DELETE", { tenant_id: user.tenant_id });

            setGarages(garages.filter((g) => g.id !== selectedGarage.id));
            toast({
                title: "Garage Deleted",
                description: `Garage ${selectedGarage.name} has been deleted.`,
            });
            setDeleteDialogOpen(false);
            setSelectedGarage(null);
        } catch (error: any) {
            console.error("Error deleting garage:", error);
            toast({
                title: "Error Deleting Garage",
                description: error.response?.data?.message || "Failed to delete garage. Please try again.",
                variant: "destructive",
            });
        }
    };

    const openDeleteDialog = (garage: Garage) => {
        setSelectedGarage(garage);
        setDeleteDialogOpen(true);
    };
    if (isLoading) {
        return (
            <DashboardLayout
                user={{
                    name: user.name,
                    role: "Insurance Company",
                    avatar: "/placeholder.svg?height=40&width=40",
                }}
                navigation={[
                    { name: "Dashboard", href: "/dashboard/insurer", icon: null },
                    // { name: "Claims", href: "/dashboard/insurer/claims", icon: null },
                    // { name: "Bids", href: "/dashboard/insurer/bids", icon: null },
                    { name: "Garages Partners", href: "/dashboard/insurer/garages", icon: <Wrench className="h-5 w-5" /> },
                    { name: "Settings (Departments & Claim Types)", href: "/dashboard/insurer/settings", icon: <Settings className="h-5 w-5" /> },
                    // { name: "Documents", href: "/dashboard/insurer/documents", icon: null },
                ]}
            >
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            user={{
                name: user.name,
                role: user.role.name +' @ '+ user.tenant.name,
                avatar: "/placeholder.svg?height=40&width=40",
            }}
            navigation={[
                { name: "Dashboard", href: "/dashboard/insurer", icon: null },
                // { name: "Claims", href: "/dashboard/insurer/claims", icon: null },
                // { name: "Bids", href: "/dashboard/insurer/bids", icon: null },
                { name: "Garages Partners", href: "/dashboard/insurer/garages", icon: <Wrench className="h-5 w-5" /> },  
                { name: "Settings (Departments & Claim Types)", href: "/dashboard/insurer/settings", icon: <Settings className="h-5 w-5" /> },
                // { name: "Documents", href: "/dashboard/insurer/documents", icon: null },
            ]}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Garages</h1>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Create Garage
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{user.tenant.name} Garages Partners</CardTitle>
                        <CardDescription>Garages that you work with, will be suggested in claim filling</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {garages.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Specializations</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {garages.map((garage) => (
                                        <TableRow key={garage.id}>
                                            <TableCell className="font-medium">{garage.name}</TableCell>
                                            <TableCell>{garage.address}</TableCell>
                                            <TableCell>{garage.phone}</TableCell>
                                            <TableCell>{garage.email}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                    {garage.rating}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {garage.specializations?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {garage.specializations.map((spec, index) => (
                                                            <Badge key={index} variant="secondary">
                                                                {spec}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    "None"
                                                )}
                                            </TableCell>
                                            <TableCell className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditGarage(garage)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openDeleteDialog(garage)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">No garages found for this tenant.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Garage Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Garage</DialogTitle>
                        <DialogDescription>Add a new garage that works with your company.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(createDialogOpen ? handleCreateGarage : handleUpdateGarage)} className="space-y-4">
                            <div className="grid grid-cols-2  gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter garage name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rating</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    placeholder="0"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Phone Ex: 0788883000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Email: ex: contact@garage.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Enter garage address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <Label>Address Coordinates</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2">
                                        <FormField
                                            control={form.control}
                                            name="latitude"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.00000001"
                                                            placeholder="Latitude (-90 to 90)"
                                                            value={field.value ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                field.onChange(value === "" ? undefined : Number(value));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="longitude"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.00000001"
                                                            placeholder="Longitude (-180 to 180)"
                                                            value={field.value ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                field.onChange(value === "" ? undefined : Number(value));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleGeolocate}
                                        disabled={isGeolocating}
                                    >
                                        {isGeolocating ? "Locating..." : "Use Current Location"}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Open Hours</Label>

                                <div className="grid grid-cols-4 gap-1">
                                    {days.map((day) => (
                                        <FormField
                                            key={day}
                                            control={form.control}
                                            name={`openHours.${day}`} // Now type-safe
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="capitalize">{day}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="09:00 - 17:00" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                            <FormField
                                control={form.control}
                                name="specializations"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specializations (comma-separated)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Oil Change, Tire Services"
                                                value={field.value?.join(", ") || ""}
                                                onChange={(e) => field.onChange(e.target.value ? e.target.value.split(", ").map((s) => s.trim()) : [])}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Enter garage description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => (createDialogOpen ? setCreateDialogOpen(false) : setEditDialogOpen(false))}>
                                    Cancel
                                </Button>
                                <Button type="submit">{createDialogOpen ? "Create" : "Update"}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Edit Garage Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Garage</DialogTitle>
                        <DialogDescription>Update details for {selectedGarage?.name}.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(createDialogOpen ? handleCreateGarage : handleUpdateGarage)} className="space-y-4">
                            <div className="grid grid-cols-2  gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter garage name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rating</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    placeholder="0"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: 0788883000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="contact@garage.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter garage address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <Label>Address Coordinates</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2">
                                        <FormField
                                            control={form.control}
                                            name="latitude"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.00000001"
                                                            placeholder="Latitude (-90 to 90)"
                                                            value={field.value ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                field.onChange(value === "" ? undefined : Number(value));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="longitude"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.00000001"
                                                            placeholder="Longitude (-180 to 180)"
                                                            value={field.value ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                field.onChange(value === "" ? undefined : Number(value));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleGeolocate}
                                        disabled={isGeolocating}
                                    >
                                        {isGeolocating ? "Locating..." : "Use Current Location"}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Open Hours</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {days.map((day) => (
                                        <FormField
                                            key={day}
                                            control={form.control}
                                            name={`openHours.${day}`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="capitalize">{day}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="09:00 - 17:00" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                            <FormField
                                control={form.control}
                                name="specializations"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specializations (comma-separated)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Oil Change, Tire Services"
                                                value={field.value?.join(", ") || ""}
                                                onChange={(e) => field.onChange(e.target.value ? e.target.value.split(", ").map((s) => s.trim()) : [])}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter garage description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => (createDialogOpen ? setCreateDialogOpen(false) : setEditDialogOpen(false))}>
                                    Cancel
                                </Button>
                                <Button type="submit">{createDialogOpen ? "Create" : "Update"}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Garage</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedGarage?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteGarage}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}