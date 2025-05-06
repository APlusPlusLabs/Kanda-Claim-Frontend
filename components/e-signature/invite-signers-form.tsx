"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, MoveUp, MoveDown, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Signer {
  name: string
  email: string
  role: string
}

interface InviteSignersFormProps {
  onAddSigner: (signer: Signer) => void
  onRemoveSigner: (index: number) => void
  signers: Signer[]
  workflowType: "sequential" | "parallel"
}

export function InviteSignersForm({ onAddSigner, onRemoveSigner, signers, workflowType }: InviteSignersFormProps) {
  const { toast } = useToast()
  const [newSigner, setNewSigner] = useState<Signer>({
    name: "",
    email: "",
    role: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleInputChange = (field: keyof Signer, value: string) => {
    setNewSigner((prev) => ({ ...prev, [field]: value }))

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAddSigner = () => {
    const newErrors: Record<string, string> = {}

    if (!newSigner.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!newSigner.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(newSigner.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!newSigner.role.trim()) {
      newErrors.role = "Role is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Check for duplicate email
    if (signers.some((signer) => signer.email === newSigner.email)) {
      setErrors({ email: "This email is already added" })
      return
    }

    onAddSigner(newSigner)
    setNewSigner({ name: "", email: "", role: "" })
    setErrors({})
  }

  const handleMoveSigner = (index: number, direction: "up" | "down") => {
    if (workflowType !== "sequential") return

    const newSigners = [...signers]
    if (direction === "up" && index > 0) {
      ;[newSigners[index], newSigners[index - 1]] = [newSigners[index - 1], newSigners[index]]
    } else if (direction === "down" && index < signers.length - 1) {
      ;[newSigners[index], newSigners[index + 1]] = [newSigners[index + 1], newSigners[index]]
    }

    // Update the signers list by removing all and adding the reordered list
    signers.forEach((_, i) => onRemoveSigner(0))
    newSigners.forEach((signer) => onAddSigner(signer))
  }

  const handleSendTestEmail = (email: string) => {
    toast({
      title: "Test email sent",
      description: `A test invitation email has been sent to ${email}`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter name"
              value={newSigner.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={newSigner.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={newSigner.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger id="role" className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Claims Manager">Claims Manager</SelectItem>
                <SelectItem value="Finance Director">Finance Director</SelectItem>
                <SelectItem value="Chief Operations Officer">Chief Operations Officer</SelectItem>
                <SelectItem value="Legal Advisor">Legal Advisor</SelectItem>
                <SelectItem value="Risk Manager">Risk Manager</SelectItem>
                <SelectItem value="Underwriting Manager">Underwriting Manager</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
          </div>
        </div>
        <Button onClick={handleAddSigner} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Signer
        </Button>
      </div>

      {signers.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Signers ({signers.length})</h3>
          <div className="space-y-3">
            {signers.map((signer, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 flex-1">
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
                    <div className="flex items-center space-x-2">
                      {workflowType === "sequential" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMoveSigner(index, "up")}
                            disabled={index === 0}
                            title="Move up"
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMoveSigner(index, "down")}
                            disabled={index === signers.length - 1}
                            title="Move down"
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSendTestEmail(signer.email)}
                        title="Send test email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onRemoveSigner(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {workflowType === "sequential" && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Note:</strong> In sequential workflow, signers will be notified in the order listed above.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
