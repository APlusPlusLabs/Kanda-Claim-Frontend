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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit, Plus, MapPin, Phone, Mail, Star, Wrench, Trash2, BriefcaseBusiness, HousePlus, Settings } from "lucide-react";
import { ClaimType } from "@/lib/types/claims";
import { Department } from "@/lib/types/users";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
const claimtypeSchema = z.object({
    name: z.string().min(1, "Claim-Type Name is required").max(255),
    description: z.string().optional(),
    is_active: z.boolean()
});
const departmentFormSchema = z.object({
    name: z.string().min(2, { message: "Department name must be at least 2 characters." }),
    description: z.string().min(2, { message: "description must be at least 2 characters." }),
});

type claimTypeFormValues = z.infer<typeof claimtypeSchema>;
type departmentFormValues = z.infer<typeof departmentFormSchema>;


export default function SettingsPage() {
    const { user, apiRequest } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    //claim type declarations
    const [claimtypes, setClaimTypes] = useState<ClaimType[]>([]);
    const [createClaimTypeDialogOpen, setCreateClaimTypeDialogOpen] = useState(false);
    const [editClaimTypeDialogOpen, setEditClaimTypeDialogOpen] = useState(false);
    const [deleteClaimTypeDialogOpen, setDeleteClaimTypeDialogOpen] = useState(false);
    const [selectedClaimType, setSelectedClaimType] = useState<ClaimType | null>(null);
    //departments declairations
    const [createDepartmentDialogOpen, setCreateDepartmentDialogOpen] = useState(false);
    const [editDepartmentDialogOpen, setEditDepartmentDialogOpen] = useState(false);
    const [deleteDepartmentDialogOpen, setDeleteDepartmentDialogOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);

    const claimTypeform = useForm<z.infer<typeof claimtypeSchema>>({
        resolver: zodResolver(claimtypeSchema),
        defaultValues: {
            name: "",
            description: "",
            is_active: true
        },
    });
    const claimTypeEditform = useForm<z.infer<typeof claimtypeSchema>>({
        resolver: zodResolver(claimtypeSchema),
        defaultValues: {
            name: selectedClaimType?.name,
            description: selectedClaimType?.description,
            is_active: selectedClaimType?.is_active
        },
    });
    const departmentform = useForm<z.infer<typeof departmentFormSchema>>({
        resolver: zodResolver(departmentFormSchema),
        defaultValues: {
            name: "",
            description: ""
        },
    });
    const departmenteEditform = useForm<z.infer<typeof departmentFormSchema>>({
        resolver: zodResolver(departmentFormSchema),
        defaultValues: {
            name: selectedClaimType?.name,
            description: selectedClaimType?.description
        },
    });
    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await apiRequest(`${API_URL}claim-types/${user.tenant_id}`, "GET");
                setClaimTypes(response);
                //ddepartments-by-tenant/
                const ddepartments = await apiRequest(`${API_URL}departments-by-tenant/${user.tenant_id}`, "GET");
                setDepartments(ddepartments)
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error Loading data",
                    description: "Failed to load data. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.tenant_id) {
            fetchData();
        }
    }, [user, toast]);

    // Handle create claimtype
    const handleCreateClaimType = async (values: claimTypeFormValues) => {
        try {
            const payload = {
                ...values,
                category: values.name,
                tenant_id: user.tenant_id,
            };

            const response = await apiRequest(`${API_URL}claim-types`, "POST", payload);

            setClaimTypes([...claimtypes, response]);
            toast({
                title: "ClaimType Created",
                description: `ClaimType ${response.name} has been created.`,
            });
            setCreateClaimTypeDialogOpen(false);
            claimTypeform.reset();
        } catch (error: any) {
            console.error("Error creating claimtype:", error);
            toast({
                title: "Error Creating ClaimType",
                description: error.response?.data?.message || "Failed to create claimtype. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Handle edit claimtype
    const handleEditClaimType = (claimtype: ClaimType) => {
        setSelectedClaimType(claimtype);
        claimTypeform.reset({
            name: claimtype.name,
            description: claimtype.description,
            is_active: claimtype.is_active
        });
        setEditClaimTypeDialogOpen(true);
    };

    const handleUpdateClaimType = async (values: claimTypeFormValues) => {
        if (!selectedClaimType) return;
        try {
            const payload = {
                ...values,
                category: values.name,
                tenant_id: user.tenant_id,
            };

            const response = await apiRequest(`${API_URL}claim-types/${selectedClaimType.id}`, "PUT", payload);

            setClaimTypes(
                claimtypes.map((g) => (g.id === selectedClaimType.id ? response : g))
            );
            toast({
                title: "ClaimType Updated",
                description: `ClaimType ${response.name} has been updated.`,
            });
            setEditClaimTypeDialogOpen(false);
            setSelectedClaimType(null);
            claimTypeform.reset();
        } catch (error: any) {
            console.error("Error updating claimtype:", error);
            toast({
                title: "Error Updating ClaimType",
                description: error.response?.message || "Failed to update claimtype. Please try again.",
                variant: "destructive",
            });
        }
    };
    const handleDeleteClaimType = async () => {
        if (!selectedClaimType) return;
        try {
            await apiRequest(`${API_URL}claim-types/${selectedClaimType.id}`, "DELETE", { tenant_id: user.tenant_id });
            setClaimTypes(claimtypes.filter((g) => g.id !== selectedClaimType.id));
            toast({
                title: "ClaimType Deleted",
                description: `ClaimType ${selectedClaimType.name} has been deleted.`,
            });
            setDeleteClaimTypeDialogOpen(false);
            setSelectedClaimType(null);
        } catch (error: any) {
            console.error("Error deleting claimtype:", error);
            toast({
                title: "Error Deleting ClaimType",
                description: error.response?.data?.message || "Failed to delete claimtype. Please try again.",
                variant: "destructive",
            });
        }
    };

    const openDeleteClaimTypeDialog = (claimtype: ClaimType) => {
        setSelectedClaimType(claimtype);
        setDeleteClaimTypeDialogOpen(true);
    };

    //department functions
    const onSubmitNewDepartment = async (values: z.infer<typeof departmentFormSchema>) => {
        try {

            const newDescription = await apiRequest(`${API_URL}departments/store`, "POST", {
                name: values.name,
                description: values.description,
                tenant_id: user.tenant_id
            });

            setDepartments([
                ...departments,
                {
                    id: newDescription.id,
                    first_name: newDescription.description,
                    description: newDescription.description,
                },
            ]);

            setIsCreateDepartmentOpen(false);
            departmentform.reset();

            toast({
                title: "Department added successfully",
                description: `${values.name} has been added.`,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to add Department. ",
            });
        }
    };
    const handleEditDepartment = (department: Department) => {
        setSelectedDepartment(department);
        departmentform.reset({
            name: department.name,
            description: department.description
        });
        setEditDepartmentDialogOpen(true);
    };

    const handleUpdateDepartment = async (values: departmentFormValues) => {
        if (!selectedDepartment) return;
        try {
            const payload = {
                ...values,
                tenant_id: user.tenant_id,
            };

            const response = await apiRequest(`${API_URL}departments/${selectedDepartment.id}`, "PUT", payload);

            setDepartments(
                departments.map((g) => (g.id === selectedDepartment.id ? response : g))
            );
            toast({
                title: "Department Updated",
                description: `Department ${response.name} has been updated.`,
            });
            setEditDepartmentDialogOpen(false);
            setSelectedDepartment(null);
            departmentform.reset();
        } catch (error: any) {
            console.error("Error updating department:", error);
            toast({
                title: "Error Updating Department",
                description: error || "Failed to update department. Please try again.",
                variant: "destructive",
            });
        }
    };
    const handleDeleteDepartment = async () => {
        if (!selectedDepartment) return;
        try {
            await apiRequest(`${API_URL}departments/${selectedDepartment.id}`, "DELETE", { tenant_id: user.tenant_id });
            setDepartments(departments.filter((g) => g.id !== selectedDepartment.id));
            toast({
                title: "Department Deleted",
                description: `Department ${selectedDepartment.name} has been deleted.`,
            });
            setDeleteDepartmentDialogOpen(false);
            setSelectedDepartment(null);
        } catch (error: any) {
            console.error("Error deleting department:", error);
            toast({
                title: "Error Deleting Department",
                description: error.response?.data?.message || "Failed to delete department. Please try again.",
                variant: "destructive",
            });
        }
    };
    const openDeleteDepartmentDialog = (cepartment: Department) => {
        setSelectedDepartment(cepartment);
        setDeleteDepartmentDialogOpen(true);
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
                    // { name: "Dashboard", href: "/dashboard/insurer", icon: null },
                    // { name: "Claims", href: "/dashboard/insurer/claims", icon: null },
                    // { name: "Bids", href: "/dashboard/insurer/bids", icon: null },
                    { name: "Garage Partners", href: "/dashboard/insurer/garages", icon: <Wrench className="h-5 w-5" /> },
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
                role: user.role.name + ' @ ' + user.tenant.name,
                avatar: "/placeholder.svg?height=40&width=40",
            }}
            navigation={[
                // { name: "Dashboard", href: "/dashboard/insurer", icon: null },
                // { name: "Claims", href: "/dashboard/insurer/claims", icon: null },
                // { name: "Bids", href: "/dashboard/insurer/bids", icon: null },
                { name: "Garage Partners", href: "/dashboard/insurer/garages", icon: <Wrench className="h-5 w-5" /> },
                { name: "Settings (Departments & Claim Types)", href: "/dashboard/insurer/settings", icon: <Settings className="h-5 w-5" /> },
                // { name: "Documents", href: "/dashboard/insurer/documents", icon: null },
            ]}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{user.tenant.name} Claim Types, Departments ...</h1>
                    <div className="flex items-end justify-between space-x-2">
                        <Button onClick={() => setCreateClaimTypeDialogOpen(true)} className="space-x-2">
                            <Plus className="h-4 w-4 mr-2" /> ClaimType
                        </Button>
                        <Button onClick={() => setIsCreateDepartmentOpen(true)} className="space-x-2">
                            <Plus className="h-4 w-4 mr-2" /> Department
                        </Button>
                        <Button onClick={() => router.push('/dashboard/insurer/garages')} className="space-x-2">
                            <Plus className="h-4 w-4 mr-2" /> Garages
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Company's Claim Types</CardTitle>
                        <CardDescription>Types of claims u cover insurance for</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {claimtypes.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead></TableHead>
                                        <TableHead>Claim Type Name</TableHead>
                                        <TableHead>is Active?</TableHead>
                                        <TableHead>Claim Type Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {claimtypes.map((claimtype) => (
                                        <TableRow key={claimtype.id}>
                                            <TableCell className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditClaimType(claimtype)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openDeleteClaimTypeDialog(claimtype)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-medium">{claimtype.name}</TableCell>
                                            <TableCell>{claimtype.is_active ? "True" : "No"}</TableCell>
                                            <TableCell>{claimtype.description}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">No claimtypes found for this tenant.</p>
                                <Button onClick={() => setCreateClaimTypeDialogOpen(true)}>Create new Claim Type</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <br />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Departments</h2>
                    <Button onClick={() => setCreateDepartmentDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Department
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Company's Departments</CardTitle>
                        <CardDescription>Classifications of users/agents with your company</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {departments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead></TableHead>
                                        <TableHead>Department Name</TableHead>
                                        <TableHead>Department Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.map((department) => (
                                        <TableRow key={department.id}>
                                            <TableCell className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditDepartment(department)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openDeleteDepartmentDialog(department)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-medium">{department.name}</TableCell>
                                            <TableCell>{department.description}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">No departments found for this tenant.</p>
                                <Button onClick={() => setIsCreateDepartmentOpen(true)}>Add new Department</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create ClaimType Dialog */}
            <Dialog open={createClaimTypeDialogOpen} onOpenChange={setCreateClaimTypeDialogOpen}>

                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Add New ClaimType</DialogTitle>
                        <DialogDescription>Create a new Claim Type. Claim type are what classifies the claims</DialogDescription>
                    </DialogHeader>
                    <Form {...claimTypeform}>
                        <form onSubmit={claimTypeform.handleSubmit(createClaimTypeDialogOpen ? handleCreateClaimType : handleUpdateClaimType)} className="space-y-4 py-4">
                            <FormField
                                control={claimTypeform.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ClaimType Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Thefty, Liability" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={claimTypeform.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Explain a bit" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={claimTypeform.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>is active ?</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="is Active?" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={true}>Its Active</SelectItem>
                                                <SelectItem value={false}>Its Not Active</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Add ClaimType</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* create department */}
            <Dialog open={isCreateDepartmentOpen} onOpenChange={setIsCreateDepartmentOpen}>

                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Add New Department</DialogTitle>
                        <DialogDescription>Create a new department for company users.</DialogDescription>
                    </DialogHeader>
                    <Form {...departmentform}>
                        <form onSubmit={departmentform.handleSubmit(onSubmitNewDepartment)} className="space-y-4 py-4">
                            <FormField
                                control={departmentform.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Finance, Garage, Claims..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={departmentform.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Explain a bit" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Add Department</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            {/* Edit ClaimType Dialog */}
            <Dialog open={editClaimTypeDialogOpen} onOpenChange={setEditClaimTypeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit ClaimType</DialogTitle>
                        <DialogDescription>Update details for {selectedClaimType?.name}.</DialogDescription>
                    </DialogHeader>
                    <Form {...claimTypeform}>
                        <form onSubmit={claimTypeform.handleSubmit(createClaimTypeDialogOpen ? handleCreateClaimType : handleUpdateClaimType)} className="space-y-4">
                            <FormField
                                control={claimTypeform.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Thefty, Liability" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={claimTypeform.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter claimtype description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={claimTypeform.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>is active ?</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="is Active?" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={true}>Its Active</SelectItem>
                                                <SelectItem value={false}>Its Not Active</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => (createClaimTypeDialogOpen ? setCreateClaimTypeDialogOpen(false) : setEditClaimTypeDialogOpen(false))}>
                                    Cancel
                                </Button>
                                <Button type="submit">{createClaimTypeDialogOpen ? "Create" : "Update"}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            {/* edit department */}
            <Dialog open={editDepartmentDialogOpen} onOpenChange={setEditDepartmentDialogOpen}>

                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Edit Department: {selectedDepartment?.name} </DialogTitle>
                    </DialogHeader>
                    <Form {...departmentform}>
                        <form onSubmit={departmentform.handleSubmit(handleUpdateDepartment)} className="space-y-4 py-4">
                            <FormField
                                control={departmentform.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Finance, Garage, Claims..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={departmentform.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Explain a bit" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Save Department</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Dialog open={deleteClaimTypeDialogOpen} onOpenChange={setDeleteClaimTypeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete ClaimType</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedClaimType?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteClaimTypeDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteClaimType}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={deleteDepartmentDialogOpen} onOpenChange={setDeleteDepartmentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Department</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedDepartment?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDepartmentDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteDepartment}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}