"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { InviteSignersForm } from "@/components/e-signature/invite-signers-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Send } from "lucide-react"
import { Stepper } from "@/components/stepper"
import { Role, User } from "@/lib/types/users"
import { Claim } from "@/lib/types/claims"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
export default function NewMultiSignatureClaimPage() {
  const router = useRouter()
  const { user, apiRequest } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [claimData, setClaimData] = useState({
    title: "",
    claimId: "",
    claimCode: "",
    amount: "",
    customerEmail: "",
    description: "",
    workflowType: "sequential",
    signers: []
  });
  const [signers, setSigners] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const claimsResponse = await apiRequest(`${API_URL}claims/${user.tenant_id}/claims-with-large-amount`, "GET");
        setClaims(claimsResponse)
        const clientsResponse = await apiRequest(`${API_URL}users/by-tenant-sm-info/${user.tenant_id}`, "GET");
        const usersResponse = await apiRequest(`${API_URL}users/by-tenant/${user.tenant_id}`, "GET");
        const rolesResponse = await apiRequest(`${API_URL}roles`, "GET");
        setClients(clientsResponse);
        setUsers(usersResponse);
        setRoles(rolesResponse);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load users/roles", variant: "destructive" });
      }
    };
    fetchData();
  }, []);

  const handleClaimDataChange = (field: string, value: string) => {
    setClaimData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSigner = (signer: any) => {
    setSigners((prev) => [...prev, signer]);
  };

  const handleRemoveSigner = (index: number) => {
    setSigners((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // const formData = new FormData()
      // formData.append('title', claimData.title)
      // formData.append('claim_id', claimData.claimId)
      // formData.set('amount', claimData.amount)
      // formData.append('customerEmail', claimData.customerEmail)
      // formData.append('description', claimData.description)
      // formData.append('workflowType', claimData.workflowType)
      // formData.append('signers', JSON.stringify(signers))
      // formData.append('user_id', user.id)
      const response = await apiRequest(`${API_URL}claims/multi-signature/${user.tenant_id}`, "POST", {
        title: claimData.title,
        claim_id: claimData.claimId,
        amount: Number(claimData.amount),
        customerEmail: claimData.customerEmail,
        description: claimData.description,
        workflowType: claimData.workflowType,
        signers,
        user_id: user.id
      });
      toast({ title: "Success", description: "Multi-signature claim created" });
      router.push("/dashboard/insurer/multi-signature-claims");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: "Claim Details", description: "Enter basic claim information" },
    { title: "Add Signers", description: "Invite people to sign the claim" },
    { title: "Review & Submit", description: "Review and create the claim" },
  ];

  const isStepComplete = (step: number) => {
    if (step === 0) {
      return claimData.title && claimData.claimId && claimData.amount && claimData.customerEmail;
    }
    if (step === 1) {
      return signers.length > 0;
    }
    return true;
  };

  const canProceed = isStepComplete(currentStep);

  const handleSelectedClaim = (claimid: string) => {
    const claim = claims.find(cl => cl.id + "" === claimid + "")
    if (claim) {
      //claimData.claimId = claimid
      claimData.claimCode = claim.code
      if (claimData.title === '') {
        if (claim.vehicles) {
          const vehicle = claim.vehicles[0] ? claim.vehicles[0].model + " " + claim.vehicles[0].make : ""
          claimData.title = `${vehicle} claim for ${claim.amount}`
        } else { claimData.title = `Claim for ${claim.amount}` }
      }
      if (claimData.amount === '') { claimData.amount = claim.amount + "" }
      if (claimData.customerEmail === '') { claimData.customerEmail = claim.user.email }
      if (claimData.description === '') { claimData.description = claim.description }

      handleClaimDataChange('claimId', claimid)
    }
  }
  return (
    <DashboardLayout
      user={{
        name: user.name,
        role: user.role.name + " @ " + user.tenant.name,
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <ArrowLeft className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <ArrowLeft className="h-5 w-5" /> },
        {
          name: "Multi-Signature Claims",
          href: "/dashboard/insurer/multi-signature-claims",
          icon: <ArrowLeft className="h-5 w-5" />,
        },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create Multi-Signature Claim</h1>
            <p className="text-muted-foreground">
              Create a new claim that requires approval from multiple stakeholders
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/insurer/multi-signature-claims")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Claims
          </Button>
        </div>

        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            // Only allow clicking on completed steps or the next available step
            if (step <= currentStep || (step === currentStep + 1 && canProceed)) {
              setCurrentStep(step)
            }
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <div className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="claimId">Select the Claim that need MultiSignature</Label>
                  <Select
                    value={claimData.claimId}
                    onValueChange={(value) => handleSelectedClaim(value)}

                  >
                    <SelectTrigger id="claimId">
                      <SelectValue placeholder="Select claim" />
                    </SelectTrigger>
                    <SelectContent>
                      {claims.map((claim) => (
                        <SelectItem key={claim.id} value={claim.id}>
                          {claim.code} by {claim.user.name} for ({claim.amount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {claimData.claimId ? (
                  <div className="" >
                    <div className="space-y-2">
                      <Label htmlFor="title">Claim Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter claim title"
                        value={claimData.title}
                        onChange={(e) => handleClaimDataChange("title", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Claim Amount (RWF)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter claim amount"
                          value={claimData.amount}
                          onChange={(e) => handleClaimDataChange("amount", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Customer Email</Label>
                        <Select
                          value={claimData.customerEmail}
                          onValueChange={(value) => handleClaimDataChange("customerEmail", value)}
                        >
                          <SelectTrigger id="customerEmail">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((user) => (
                              <SelectItem key={user.email} value={user.email}>
                                {user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Claim Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter claim description"
                        rows={4}
                        value={claimData.description}
                        onChange={(e) => handleClaimDataChange("description", e.target.value)}
                      />
                    </div>
                  </div>) : 'Select Claim'}
                <div className="space-y-2">
                  <Label htmlFor="workflowType">Workflow Type</Label>
                  <Select
                    value={claimData.workflowType}
                    onValueChange={(value) => handleClaimDataChange("workflowType", value)}
                  >
                    <SelectTrigger id="workflowType">
                      <SelectValue placeholder="Select workflow type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential (In Order)</SelectItem>
                      <SelectItem value="parallel">Parallel (Any Order)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {claimData.workflowType === "sequential"
                      ? "Signers must approve in the order listed"
                      : "Signers can approve in any order"}
                  </p>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <>

                <InviteSignersForm
                  onAddSigner={handleAddSigner}
                  onRemoveSigner={handleRemoveSigner}
                  signers={signers}
                  workflowType={claimData.workflowType}
                  users={users}
                  roles={roles}
                />
              </>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Claim Information</h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Claim Title</p>
                      <p className="text-sm">{claimData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Related Claim ID</p>
                      <p className="text-sm">{claimData.claimCode}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Claim Amount</p>
                      <p className="text-sm">
                        {claimData.amount ? `${Number.parseInt(claimData.amount).toLocaleString()} RWF` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customer</p>
                      <p className="text-sm">{claimData.customerEmail}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <p className="text-sm">{claimData.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Workflow Type</p>
                      <p className="text-sm">
                        {claimData.workflowType === "sequential" ? "Sequential (In Order)" : "Parallel (Any Order)"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Signers ({signers.length})</h3>
                  <div className="mt-3 space-y-3">
                    {signers.map((signer, index) => (
                      <div key={index} className="rounded-md border p-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-sm">{signer.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p className="text-sm">{signer.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                            <p className="text-sm">{signer.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Email Preview</h3>
                  <Tabs defaultValue="email" className="mt-3">
                    <TabsList>
                      <TabsTrigger value="email">Email Invitation</TabsTrigger>
                      <TabsTrigger value="reminder">Reminder Email</TabsTrigger>
                    </TabsList>
                    <TabsContent value="email" className="border rounded-md p-4 mt-2">
                      <div className="space-y-4">
                        <div className="border-b pb-2">
                          <p className="text-sm">
                            <span className="font-medium">To:</span> {signers[0]?.email || "signer@example.com"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Subject:</span> Action Required: Sign Claim Document
                            {claimData.claimCode ? ` - ${claimData.claimCode}` : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">Dear {signers[0]?.name || "Signer"},</p>
                          <p className="text-sm mt-2">
                            You have been invited to sign a claim document for {claimData.customerEmail || "Customer Name"}.
                          </p>
                          <p className="text-sm mt-2">
                            <strong>Claim Details:</strong>
                            <br />
                            Title: {claimData.title || "Claim Title"}
                            <br />
                            ID: {claimData.claimCode || "Claim ID"}
                            <br />
                            Amount:{" "}
                            {claimData.amount ? `${Number.parseInt(claimData.amount).toLocaleString()} RWF` : "Amount"}
                          </p>
                          <div className="mt-4 bg-blue-50 p-3 rounded-md text-center">
                            <p className="text-sm font-medium text-blue-800">
                              Click the button below to review and sign:
                            </p>
                            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                              Review & Sign Document
                            </button>
                          </div>
                          <p className="text-sm mt-4">If you have any questions, please contact our support team.</p>
                          <p className="text-sm mt-4">
                            Thank you,
                            <br />
                            Kanda Insurance Team
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="reminder" className="border rounded-md p-4 mt-2">
                      <div className="space-y-4">
                        <div className="border-b pb-2">
                          <p className="text-sm">
                            <span className="font-medium">To:</span> {signers[0]?.email || "signer@example.com"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Subject:</span> Reminder: Sign Claim Document
                            {claimData.claimCode ? ` - ${claimData.claimCode}` : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">Dear {signers[0]?.name || "Signer"},</p>
                          <p className="text-sm mt-2">
                            This is a friendly reminder that your signature is still required on a claim document for{" "}
                            {claimData.customerEmail || "Customer Name"}.
                          </p>
                          <div className="mt-4 bg-yellow-50 p-3 rounded-md text-center">
                            <p className="text-sm font-medium text-yellow-800">
                              Please sign the document as soon as possible:
                            </p>
                            <button className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm">
                              Sign Now
                            </button>
                          </div>
                          <p className="text-sm mt-4">If you have any questions, please contact our support team.</p>
                          <p className="text-sm mt-4">
                            Thank you,
                            <br />
                            Kanda Insurance Team
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep > 0) {
                  setCurrentStep(currentStep - 1)
                } else {
                  router.push("/dashboard/insurer/multi-signature-claims")
                }
              }}
            >
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1)
                } else {
                  handleSubmit()
                }
              }}
              disabled={!canProceed || (currentStep === steps.length - 1 && isSubmitting)}
            >
              {currentStep < steps.length - 1 ? (
                "Next"
              ) : isSubmitting ? (
                "Creating..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create & Send Signature Invitations
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
