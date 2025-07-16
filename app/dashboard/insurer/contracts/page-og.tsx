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
import { FileText, Plus, Edit, Trash2, FileCheck, X, CheckCircle, Calendar, DollarSign, Building2, Car, CreditCard } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Claim, Contract, Garage } from "@/lib/types/claims"
import { Bid } from "@/lib/types/bidding"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

// Contract form schema
const contractSchema = z.object({
  bid_id: z.string().min(1, "Bid is required"),
  garage_id: z.string().min(1, "Garage is required"),
  claim_id: z.string().min(1, "Claim is required"),
  terms: z.string().optional(),
  document: z.string().optional(),
  status: z.enum(["draft", "active", "completed", "cancelled", "expired"]),
  contract_value: z.string().transform((val) => val === "" ? undefined : Number(val)).pipe(z.number().min(0).optional()),
  expires_at: z.string().optional(),
  signed_at: z.string().optional(),
})

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  expired: "bg-orange-100 text-orange-800",
}

export default function ContractsPage() {
  const { user, apiRequest } = useAuth()
  const { toast } = useToast()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [filteredContracts, setFilteredContracts] = useState([])
  const [bids, setBids] = useState<Bid[]>([])
  const [garages, setGarages] = useState<Garage[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [stats, setStats] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContract, setEditingContract] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    garage_id: "all",
    claim_id: "all",
  })

  const form = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      bid_id: "",
      garage_id: "",
      claim_id: "",
      terms: "",
      document: "",
      status: "draft",
      contract_value: "",
      expires_at: "",
      signed_at: "",
    },
  })

  // Fetch data
  const fetchContracts = async () => {
    try {
      setIsLoading(true)
      const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/contracts`, "GET")
      if (response.success) {
        setContracts(response.data.data || response.data)
        setFilteredContracts(response.data.data || response.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch contracts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/contracts-stats`, "GET")
      if (response.success) {
        setStats(response.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchDropdownData = async () => {
    try {
      const [claimsRes, bidsRes, garagesRes] = await Promise.all([
        apiRequest(`${API_URL}tenants/${user.tenant_id}/contracts/available-claims`, "GET"),
        apiRequest(`${API_URL}tenants/${user.tenant_id}/contracts/available-bids`, "GET"),
        apiRequest(`${API_URL}garages/${user.tenant_id}`, "GET"),
      ])

      if (claimsRes.success) setClaims(claimsRes.data)
      if (bidsRes.success) setBids(bidsRes.data)
      setGarages(garagesRes)
    } catch (error: any) {
      console.error("Failed to fetch dropdown data:", error)
    }
  }

  const fetchBidsForClaim = async (claimId: any) => {
    try {
      const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/contracts/available-bids/${claimId}`, "GET")
      if (response.success) {
        setBids(response.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch bids for claim:", error)
    }
  }

  useEffect(() => {
    if (user?.tenant_id) {
      fetchContracts()
      fetchStats()
      fetchDropdownData()
    }
  }, [user?.tenant_id])

  // Filter contracts
  useEffect(() => {
    let filtered = contracts

    if (filters.status !== "all") {
      filtered = filtered.filter(contract => contract.status === filters.status)
    }
    if (filters.garage_id !== "all") {
      filtered = filtered.filter(contract => contract.garage_id === filters.garage_id)
    }
    if (filters.claim_id !== "all") {
      filtered = filtered.filter(contract => contract.claim_id === filters.claim_id)
    }

    setFilteredContracts(filtered)
  }, [contracts, filters])

  const handleContractSubmit = async (data: { contract_value: any }) => {
    setIsLoading(true)

    try {
      const contractData = {
        ...data, user_id: user.id ,
        created_by: user.id,
        contract_value: data.contract_value || null,
      }

      let response
      if (editingContract) {
        response = await apiRequest(
          `${API_URL}tenants/${user.tenant_id}/contracts/${editingContract.id}`,
          "PUT",
          contractData
        )
      } else {
        response = await apiRequest(
          `${API_URL}tenants/${user.tenant_id}/contracts`,
          "POST",
          contractData
        )
      }

      if (response.success) {
        toast({
          title: editingContract ? "Contract Updated" : "Contract Created",
          description: `Contract has been ${editingContract ? 'updated' : 'created'} successfully.`,
        })
        setDialogOpen(false)
        setEditingContract(null)
        form.reset()
        fetchContracts()
        fetchStats()
      } else {
        throw new Error(response.message || "Failed to save contract")
      }
    } catch (error: any) {
      console.error("Contract save error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save contract. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleContractAction = async (contractId: any, action: string, data = {}) => {
    setActionLoading(true)

    try {
      const response = await apiRequest(
        `${API_URL}tenants/${user.tenant_id}/contracts/${contractId}/${action}`,
        "POST",
        { ...data, signed_by: user.id, user_id: user.id }
      )

      if (response.success) {
        toast({
          title: "Success",
          description: `Contract ${action}ed successfully.`,
        })
        fetchContracts()
        fetchStats()
      } else {
        throw new Error(response.message || `Failed to ${action} contract`)
      }
    } catch (error: any) {
      console.error(`Contract ${action} error:`, error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} contract.`,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteContract = async (contractId: any) => {
    if (window.confirm("Are you sure you want to delete this contract?")) {
      try {
        const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/contracts/${contractId}`, "DELETE")
        if (response.success) {
          toast({
            title: "Contract Deleted",
            description: "Contract has been deleted successfully.",
          })
          fetchContracts()
          fetchStats()
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete contract.",
          variant: "destructive",
        })
      }
    }
  }

  const openAddDialog = () => {
    setEditingContract(null)
    form.reset({
      bid_id: "",
      garage_id: "",
      claim_id: "",
      terms: "",
      document: "",
      status: "draft",
      contract_value: "",
      expires_at: "",
      signed_at: "",
    })
    setDialogOpen(true)
  }

  const openEditDialog = (contract) => {
    setEditingContract(contract)
    form.reset({
      bid_id: contract.bid_id,
      garage_id: contract.garage_id,
      claim_id: contract.claim_id,
      terms: contract.terms || "",
      document: contract.document || "",
      status: contract.status,
      contract_value: contract.contract_value?.toString() || "",
      expires_at: contract.expires_at || "",
      signed_at: contract.signed_at || "",
    })
    setDialogOpen(true)
  }

  const formatCurrency = (proposed_cost: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'Rwf'
    }).format(proposed_cost || 0)
  }

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <DashboardLayout
      user={{
        name: user.name,
        role: user.role.name,
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
            <h1 className="text-3xl font-bold">Contracts Management</h1>
            <p className="text-muted-foreground mt-2">Manage insurance claim repair contracts</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Contract
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contracts">All Contracts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completed || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_value} Rwf</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Contracts</CardTitle>
                <CardDescription>Latest contract activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract Code</TableHead>
                      <TableHead>Garage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.slice(0, 5).map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.code}</TableCell>
                        <TableCell>{contract.garage?.name}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[contract.status]}>
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(contract.contract_value)}</TableCell>
                        <TableCell>{formatDate(contract.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle>All Contracts</CardTitle>
                <CardDescription>Manage all insurance claim repair contracts</CardDescription>

                {/* Filters */}
                <div className="flex gap-4 mt-4">
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.garage_id}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, garage_id: value }))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by garage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Garages</SelectItem>
                      {garages.map((garage) => (
                        <SelectItem key={garage.id} value={garage.id}>
                          {garage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading contracts...</div>
                ) : filteredContracts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No contracts found.</p>
                    <Button onClick={openAddDialog} className="mt-4">
                      Create Your First Contract
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contract Code</TableHead>
                        <TableHead>Claim</TableHead>
                        <TableHead>Garage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.code}</TableCell>
                          <TableCell>{contract.claim?.code}</TableCell>
                          <TableCell>{contract.garage?.name}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[contract.status]}>
                              {contract.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(contract.contract_value)}</TableCell>
                          <TableCell>{formatDate(contract.expires_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {contract.status === 'draft' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleContractAction(contract.id, 'sign')}
                                  disabled={actionLoading}
                                >
                                  <FileCheck className="h-4 w-4" />
                                </Button>
                              )}
                              {contract.status === 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleContractAction(contract.id, 'complete')}
                                  disabled={actionLoading} title="set Contract status = COMPLETE"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {(contract.status === 'draft' || contract.status === 'active') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleContractAction(contract.id, 'cancel')}
                                  disabled={actionLoading}  title="set Contract status = Draft"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(contract)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteContract(contract.id)}
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
        </Tabs>

        {/* Contract Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContract ? "Edit Contract" : "Create New Contract"}</DialogTitle>
              <DialogDescription>
                {editingContract ? "Update contract information" : "Enter the details for the new contract"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleContractSubmit)} className="space-y-4">
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
                              fetchBidsForClaim(value)
                              form.setValue('bid_id', '')
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
                                {claim.code}
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
                    name="garage_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Garage</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select garage" />
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
                  <FormField
                    control={form.control}
                    name="bid_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Awarded Bid</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select awarded bid" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bids.map((bid) => (
                              <SelectItem key={bid.id} value={bid.id}>
                                {bid.code} - {bid.awardedSubmission?.garage?.name} - ${bid.awardedSubmission?.proposed_cost || bid.estimated_cost}
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
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
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
                    name="contract_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Value</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expires_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expires At</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter contract terms and conditions"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
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
                    {isLoading ? "Saving..." : editingContract ? "Update Contract" : "Create Contract"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout >
  )
}