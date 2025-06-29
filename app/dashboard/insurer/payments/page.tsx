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
import {
    CreditCard, Plus, Edit, Trash2, Play, CheckCircle, X, RotateCcw,
    DollarSign, Clock, AlertCircle, TrendingUp, Building2, Filter,
    List,
    FileText,
    FileCheck
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Claim, Contract } from "@/lib/types/claims"
import { User } from "@/lib/types/users"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

// Payment form schema
const paymentSchema = z.object({
    claim_id: z.string().optional(),
    contract_id: z.string().optional(), garage_id: z.string().optional(),
    user_id: z.string().min(1, "User is required"),
    amount: z.string().transform((val) => Number(val)).pipe(z.number().min(0.01, "Amount must be greater than 0")),
    currency: z.string().length(3, "Currency must be 3 characters"),
    payment_method: z.string().optional(),
    payment_code: z.string().optional(),
    document: z.string().optional(),
    status: z.enum(["pending", "processing", "completed", "failed", "cancelled", "refunded"]),
    transaction_reference: z.string().optional(),
    payment_gateway: z.string().optional(),
})
// Action schemas
const processSchema = z.object({
    payment_gateway: z.string().min(1, "Payment gateway is required"),
    gateway_response: z.string().optional(),
})

const failSchema = z.object({
    failure_reason: z.string().min(1, "Failure reason is required"),
    gateway_response: z.string().optional(),
})

const refundSchema = z.object({
    refund_reason: z.string().min(1, "Refund reason is required"),
    refund_amount: z.string().transform((val) => val === "" ? undefined : Number(val)).pipe(z.number().min(0.01).optional()),
})

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    refunded: "bg-orange-100 text-orange-800",
}

