"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    FileCheck, Plus, Edit, Trash2, CheckCircle, X, Clock,
    DollarSign, FileText, AlertCircle, TrendingUp, Building2, Users,
    CreditCard
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { User } from "@/lib/types/users"
import { Claim, Contract, Garage, Payment, Settlement } from "@/lib/types/claims"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

// Settlement form schema
const settlementSchema = z.object({
    claim_id: z.string().min(1, "Claim is required"),
    payment_id: z.string().min(1, "Payment is required"),
    user_id: z.string().min(1, "User is required"),
    settled_amount: z.string().transform((val) => Number(val)).pipe(z.number().min(0.01, "Amount must be greater than 0")),
    requested_amount: z.string().transform((val) => val === "" ? undefined : Number(val)).pipe(z.number().min(0.01).optional()),
    status: z.enum(["pending", "approved", "rejected", "completed"]),
    settlement_notes: z.string().optional(),
})

// Action schemas
const approveSchema = z.object({
    settlement_notes: z.string().optional(),
    approved_amount: z.string().transform((val) => val === "" ? undefined : Number(val)).pipe(z.number().min(0.01).optional()),
})

const rejectSchema = z.object({
    rejection_reason: z.string().min(1, "Rejection reason is required"),
})

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
}

export default function SettlementsPage() {
    const { user, apiRequest } = useAuth()
    const { toast } = useToast()
    const [settlements, setSettlements] = useState<Settlement[]>([])
    const [filteredSettlements, setFilteredSettlements] = useState<Settlement[]>([])
    const [pendingSettlements, setPendingSettlements] = useState<Settlement[]>([])
    const [claims, setClaims] = useState<Claim[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [stats, setStats] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [actionType, setActionType] = useState(null)
    const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null)
    const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [selectedSettlements, setSelectedSettlements] = useState<Settlement[]>([])
    const [bulkActionLoading, setBulkActionLoading] = useState(false)
    const [selectedClaim, setSelectedClaim] = useState(null)
    const [isClaimLoading, setIsClaimLoading] = useState(false)
    const [filters, setFilters] = useState({
        status: "all",
        claim_id: "all",
        user_id: "all",
        date_from: "",
        date_to: "",
    })

    const form = useForm({
        resolver: zodResolver(settlementSchema),
        defaultValues: {
            claim_id: "",
            payment_id: "",
            user_id: "",
            settled_amount: "",
            requested_amount: "",
            status: "pending",
            settlement_notes: "",
        },
    })

    const actionForm = useForm({
        defaultValues: {
            settlement_notes: "",
            approved_amount: "",
            rejection_reason: "",
        },
    })

    // Fetch data functions
    const fetchSettlements = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams()

            if (filters.status !== "all") params.append("status", filters.status)
            if (filters.claim_id !== "all") params.append("claim_id", filters.claim_id)
            if (filters.user_id !== "all") params.append("user_id", filters.user_id)
            if (filters.date_from) params.append("date_from", filters.date_from)
            if (filters.date_to) params.append("date_to", filters.date_to)

            const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/settlements?${params}`, "GET")
            if (response.success) {
                setSettlements(response.data.data || response.data)
                setFilteredSettlements(response.data.data || response.data)
            }
        } catch (error: any) {
            console.error("Failed to fetch settlements:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchPendingSettlements = async () => {
        try {
            const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/settlements-pending`, "GET")
            if (response.success) {
                setPendingSettlements(response.data)
            }
        } catch (error: any) {
            console.error("Failed to fetch pending settlements:", error)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/settlements-stats`, "GET")
            if (response.success) {
                setStats(response.data)
            }
        } catch (error: any) {
            console.error("Failed to fetch stats:", error)
        }
    }

    const fetchDropdownData = async () => {
        try {
            const [claimsRes, paymentsRes] = await Promise.all([
                apiRequest(`${API_URL}tenants/${user.tenant_id}/settlements/available/claims`, "GET"),
                apiRequest(`${API_URL}tenants/${user.tenant_id}/settlements/available/payments`, "GET")
            ])

            if (claimsRes.success) setClaims(claimsRes.data)
            if (paymentsRes.success) setPayments(paymentsRes.data)
            setUsers(user.tenant.users)
        } catch (error: any) {
            console.error("Failed to fetch dropdown data:", error)
        }
    }

    useEffect(() => {
        if (user?.tenant_id) {
            fetchSettlements()
            fetchPendingSettlements()
            fetchStats()
            fetchDropdownData()
        }
    }, [user?.tenant_id, filters])
    const fetchPaymentsForClaim = async (claimId: any) => {
        try {
            setIsClaimLoading(true)
            const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/settlements/available/payments/${claimId}`, "GET")
            if (response.success) {
                setPayments(response.data)
            }
        } catch (error: any) {
            console.error("Failed to fetch payments for claim:", error)
        } finally {
            setIsClaimLoading(false)
        }
    }
    const handleSettlementSubmit = async (data: any) => {
        setIsLoading(true)

        try {
            let response
            if (editingSettlement) {
                response = await apiRequest(
                    `${API_URL}tenants/${user.tenant_id}/settlements/${editingSettlement.id}`,
                    "PUT",
                    data
                )
            } else {
                response = await apiRequest(
                    `${API_URL}tenants/${user.tenant_id}/settlements`,
                    "POST",
                    data
                )
            }

            if (response.success) {
                toast({
                    title: editingSettlement ? "Settlement Updated" : "Settlement Created",
                    description: `Settlement has been ${editingSettlement ? 'updated' : 'created'} successfully.`,
                })
                setDialogOpen(false)
                setEditingSettlement(null)
                form.reset()
                fetchSettlements()
                fetchPendingSettlements()
                fetchStats()
            } else {
                throw new Error(response.message || "Failed to save settlement")
            }
        } catch (error: any) {
            console.error("Settlement save error:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to save settlement. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSettlementAction = async (settlementId: string, action: string, data = {}) => {
        setActionLoading(true)
        const byfield = action === 'reject' ? `${action}ed_by` : `${action}d_by`
        try {
            const actionData = {
                ...data,
                [byfield]: user.id,
            }

            const url = `${API_URL}tenants/${user.tenant_id}/settlements/${settlementId}/${action}`
            console.log('Making request to:', url)
            console.log('With data:', actionData)

            const response = await apiRequest(url, "POST", actionData)

            console.log('Response:', response)

            if (response.success) {
                toast({
                    title: "Success",
                    description: `Settlement ${action}ed successfully.`,
                })
                setActionDialogOpen(false)
                setSelectedSettlement(null)
                setActionType(null)
                actionForm.reset()
                fetchSettlements()
                fetchPendingSettlements()
                fetchStats()
            } else {
                throw new Error(response.message || `Failed to ${action} settlement`)
            }
        } catch (error: any) {
            console.error(`Settlement ${action} error:`, error)
            toast({
                title: "Error",
                description: error.message || `Failed to ${action} settlement.`,
                variant: "destructive",
            })
        } finally {
            setActionLoading(false)
        }
    }

    const handleBulkApprove = async () => {
        if (selectedSettlements.length === 0) {
            toast({
                title: "Error",
                description: "Please select settlements to approve.",
                variant: "destructive",
            })
            return
        }

        setBulkActionLoading(true)

        try {
            const response = await apiRequest(
                `${API_URL}tenants/${user.tenant_id}/settlements/bulk-approve`,
                "POST",
                {
                    settlement_ids: selectedSettlements,
                    approved_by: user.id,
                }
            )

            if (response.success) {
                toast({
                    title: "Success",
                    description: `${response.data.approved_count} settlements approved successfully.`,
                })
                setSelectedSettlements([])
                fetchSettlements()
                fetchPendingSettlements()
                fetchStats()
            } else {
                throw new Error(response.message || "Failed to approve settlements")
            }
        } catch (error: any) {
            console.error("Bulk approve error:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to approve settlements.",
                variant: "destructive",
            })
        } finally {
            setBulkActionLoading(false)
        }
    }

    const handleDeleteSettlement = async (settlementId: string) => {
        if (window.confirm("Are you sure you want to delete this settlement?")) {
            try {
                const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/settlements/${settlementId}`, "DELETE")
                if (response.success) {
                    toast({
                        title: "Settlement Deleted",
                        description: "Settlement has been deleted successfully.",
                    })
                    fetchSettlements()
                    fetchPendingSettlements()
                    fetchStats()
                }
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: "Failed to delete settlement.",
                    variant: "destructive",
                })
            }
        }
    }

    const openAddDialog = () => {
        setEditingSettlement(null)
        form.reset({
            claim_id: "",
            payment_id: "",
            user_id: "",
            settled_amount: "",
            requested_amount: "",
            status: "pending",
            settlement_notes: "",
        })
        setDialogOpen(true)
    }

    const openEditDialog = (settlement) => {
        setEditingSettlement(settlement)
        form.reset({
            claim_id: settlement.claim_id,
            payment_id: settlement.payment_id,
            user_id: settlement.user_id,
            settled_amount: settlement.settled_amount.toString(),
            requested_amount: settlement.requested_amount?.toString() || "",
            status: settlement.status,
            settlement_notes: settlement.settlement_notes || "",
        })
        setDialogOpen(true)
    }

    const openActionDialog = (settlement, action) => {
        setSelectedSettlement(settlement)
        setActionType(action)
        actionForm.reset()
        setActionDialogOpen(true)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RwF'
        }).format(amount || 0)
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString()
    }

    const getActionButtons = (settlement: Settlement) => {
        const buttons = []

        if (settlement.status === 'pending') {
            buttons.push(
                <Button
                    key="approve"
                    variant="outline"
                    size="sm"
                    onClick={() => openActionDialog(settlement, 'approve')}
                    title="Approve Settlement"
                >
                    <CheckCircle className="h-4 w-4" />
                </Button>,
                <Button
                    key="reject"
                    variant="outline"
                    size="sm"
                    onClick={() => openActionDialog(settlement, 'reject')}
                    title="Reject Settlement"
                >
                    <X className="h-4 w-4" />
                </Button>
            )
        }

        if (settlement.status === 'approved') {
            buttons.push(
                <Button
                    key="complete"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSettlementAction(settlement.id, 'complete', {})}
                    title="Complete Settlement"
                >
                    <FileCheck className="h-4 w-4" />
                </Button>
            )
        }

        return buttons
    }

    const renderActionDialog = () => {
        if (!actionType || !selectedSettlement) return null

        const handleActionSubmit = (data: { settlement_notes: any; approved_amount: any; rejection_reason: any }) => {
            if (actionType === 'approve') {
                handleSettlementAction(selectedSettlement.id, 'approve', {
                    settlement_notes: data.settlement_notes,
                    approved_amount: data.approved_amount,
                })
            } else if (actionType === 'reject') {
                handleSettlementAction(selectedSettlement.id, 'reject', {
                    rejection_reason: data.rejection_reason,
                })
            }
        }

        return (
            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' && 'Approve Settlement'}
                            {actionType === 'reject' && 'Reject Settlement'}
                        </DialogTitle>
                        <DialogDescription>
                            Settlement: {selectedSettlement.code} - {formatCurrency(selectedSettlement.settled_amount)}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...actionForm}>
                        <form onSubmit={actionForm.handleSubmit(handleActionSubmit)} className="space-y-4">
                            {actionType === 'approve' && (
                                <>
                                    <FormField
                                        control={actionForm.control}
                                        name="approved_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Approved Amount (Leave empty to approve requested amount)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder={`Requested: ${selectedSettlement.settled_amount}`}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={actionForm.control}
                                        name="settlement_notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Approval Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Optional approval notes" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {actionType === 'reject' && (
                                <FormField
                                    control={actionForm.control}
                                    name="rejection_reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rejection Reason</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Explain why the settlement is being rejected" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActionDialogOpen(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={actionLoading}>
                                    {actionLoading ? "Processing..." : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Settlement`}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <DashboardLayout
            user={{
                name: user.name,
                role: user?.role.name + " @ " + user?.tenant?.name,
                avatar: "/placeholder.svg?height=40&width=40",
            }}
            navigation={[
                { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
                { name: "Contracts", href: "/dashboard/insurer/contracts", icon: <FileText className="h-5 w-5" /> },
                { name: "Payments", href: "/dashboard/insurer/payments", icon: <CreditCard className="h-5 w-5" /> },
                { name: "Settlements", href: "/dashboard/insurer/settlements", icon: <FileCheck className="h-5 w-5" /> },
            ]}
        >
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Settlements Management</h1>
                        <p className="text-muted-foreground mt-2">Manage insurance claim settlements and approvals</p>
                    </div>
                    <Button onClick={openAddDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Settlement
                    </Button>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="settlements">All Settlements</TabsTrigger>
                        <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Settlements</CardTitle>
                                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_settlements || 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.pending_settlements || 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.completed_settlements || 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(stats.total_settled_amount)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Settlements</CardTitle>
                                <CardDescription>Latest settlement activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Claim</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {settlements.slice(0, 5).map((settlement) => (
                                            <TableRow key={settlement.id}>
                                                <TableCell className="font-medium">{settlement.code}</TableCell>
                                                <TableCell>{settlement.claim?.code || "N/A"}</TableCell>
                                                <TableCell>{settlement.user?.first_name} {settlement.user?.last_name}</TableCell>
                                                <TableCell>{formatCurrency(settlement.settled_amount)}</TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[settlement.status]}>
                                                        {settlement.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(settlement.created_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settlements">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Settlements</CardTitle>
                                <CardDescription>Manage all settlement records</CardDescription>

                                {/* Filters */}
                                <div className="flex gap-4 mt-4 flex-wrap">
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        type="date"
                                        placeholder="From date"
                                        value={filters.date_from}
                                        onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                                        className="w-40"
                                    />

                                    <Input
                                        type="date"
                                        placeholder="To date"
                                        value={filters.date_to}
                                        onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                                        className="w-40"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-8">Loading settlements...</div>
                                ) : filteredSettlements.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FileCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500">No settlements found.</p>
                                        <Button onClick={openAddDialog} className="mt-4">
                                            Create Your First Settlement
                                        </Button>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Claim</TableHead>
                                                <TableHead>Payment</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSettlements.map((settlement) => (
                                                <TableRow key={settlement.id}>
                                                    <TableCell className="font-medium">{settlement.code}</TableCell>
                                                    <TableCell>{settlement.claim?.code || "N/A"}</TableCell>
                                                    <TableCell>{settlement.payment?.code || "N/A"}</TableCell>
                                                    <TableCell>{settlement.user?.first_name} {settlement.user?.last_name}</TableCell>
                                                    <TableCell>{formatCurrency(settlement.settled_amount)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[settlement.status]}>
                                                            {settlement.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{formatDate(settlement.created_at)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {getActionButtons(settlement)}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(settlement)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteSettlement(settlement.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pending">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Pending Approvals</CardTitle>
                                    <CardDescription>Settlements waiting for approval</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    {selectedSettlements.length > 0 && (
                                        <Button
                                            onClick={handleBulkApprove}
                                            disabled={bulkActionLoading}
                                        >
                                            {bulkActionLoading ? "Approving..." : `Approve Selected (${selectedSettlements.length})`}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {pendingSettlements.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                                        <p className="text-gray-500">No pending settlements!</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={selectedSettlements.length === pendingSettlements.length}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedSettlements(pendingSettlements.map(s => s.id))
                                                            } else {
                                                                setSelectedSettlements([])
                                                            }
                                                        }}
                                                    />
                                                </TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Claim</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Requested</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingSettlements.map((settlement) => (
                                                <TableRow key={settlement.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedSettlements.includes(settlement.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedSettlements(prev => [...prev, settlement.id])
                                                                } else {
                                                                    setSelectedSettlements(prev => prev.filter(id => id !== settlement.id))
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{settlement.code}</TableCell>
                                                    <TableCell>{settlement.claim?.code || "N/A"}</TableCell>
                                                    <TableCell>{settlement.user?.first_name} {settlement.user?.last_name}</TableCell>
                                                    <TableCell>{formatCurrency(settlement.settled_amount)}</TableCell>
                                                    <TableCell>{formatDate(settlement.created_at)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openActionDialog(settlement, 'approve')}
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openActionDialog(settlement, 'reject')}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Settlement Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingSettlement ? "Edit Settlement" : "Create New Settlement"}</DialogTitle>
                            <DialogDescription>
                                {editingSettlement ? "Update settlement information" : "Enter the details for the new settlement"}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSettlementSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="claim_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Claim</FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value)
                                                        if (value) {
                                                            const claim = claims.find(c => c.id === value)
                                                            setSelectedClaim(claim)
                                                            fetchPaymentsForClaim(value)
                                                            form.setValue('payment_id', '')
                                                            // Auto-fill amounts if available
                                                            if (claim?.approved_amount || claim?.amount) {
                                                                const settlementAmount = claim.approved_amount || claim.amount
                                                                form.setValue('settled_amount', settlementAmount.toString())
                                                                form.setValue('requested_amount', settlementAmount.toString())
                                                            }
                                                        } else {
                                                            setSelectedClaim(null)
                                                            fetchDropdownData()
                                                            form.setValue('payment_id', '')
                                                        }
                                                    }}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select claim" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {claims.map((claim) => (
                                                            <SelectItem key={claim.id} value={claim.id}>
                                                                <div className="flex flex-col">
                                                                    <span>{claim.code}</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {formatCurrency(claim.approved_amount || claim.amount)}
                                                                    </span>
                                                                </div>
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
                                        name="payment_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isClaimLoading}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={isClaimLoading ? "Loading payments..." : "Select payment"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {payments.map((payment) => (
                                                            <SelectItem key={payment.id} value={payment.id}>
                                                                <div className="flex flex-col">
                                                                    <span>{payment.code}</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {formatCurrency(payment.amount)} - {payment.payment_method}
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="user_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>User</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select user" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {users.map((user) => (
                                                            <SelectItem key={user.id} value={user.id}>
                                                                {user.first_name} {user.last_name}
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
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="approved">Approved</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="settled_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Settled Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="requested_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Requested Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="settlement_notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Settlement Notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter settlement notes or comments"
                                                    className="resize-none"
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Saving..." : editingSettlement ? "Update Settlement" : "Create Settlement"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Action Dialog */}
                {renderActionDialog()}
            </div>
        </DashboardLayout>
    )
}