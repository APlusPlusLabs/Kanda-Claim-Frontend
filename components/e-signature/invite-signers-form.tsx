"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, MoveUp, MoveDown, Mail, Building2, Search, UserPlus, UserCog, Shield, Users, UserCheck, UserX, HousePlus, FileText, Wrench, Edit, ArrowBigRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Role, User } from "@/lib/types/users"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/lib/auth-provider"
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
const userFormSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  department_id: z.string().uuid(),
  role: z.string().min(1, "Role is required"),
});
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
  users: User[],
  roles: Role[]
}

export function InviteSignersForm({ onAddSigner, onRemoveSigner, signers, workflowType, users, roles }: InviteSignersFormProps) {
  const { toast } = useToast()
  const [newSigner, setNewSigner] = useState<Signer>({
    name: "",
    email: "",
    role: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedUserToAddSigner, setSelectedUserToAddSigner] = useState()
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const { user, apiRequest, logout } = useAuth();
  // Form setup
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "Password123",
      role: "",
      department_id: "",
    },
  });
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
  const handleSelectedASigner = (signerId: string) => {
    const user = users.find(u => u.id + "" === signerId + "")
    if (user) {
      setNewSigner({ name: user.name, email: user.email, role: user.role.name })
    }
  }
  const onSubmit = async (values: z.infer<typeof userFormSchema>) => {
    try {
    const newUser = await apiRequest(`${API_URL}users/store`, "POST", {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      role_id: values.role,
      department_id: values.department_id,
      garage_id: null,
      tenant_id: user?.tenant_id
    });
    const newuser = newUser.user
   // alert(JSON.stringify(newuser))
    setNewSigner({ name: newuser.name, email: newuser.email, role: newuser.role.name });

    setIsAddUserOpen(false);
    form.reset();

    toast({
      title: "User added successfully",
      description: `${values.first_name} ${values.last_name} has been added as a ${newuser.role.name}.`,
    });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add user.",
      });
    }
  };
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="signerselect">Select Signer from users</Label>
            <Select
              value={selectedUserToAddSigner}
              onValueChange={(value) => handleSelectedASigner(value)}
            >
              <SelectTrigger id="signerselect">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent aria-multiselectable={true}>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.info} ({user.role.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-3">
            <Label htmlFor="addnewuser">Add new user if not found</Label>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new user account with appropriate role and permissions.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+250788123456" {...field} />
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
                              <Input placeholder="john.doe@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /></div>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
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
                      name="department_id"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-2">
                            <FormLabel htmlFor="department_id">Department</FormLabel>
                            <Select
                              name="department_id"
                              defaultValue={user.tenant.departments?.[0]?.id?.toString()}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                {user.tenant.departments?.map((department) => (
                                  <SelectItem key={department.id} value={department.id.toString()}>
                                    {department.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Add User</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Signer's Name"
              value={newSigner.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""} disabled
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Signer's Email"
              value={newSigner.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""} disabled
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={newSigner.role} onValueChange={(value) => handleInputChange("role", value)} disabled>
              <SelectTrigger id="role" className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Signer's Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
          </div>
          <div className="space-y-2"><br />
            <div className="space-y-2 flex flex-row items-center space-between">
              {/* <ArrowBigRight></ArrowBigRight> */}
              <Button onClick={handleAddSigner} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Signer ({newSigner.name})
              </Button></div></div>
        </div>
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