export default function PaymentsPage() {
    const { user, apiRequest } = useAuth()
    const { toast } = useToast()
    const router = useRouter()
    const [payments, setPayments] = useState([])
    const [filteredPayments, setFilteredPayments] = useState([])
    const [claims, setClaims] = useState<Claim[]>([])
    const [contracts, setContracts] = useState<Contract[]>([])
    const [unpaidClaims, setUnpaidClaims] = useState([])
    const [users, setUsers] = useState<User[]>([])
    const [stats, setStats] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [actionType, setActionType] = useState(null)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [editingPayment, setEditingPayment] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [selectedClaim, setSelectedClaim] = useState(null)
    const [claimContracts, setClaimContracts] = useState([])
    const [availableGarages, setAvailableGarages] = useState([])
    const [isClaimLoading, setIsClaimLoading] = useState(false)
    const [filters, setFilters] = useState({
        status: "all",
        payment_method: "all",
        currency: "all",
        date_from: "",
        date_to: "",
    })

    const form = useForm({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            claim_id: "",
            contract_id: "",
            garage_id: "",
            user_id: "",
            amount: "",
            currency: "Rwf",
            payment_method: "",
            payment_code: "",
            document: "",
            status: "pending",
            transaction_reference: "",
            payment_gateway: "",
        },
    })


    const actionForm = useForm({
        defaultValues: {
            payment_gateway: "",
            gateway_response: "",
            failure_reason: "",
            refund_reason: "",
            refund_amount: "",
        },
    })

    // Fetch data
    const fetchPayments = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams()

            if (filters.status !== "all") params.append("status", filters.status)
            if (filters.payment_method !== "all") params.append("payment_method", filters.payment_method)
            if (filters.currency !== "all") params.append("currency", filters.currency)
            if (filters.date_from) params.append("date_from", filters.date_from)
            if (filters.date_to) params.append("date_to", filters.date_to)

            const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/payments?${params}`, "GET")
            if (response.success) {
                setPayments(response.data.data || response.data)
                setFilteredPayments(response.data.data || response.data)
            }
        } catch (error: any) {
            console.error("Failed to fetch payments:", error)
        } finally {
            setIsLoading(false)
        }
    }
    const fetchClaimContracts = async (claimId) => {
        try {
            setIsClaimLoading(true)
            const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/contracts/claim/${claimId}`, "GET")
            if (response.success) {
                setClaimContracts(response.data)

                if (response.data.length > 0) {
                    const contract = response.data[0] 
                    form.setValue('garage_id', contract.garage_id)
                    form.setValue('contract_id', contract.id)
                } else {
                    
                    form.setValue('garage_id', '')
                    form.setValue('contract_id', '')
                }
            }
        } catch (error) {
            console.error("Failed to fetch claim contracts:", error)
            setClaimContracts([])
        } finally {
            setIsClaimLoading(false)
        }
    }
    const fetchStats = async () => {
        try {
            const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/payments-stats`, "GET")
            if (response.success) {
                setStats(response.data)
            }
        } catch (error: any) {
            console.error("Failed to fetch stats:", error)
        }
    }

    const fetchDropdownData = async () => {
        setUsers(user.tenant.users)
        try {
            const [claimsRes, contractsRes] = await Promise.all([
                apiRequest(`${API_URL}tenants/${user.tenant_id}/payments/unpaid-claims`, "GET"),
                apiRequest(`${API_URL}tenants/${user.tenant_id}/contracts/available`, "GET"),
            ])

            if (claimsRes.success) setClaims(claimsRes.data)
            if (contractsRes.success) setContracts(contractsRes.data)

        } catch (error: any) {
            console.error("Failed to fetch dropdown data:", error)
        }
    }
    const fetchUnpaidClaims = async () => {
        try {
            const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/payments/unpaid-claims`, "GET")
            if (response.success) {
                return response.data
            }
        } catch (error) {
            console.error("Failed to fetch unpaid claims:", error)
            return []
        }
    }


    useEffect(() => {
        const loadData = async () => {
            if (user?.tenant_id) {
                await Promise.all([
                    fetchPayments(),
                    fetchStats(),
                    fetchDropdownData(),
                    fetchUnpaidClaims().then(setUnpaidClaims)
                ])
            }
        }
        loadData()
    }, [user?.tenant_id, filters])
    useEffect(() => {
        if (user?.tenant_id) {
            fetchPayments()
            fetchStats()
            fetchDropdownData()
        }
    }, [user?.tenant_id, filters])

    const handlePaymentSubmit = async (data) => {
        setIsLoading(true)

        try {
            const paymentData = {
                ...data,
                claim_id: data.claim_id || null,
                contract_id: data.contract_id || null,
                garage_id: data.garage_id || null,
            }

            let response
            if (editingPayment) {
                response = await apiRequest(
                    `${API_URL}tenants/${user.tenant_id}/payments/${editingPayment.id}`,
                    "PUT",
                    paymentData
                )
            } else {
                response = await apiRequest(
                    `${API_URL}tenants/${user.tenant_id}/payments`,
                    "POST",
                    paymentData
                )
            }

            if (response.success) {
                toast({
                    title: editingPayment ? "Payment Updated" : "Payment Created",
                    description: `Payment has been ${editingPayment ? 'updated' : 'created'} successfully.`,
                })
                setDialogOpen(false)
                setEditingPayment(null)
                form.reset()
                fetchPayments()
                fetchStats()
            } else {
                throw new Error(response.message || "Failed to save payment")
            }
        } catch (error: any) {
            console.error("Payment save error:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to save payment. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePaymentAction = async (paymentId: any, action: string, data = {}) => {
        setActionLoading(true)

        try {
            const actionData = {
                ...data,
                [`${action}ed_by`]: user.id, // processed_by, completed_by, etc.
            }

            const response = await apiRequest(
                `${API_URL}tenants/${user.tenant_id}/payments/${paymentId}/${action}`,
                "POST",
                actionData
            )

            if (response.success) {
                toast({
                    title: "Success",
                    description: `Payment ${action}ed successfully.`,
                })
                setActionDialogOpen(false)
                setSelectedPayment(null)
                setActionType(null)
                actionForm.reset()
                fetchPayments()
                fetchStats()
            } else {
                throw new Error(response.message || `Failed to ${action} payment`)
            }
        } catch (error: any) {
            console.error(`Payment ${action} error:`, error)
            toast({
                title: "Error",
                description: error.message || `Failed to ${action} payment.`,
                variant: "destructive",
            })
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm("Are you sure you want to delete this payment?")) {
            try {
                const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/payments/${paymentId}`, "DELETE")
                if (response.success) {
                    toast({
                        title: "Payment Deleted",
                        description: "Payment has been deleted successfully.",
                    })
                    fetchPayments()
                    fetchStats()
                }
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: "Failed to delete payment.",
                    variant: "destructive",
                })
            }
        }
    }
    const openAddDialog = () => {
        setEditingPayment(null)
        setSelectedClaim(null)
        setClaimContracts([])
        form.reset({
            claim_id: "",
            contract_id: "",
            garage_id: "", // Add this
            user_id: "",
            amount: "",
            currency: "USD",
            payment_method: "",
            payment_code: "",
            document: "",
            status: "pending",
            transaction_reference: "",
            payment_gateway: "",
        })
        setDialogOpen(true)
    }

    const openEditDialog = (payment) => {
        setEditingPayment(payment)
        form.reset({
            claim_id: payment.claim_id || "",
            contract_id: payment.contract_id || "",
            user_id: payment.user_id,
            amount: payment.amount.toString(),
            currency: payment.currency,
            payment_method: payment.payment_method || "",
            payment_code: payment.payment_code || "",
            document: payment.document || "",
            status: payment.status,
            transaction_reference: payment.transaction_reference || "",
            payment_gateway: payment.payment_gateway || "",
        })
        setDialogOpen(true)
    }

    const openActionDialog = (payment, action) => {
        setSelectedPayment(payment)
        setActionType(action)
        actionForm.reset()
        setActionDialogOpen(true)
    }

    const formatCurrency = (amount, currency = 'Rwf') => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: currency
        }).format(amount || 0)
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString()
    }

    const getActionButtons = (payment) => {
        const buttons = []

        if (payment.status === 'pending') {
            buttons.push(
                <Button
                    key="process"
                    variant="outline"
                    size="sm"
                    onClick={() => openActionDialog(payment, 'process')}
                    title="Process Payment"
                >
                    <Play className="h-4 w-4" />
                </Button>
            )
        }

        if (['pending', 'processing'].includes(payment.status)) {
            buttons.push(
                <Button
                    key="complete"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePaymentAction(payment.id, 'complete', {})}
                    title="Complete Payment"
                >
                    <CheckCircle className="h-4 w-4" />
                </Button>,
                <Button
                    key="fail"
                    variant="outline"
                    size="sm"
                    onClick={() => openActionDialog(payment, 'fail')}
                    title="Mark as Failed"
                >
                    <X className="h-4 w-4" />
                </Button>
            )
        }

        if (payment.status === 'completed' && payment.amount > 0) {
            buttons.push(
                <Button
                    key="refund"
                    variant="outline"
                    size="sm"
                    onClick={() => openActionDialog(payment, 'refund')}
                    title="Refund Payment"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            )
        }

        return buttons
    }

    const renderActionDialog = () => {
        if (!actionType || !selectedPayment) return null

        const handleActionSubmit = (data) => {
            handlePaymentAction(selectedPayment.id, actionType, data)
        }

        return (
            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'process' && 'Process Payment'}
                            {actionType === 'fail' && 'Mark Payment as Failed'}
                            {actionType === 'refund' && 'Refund Payment'}
                        </DialogTitle>
                        <DialogDescription>
                            Payment: {selectedPayment.transaction_reference} - {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...actionForm}>
                        <form onSubmit={actionForm.handleSubmit(handleActionSubmit)} className="space-y-4">
                            {actionType === 'process' && (
                                <>
                                    <FormField
                                        control={actionForm.control}
                                        name="payment_gateway"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Gateway</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., Stripe, PayPal" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={actionForm.control}
                                        name="gateway_response"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gateway Response</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Optional gateway response" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {actionType === 'fail' && (
                                <>
                                    <FormField
                                        control={actionForm.control}
                                        name="failure_reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Failure Reason</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Explain why the payment failed" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={actionForm.control}
                                        name="gateway_response"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gateway Response</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Optional gateway response" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {actionType === 'refund' && (
                                <>
                                    <FormField
                                        control={actionForm.control}
                                        name="refund_reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Refund Reason</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Explain why the payment is being refunded" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={actionForm.control}
                                        name="refund_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Refund Amount (Leave empty for full refund)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        max={selectedPayment.amount}
                                                        placeholder={`Max: ${selectedPayment.amount}`}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
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
                                    {actionLoading ? "Processing..." : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Payment`}
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
                role: user.role.name + ' @ ' + user.tenant.name,
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
                        <h1 className="text-3xl font-bold">Payments Management</h1>
                        <p className="text-muted-foreground mt-2">Manage insurance claim payments and transactions</p>
                    </div>
                    
                    <Button onClick={openAddDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Payment
                    </Button>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="payments">All Payments</TabsTrigger>
                        <TabsTrigger value="unpaid-claims">Unpaid Claims</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_payments || 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.completed_payments || 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.pending_payments || 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(stats.total_amount)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Payments</CardTitle>
                                <CardDescription>Latest payment activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Payment #</TableHead>
                                            <TableHead>Pay Reference Code</TableHead>
                                            <TableHead>Claim</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.slice(0, 5).map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">{payment.code}</TableCell>
                                                <TableCell className="font-medium">{payment.transaction_reference}</TableCell>
                                                <TableCell>{payment.claim?.code || "N/A"}</TableCell>
                                                <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[payment.status]}>
                                                        {payment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(payment.created_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Payments</CardTitle>
                                <CardDescription>Manage all payment transactions</CardDescription>

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
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="refunded">Refunded</SelectItem>
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
                                    <div className="text-center py-8">Loading payments...</div>
                                ) : filteredPayments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500">No payments found.</p>
                                        <Button onClick={openAddDialog} className="mt-4">
                                            Create Your First Payment
                                        </Button>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Payment #</TableHead>
                                                <TableHead>Pay Reference Code</TableHead>
                                                <TableHead>Claim</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Method</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPayments.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="font-medium">{payment.code}</TableCell>
                                                    <TableCell className="font-medium">{payment.transaction_reference}</TableCell>
                                                    <TableCell>{payment.claim?.code || "N/A"}</TableCell>
                                                    <TableCell>{payment.user?.first_name} {payment.user?.last_name}</TableCell>
                                                    <TableCell>
                                                        <span className={payment.amount < 0 ? "text-red-600" : ""}>
                                                            {formatCurrency(payment.amount, payment.currency)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{payment.payment_method || "N/A"}</TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[payment.status]}>
                                                            {payment.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{formatDate(payment.created_at)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {getActionButtons(payment)}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(payment)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeletePayment(payment.id)}
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

                    <TabsContent value="unpaid-claims">
                        <Card>
                            <CardHeader>
                                <CardTitle>Unpaid Claims</CardTitle>
                                <CardDescription>Claims that require payment or have outstanding balances</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {unpaidClaims.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                                        <p className="text-gray-500">All claims are fully paid!</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Claim Code</TableHead>
                                                <TableHead>Total Amount</TableHead>
                                                <TableHead>Amount Paid</TableHead>
                                                <TableHead>Remaining</TableHead>
                                                <TableHead>Progress</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {unpaidClaims.map((claim) => (
                                                <TableRow key={claim.id}>
                                                    <TableCell className="font-medium">{claim.code}</TableCell>
                                                    <TableCell>{formatCurrency(claim.total_amount, claim.currency)}</TableCell>
                                                    <TableCell>{formatCurrency(claim.amount_paid, claim.currency)}</TableCell>
                                                    <TableCell className="text-red-600">
                                                        {formatCurrency(claim.remaining_amount, claim.currency)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${claim.payment_percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm text-gray-600">{claim.payment_percentage}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={claim.is_unpaid ? "destructive" : "secondary"}>
                                                            {claim.is_unpaid ? "Unpaid" : "Partial"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                // Auto-fill payment form with claim data
                                                                form.reset({
                                                                    claim_id: claim.id,
                                                                    amount: claim.remaining_amount.toString(),
                                                                    currency: claim.currency,
                                                                    status: "pending",
                                                                    user_id: user.id,
                                                                })
                                                                setDialogOpen(true)
                                                            }}
                                                        >
                                                            Create Payment
                                                        </Button>
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

                {/* Payment Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingPayment ? "Edit Payment" : "Create New Payment"}</DialogTitle>
                            <DialogDescription>
                                {editingPayment ? "Update payment information" : "Enter the details for the new payment"}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handlePaymentSubmit)} className="space-y-4">
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
                                        name="claim_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Claim</FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value)
                                                        if (value) {
                                                            // Find selected claim
                                                            const claim = claims.find(c => c.id === value)
                                                            setSelectedClaim(claim)

                                                            // Fetch contracts for this claim
                                                            fetchClaimContracts(value)

                                                            // Auto-fill amount if claim has remaining amount
                                                            if (claim?.remaining_amount) {
                                                                form.setValue('amount', claim.remaining_amount.toString())
                                                            }
                                                            if (claim?.currency) {
                                                                form.setValue('currency', claim.currency)
                                                            }
                                                        } else {
                                                            setSelectedClaim(null)
                                                            setClaimContracts([])
                                                            form.setValue('garage_id', '')
                                                            form.setValue('contract_id', '')
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
                                                                    {claim.remaining_amount && (
                                                                        <span className="text-xs text-gray-500">
                                                                            Remaining: {formatCurrency(claim.remaining_amount, claim.currency)}
                                                                        </span>
                                                                    )}
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

                                {/* Garage Selection - Smart Logic */}
                                {selectedClaim && (
                                    <div className="space-y-2">
                                        <Label>Garage Selection</Label>
                                        {isClaimLoading ? (
                                            <div className="text-sm text-gray-500">Loading claim contracts...</div>
                                        ) : claimContracts.length > 0 ? (
                                            <div className="space-y-2">
                                                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                                                    ✓ This claim has a contract with {claimContracts[0].garage?.name}
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="garage_id"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Garage (From Contract)</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {claimContracts.map((contract) => (
                                                                        <SelectItem key={contract.garage_id} value={contract.garage_id}>
                                                                            {contract.garage?.name} (Contract: {contract.code})
                                                                        </SelectItem>
                                                                    ))}
                                                                    <SelectItem value="">⚠️ Pay to different garage</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Show other garages if user wants to pay different garage */}
                                                {!form.watch('garage_id') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="garage_id"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Select Different Garage</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Choose garage" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {garages.map((garage) => (
                                                                            <SelectItem key={garage.id} value={garage.id}>
                                                                                {garage.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                                    ⚠️ This claim has no contracts yet. Please select a garage to pay.
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="garage_id"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Select Garage</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Choose garage to pay" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {garages.map((garage) => (
                                                                        <SelectItem key={garage.id} value={garage.id}>
                                                                            {garage.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD</SelectItem>
                                                        <SelectItem value="EUR">EUR</SelectItem>
                                                        <SelectItem value="GBP">GBP</SelectItem>
                                                        <SelectItem value="RWF">RWF</SelectItem>
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
                                                        <SelectItem value="processing">Processing</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="failed">Failed</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
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
                                        name="payment_method"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Method</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Mobile Pay, Bank Transfer,...." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="payment_gateway"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Gateway/Provider</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., MoMo Pay, Airtel Money, BK, Equity,..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="transaction_reference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transaction Reference from Payment Gateway/Provider</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Transaction Ref #, TxId..." {...field} />
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
                                        {isLoading ? "Saving..." : editingPayment ? "Update Payment" : "Create Payment"}
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