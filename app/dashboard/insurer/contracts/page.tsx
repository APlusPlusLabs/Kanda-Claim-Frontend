"use client"
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Building2, FileText, CreditCard, FileCheck, Plus, Edit, Trash2,
  CheckCircle, Calendar, DollarSign, X, Eye, Download,
  Car, Wrench, Handshake, Users,
  ListOrdered
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

// Contract form schema
const contractSchema = z.object({
  contract_type: z.string().min(1, "Contract type is required"),
  contractable_type: z.string().min(1, "Contractable type is required"),
  contractable_id: z.string().min(1, "Contractable item is required"),
  contract_draft_id: z.string().optional(),
  terms: z.string().optional(),
  document: z.string().optional(),
  status: z.enum(["draft", "active", "completed", "cancelled", "expired"]),
  contract_value: z.string().transform((val) => val === "" ? undefined : Number(val)).pipe(z.number().min(0).optional()),
  expires_at: z.string().optional(),
  signed_at: z.string().optional(),
  auto_renew: z.boolean().default(false),
  renewal_notice_days: z.number().default(30),
})

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  expired: "bg-orange-100 text-orange-800",
}

const contractTypeIcons = {
  claims: Car,
  bids: Wrench,
  garages: Building2,
  vendors: Handshake,
  tenants: Users,
}

const contractTypeLabels = {
  claims: "Claims",
  bids: "Repair Bids",
  garages: "Garage Partnerships",
  vendors: "Vendor Services",
  tenants: "Insurance Companies",
}

export default function FlexibleContractsPage() {
  const { user, apiRequest } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [contracts, setContracts] = useState([])
  const [contractsByType, setContractsByType] = useState({})
  const [contractDrafts, setContractDrafts] = useState([])
  const [availableItems, setAvailableItems] = useState([])
  const [stats, setStats] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContract, setEditingContract] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedContractType, setSelectedContractType] = useState("")

  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)

  const [contractDraftsByType, setContractDraftsByType] = useState({})
  const [selectedContractable, setSelectedContractable] = useState(null)


  const form = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contract_type: "",
      contractable_type: "",
      contractable_id: "",
      contract_draft_id: "",
      terms: "",
      document: "",
      status: "draft",
      contract_value: "",
      expires_at: "",
      signed_at: "",
      auto_renew: false,
      renewal_notice_days: 30,
    },
  })


  // fetch Contract Drafts function group by type
  const fetchContractDrafts = async (contractType = null) => {
    try {
      const endpoint = contractType
        ? `${API_URL}tenants/${user.tenant_id}/contract-drafts/${contractType}`
        : `${API_URL}tenants/${user.tenant_id}/contract-drafts`

      const response = await apiRequest(endpoint, "GET")
      if (response.success) {
        const drafts = response.data.data || response.data
        if (contractType) {
          setContractDraftsByType(prev => ({
            ...prev,
            [contractType]: drafts
          }))
        } else {
          // Group all drafts by type
          const grouped = drafts.reduce((acc, draft) => {
            if (!acc[draft.type]) acc[draft.type] = []
            acc[draft.type].push(draft)
            return acc
          }, {})
          setContractDraftsByType(grouped)
        }
      }
    } catch (error) {
      console.error("Failed to fetch contract drafts:", error)
    }
  }

  // fetch drafts when contract type changes
  useEffect(() => {
    const contractType = form.watch("contract_type")
    if (contractType) {
      fetchContractDrafts(contractType)
    }
  }, [form.watch("contract_type")])
  // Fetch functions
  const fetchContracts = async () => {
    try {
      setIsLoading(true)
      const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/contracts`, "GET")
      if (response.success) {
        const contractsData = response.data.data || response.data
        setContracts(contractsData)

        // Group contracts by type
        const grouped = contractsData.reduce((acc, contract) => {
          const type = contract.contract_type
          if (!acc[type]) acc[type] = []
          acc[type].push(contract)
          return acc
        }, {})
        setContractsByType(grouped)
      }
    } catch (error) {
      console.error("Failed to fetch contracts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch contracts",
        variant: "destructive",
      })
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
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  // const fetchContractDrafts = async () => {
  //   try {
  //     const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/contract-drafts`, "GET")
  //     if (response.success) {
  //       setContractDrafts(response.data.data || response.data)
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch contract drafts:", error)
  //   }
  // }

  const fetchAvailableItems = async (contractableType: string) => {
    if (!contractableType) return

    try {
      const response = await apiRequest(`${API_URL}tenants/${user.tenant_id}/contracts/available-items/${contractableType}`, "GET")
      if (response.success) {
        setAvailableItems(response.data.data || response.data)
      }
    } catch (error) {
      console.error("Failed to fetch available items:", error)
    }
  }

  // Effects
  useEffect(() => {
    if (user?.tenant_id) {
      fetchContracts()
      fetchStats()
      fetchContractDrafts()
    }
  }, [user?.tenant_id])

  useEffect(() => {
    const contractableType = form.watch("contractable_type")
    if (contractableType) {
      fetchAvailableItems(contractableType)
    }
  }, [form.watch("contractable_type")])

  // Contract actions
  const handleContractSubmit = async (data: { contract_value: any }) => {
    setIsLoading(true)

    try {
      const contractData = {
        ...data,
        user_id: user.id,
        created_by: user.id,
        contract_value: data.contract_value || null,
        tenant_id: user.tenant_id,
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
    } catch (error) {
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
    } catch (error) {
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
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete contract.",
          variant: "destructive",
        })
      }
    }
  }
  // opening contract details
  const openDetailsModal = (contract: any) => {
    setSelectedContract(contract)
    setDetailsModalOpen(true)
  }
  // Dialog handlers
  const openAddDialog = () => {
    setEditingContract(null)
    form.reset({
      contract_type: "",
      contractable_type: "",
      contractable_id: "",
      contract_draft_id: "",
      terms: "",
      document: "",
      status: "draft",
      contract_value: "",
      expires_at: "",
      signed_at: "",
      auto_renew: false,
      renewal_notice_days: 30,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (contract: any) => {
    setEditingContract(contract)
    form.reset({
      contract_type: contract.contract_type || "",
      contractable_type: contract.contractable_type || "",
      contractable_id: contract.contractable_id || "",
      contract_draft_id: contract.contract_draft_id || "",
      terms: contract.terms || "",
      document: contract.document || "",
      status: contract.status,
      contract_value: contract.contract_value?.toString() || "",
      expires_at: contract.expires_at || "",
      signed_at: contract.signed_at || "",
      auto_renew: contract.auto_renew || false,
      renewal_notice_days: contract.renewal_notice_days || 30,
    })
    setDialogOpen(true)
  }

  // Utility functions
  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount || 0)
  }

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getContractTypeStats = () => {
    const types = Object.keys(contractsByType)
    return types.map(type => ({
      type,
      count: contractsByType[type]?.length || 0,
      active: contractsByType[type]?.filter(c => c.status === 'active').length || 0,
      value: contractsByType[type]?.reduce((sum, c) => sum + (Number(c.contract_value) || 0), 0) || 0
    }))
  }

  const availableContractTypes = Object.keys(contractsByType).length > 0
    ? Object.keys(contractsByType)
    : ['claims', 'bids', 'garages', 'vendors']
  const ContractFormFields = () => {
    const contractType = form.watch("contract_type")
    const contractableType = form.watch("contractable_type")
    const contractDraftId = form.watch("contract_draft_id")

    return (
      <div className="space-y-6">
        {/* Contract Type Selection */}
        <FormField
          control={form.control}
          name="contract_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  form.setValue("contractable_type", value)
                  form.setValue("contractable_id", "")
                  form.setValue("contract_draft_id", "")
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="claims">Claims</SelectItem>
                  <SelectItem value="bids">Repair Bids</SelectItem>
                  <SelectItem value="garages">Garage Partnerships</SelectItem>
                  <SelectItem value="vendors">Vendor Services</SelectItem>
                  <SelectItem value="tenants">Insurance Companies</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Related Item Selection */}
        {contractType && (
          <FormField
            control={form.control}
            name="contractable_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select {contractTypeLabels[contractType]} Item</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    const selected = availableItems.find(item => item.id === value)
                    setSelectedContractable(selected)
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${contractTypeLabels[contractType]} item`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name || item.claim_number || item.bid_number || item.code || item.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        {/* Contract Draft Selection */}
        {contractType && contractDraftsByType[contractType] && (
          <FormField
            control={form.control}
            name="contract_draft_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Template</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contractDraftsByType[contractType].map((draft) => (
                      <SelectItem key={draft.id} value={draft.id}>
                        {draft.name} (v{draft.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        {/* Contract Value */}
        <FormField
          control={form.control}
          name="contract_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Value (RWF)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter contract value" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms */}
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Terms</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter contract terms and conditions"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
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

        {/* Expiration Date */}
        <FormField
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Auto Renewal */}
        <FormField
          control={form.control}
          name="auto_renew"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Auto Renewal</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Automatically renew this contract when it expires
                </div>
              </div>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Renewal Notice Days */}
        {form.watch("auto_renew") && (
          <FormField
            control={form.control}
            name="renewal_notice_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Renewal Notice Days</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="30"
                    min="1"
                    max="365"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    )
  }
  const ContractDialog = () => (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingContract ? "Edit Contract" : "Create New Contract"}
          </DialogTitle>
          <DialogDescription>
            {editingContract
              ? "Update the contract details below."
              : "Create a new contract by selecting the type and related item."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleContractSubmit)} className="space-y-6">
            {/* Contract Type Selection */}
            <FormField
              control={form.control}
              name="contract_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue("contractable_type", value)
                      form.setValue("contractable_id", "")
                      form.setValue("contract_draft_id", "")
                      setSelectedContractable(null)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="claims">Claims</SelectItem>
                      <SelectItem value="bids">Repair Bids</SelectItem>
                      <SelectItem value="garages">Garage Partnerships</SelectItem>
                      <SelectItem value="vendors">Vendor Services</SelectItem>
                      <SelectItem value="tenants">Insurance Companies</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Related Item Selection */}
            {form.watch("contract_type") && (
              <FormField
                control={form.control}
                name="contractable_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select {contractTypeLabels[form.watch("contract_type")]} Item</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        const selected = availableItems.find(item => item.id === value)
                        setSelectedContractable(selected)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${contractTypeLabels[form.watch("contract_type")]} item`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name || item.claim_number || item.bid_number || item.code || item.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Contract Draft Selection */}
            {form.watch("contract_type") && contractDraftsByType[form.watch("contract_type")] && (
              <FormField
                control={form.control}
                name="contract_draft_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Template</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contractDraftsByType[form.watch("contract_type")].map((draft) => (
                          <SelectItem key={draft.id} value={draft.id}>
                            {draft.name} (v{draft.version})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Contract Value */}
            <FormField
              control={form.control}
              name="contract_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Value (RWF)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter contract value"
                      min="0"
                      step="0.01"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Terms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter contract terms and conditions"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expiration Date */}
              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Signed Date */}
              <FormField
                control={form.control}
                name="signed_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signed Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Auto Renewal Settings */}
            <div className="space-y-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name="auto_renew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto Renewal</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Automatically renew this contract when it expires
                      </div>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("auto_renew") && (
                <FormField
                  control={form.control}
                  name="renewal_notice_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renewal Notice Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          min="1"
                          max="365"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
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
  )

  // Update the table rendering for contract type tabs
  const renderContractTypeTable = (contracts: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contract Code</TableHead>
          <TableHead>Related Item</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract) => (
          <TableRow key={contract.id}>
            <TableCell className="font-medium">{contract.code}</TableCell>
            <TableCell>
              {contract.contractable?.name ||
                contract.contractable?.claim_number ||
                contract.contractable?.bid_number ||
                contract.contractable?.code ||
                'N/A'}
            </TableCell>
            <TableCell>
              <Badge className={statusColors[contract.status]}>
                {contract.status}
              </Badge>
            </TableCell>
            <TableCell>{formatCurrency(contract.contract_value)}</TableCell>
            <TableCell>{formatDate(contract.created_at)}</TableCell>
            <TableCell>{formatDate(contract.expires_at)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(contract)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {contract.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContractAction(contract.id, 'sign')}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {contract.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContractAction(contract.id, 'complete')}
                    disabled={actionLoading}
                  >
                    <FileCheck className="h-4 w-4" />
                  </Button>
                )}
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
  )
  // Add this component before the return statement
  const ContractDetailsModal = ({ contract, isOpen, onClose }) => {
    if (!contract) return null

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Details - {contract.code}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Contract Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Contract Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Type</dt>
                    <dd className="font-medium">{contractTypeLabels[contract.contract_type]}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Status</dt>
                    <dd>
                      <Badge className={statusColors[contract.status]}>
                        {contract.status}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Value</dt>
                    <dd className="font-medium">{formatCurrency(contract.contract_value)}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Important Dates</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Created</dt>
                    <dd className="font-medium">{formatDate(contract.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Signed</dt>
                    <dd className="font-medium">{formatDate(contract.signed_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Expires</dt>
                    <dd className="font-medium">{formatDate(contract.expires_at)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Related Item Information */}
            {contract.contractable && (
              <div>
                <h3 className="font-semibold mb-2">Related {contractTypeLabels[contract.contract_type]} Information</h3>
                <Card>
                  <CardContent className="pt-6">
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-muted-foreground">Name/Number</dt>
                        <dd className="font-medium">
                          {contract.contractable.name ||
                            contract.contractable.claim_number ||
                            contract.contractable.bid_number ||
                            contract.contractable.code}
                        </dd>
                      </div>
                      {contract.contractable.description && (
                        <div>
                          <dt className="text-sm text-muted-foreground">Description</dt>
                          <dd className="font-medium">{contract.contractable.description}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Contract Terms */}
            {contract.terms && (
              <div>
                <h3 className="font-semibold mb-2">Contract Terms</h3>
                <Card>
                  <CardContent className="pt-6">
                    <p className="whitespace-pre-wrap">{contract.terms}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Auto Renewal Settings */}
            {contract.auto_renew && (
              <div>
                <h3 className="font-semibold mb-2">Auto Renewal Settings</h3>
                <Card>
                  <CardContent className="pt-6">
                    <p>This contract will automatically renew {contract.renewal_notice_days} days before expiration.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
            {contract.document && (
              <Button onClick={() => window.open(contract.document, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
  // Add this component for bulk operations
  const BulkActionsBar = ({ selectedContracts, onAction }) => {
    if (selectedContracts.length === 0) return null

    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedContracts.length} contract{selectedContracts.length > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('export', selectedContracts)}
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('archive', selectedContracts)}
          >
            Archive
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onAction('delete', selectedContracts)}
          >
            Delete
          </Button>
        </div>
      </div>
    )
  }
  // Add this component for search and filtering
  const ContractFilters = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
      search: '',
      status: '',
      type: '',
      dateRange: { from: null, to: null }
    })

    const handleFilterChange = (key, value) => {
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      onFilterChange(newFilters)
    }

    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search contracts..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full"
            />
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {Object.entries(contractTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setFilters({
              search: '',
              status: '',
              type: '',
              dateRange: { from: null, to: null }
            })}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    )
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
            <p className="text-muted-foreground mt-2">Manage all types of contracts and agreements</p>
          </div>
          <Button onClick={() => { router.push('/dashboard/insurer/contracts/drafts') }}>
            <ListOrdered className="h-4 w-4 mr-2" />
            Contract Drafts
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Contract
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {availableContractTypes.map((type) => {
              const Icon = contractTypeIcons[type] || FileText
              return (
                <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {contractTypeLabels[type] || type}
                </TabsTrigger>
              )
            })}
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
                  <div className="text-2xl font-bold">{formatCurrency(stats.total_value)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Contract Types Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
              {getContractTypeStats().map((typeStats) => {
                const Icon = contractTypeIcons[typeStats.type] || FileText
                return (
                  <Card key={typeStats.type}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {contractTypeLabels[typeStats.type] || typeStats.type} Contract(s)
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{typeStats.count}</div>
                      <p className="text-xs text-muted-foreground">
                        {typeStats.active} active • {formatCurrency(typeStats.value)}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Recent Contracts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Contracts</CardTitle>
                <CardDescription>Latest contract activities across all types</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.slice(0, 10).map((contract) => {
                      const Icon = contractTypeIcons[contract.contract_type] || FileText
                      return (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.code}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {contractTypeLabels[contract.contract_type] || contract.contract_type}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[contract.status]}>
                              {contract.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(contract.contract_value)}</TableCell>
                          <TableCell>{formatDate(contract.created_at)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contract Type Specific Tabs */}
          {availableContractTypes.map((type) => (
            <TabsContent key={type} value={type}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {React.createElement(contractTypeIcons[type] || FileText, { className: "h-5 w-5" })}
                    {contractTypeLabels[type] || type} Contracts
                  </CardTitle>
                  <CardDescription>
                    Manage contracts for {contractTypeLabels[type]?.toLowerCase() || type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Loading contracts...</div>
                  ) : !contractsByType[type] || contractsByType[type].length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No {type} contracts found.</p>
                      <Button onClick={openAddDialog} className="mt-4">
                        Create Your First {contractTypeLabels[type]} Contract
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contract Code</TableHead>
                          <TableHead>Related Item</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractsByType[type].map((contract) => (
                          <TableRow key={contract.id}>
                            <TableCell className="font-medium">{contract.code}</TableCell>
                            <TableCell>
                              {contract.contractable?.name ||
                                contract.contractable?.claim_number ||
                                contract.contractable?.bid_number ||
                                contract.contractable?.code ||
                                'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[contract.status]}>
                                {contract.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(contract.contract_value)}</TableCell>
                            <TableCell>{formatDate(contract.expires_at)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDetailsModal(contract)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(contract)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {contract.status === 'draft' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleContractAction(contract.id, 'sign')}
                                    disabled={actionLoading}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {contract.status === 'active' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleContractAction(contract.id, 'complete')}
                                    disabled={actionLoading}
                                  >
                                    <FileCheck className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
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
          ))}
        </Tabs>

        {/* Contract Form Dialog */}
        <ContractDialog />

        {/* Contract Details Modal */}
        <ContractDetailsModal
          contract={selectedContract}
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false)
            setSelectedContract(null)
          }}
        />
      </div>
    </DashboardLayout>
  )
}