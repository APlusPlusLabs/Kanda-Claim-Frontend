"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"
import { useLanguage } from "@/lib/language-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/lib/types/users"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
// Form schema with tenantId for non-insurers and insuranceCompanyName for insurers

const formSchema = z
  .object({
    first_name: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    last_name: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    phone: z.string().min(10, {
      message: "Phone number must be at least 10 characters.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
    role: z.enum(["driver", "garage", "assessor", "insurer"], {
      required_error: "Please select a role.",
    }),
    tenantId: z.string().optional(), // Required for non-insurers
    insuranceCompanyName: z.string().optional(), // Required for insurers
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.role !== "insurer" || (data.role === "insurer" && data.insuranceCompanyName && data.insuranceCompanyName.length >= 2), {
    message: "Insurance company name is required and must be at least 2 characters.",
    path: ["insuranceCompanyName"],
  })
// .refine((data) => (data.role !== "insurer" && !data.tenantId), {
//   message: "Please select an insurance company.",
//   path: ["tenantId"],
// })

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage();
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { register, login, apiRequest } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isInsurer, setIsInsurer] = useState(false)
  const [tenants, setTenants] = useState<{ value: string; label: string }[]>([])
  const [authCodeDialogOpen, setAuthCodeDialogOpen] = useState(false)
  const defaultRole = searchParams.get("role") || "driver"
  const [user, setUser] = useState<User | any>();
  const [token, setToken] = useState<String | null>(null);
  const [tenantId, setTenantId] = useState<String | null>(null);
  const authCodeformSchema = z
    .object({
      authCode: z.string().min(6, {
        message: `${t('auth.codeis6')}`,
      }),
    })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: defaultRole as "driver" | "garage" | "assessor" | "insurer",
      tenantId: "",
      insuranceCompanyName: "",
    },
  })
  const authCodeForm = useForm<z.infer<typeof authCodeformSchema>>({
    resolver: zodResolver(authCodeformSchema),
    defaultValues: {
      authCode: "",
    },
  })

  // Fetch tenants from API
  useEffect(() => {
    async function fetchTenants() {
      try {
        const response = await fetch(`${API_URL}tenants`)
        const data = await response.json()
        setTenants(
          data.map((tenant: { id: string; name: string }) => ({
            value: tenant.id,
            label: tenant.name,
          }))
        )
      } catch (error) {
        console.error("Failed to fetch tenants:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error + " Failed to load insurance companies. Please try again.",
        })
      }
    }
    fetchTenants()
  }, [toast])

  // Watch role to show/hide tenantId or insuranceCompanyName field
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "role") {
        setIsInsurer(value.role === "insurer")
        if (value.role === "insurer") {
          form.setValue("tenantId", "") // Clear tenantId for insurers
        } else {
          form.setValue("insuranceCompanyName", "") // Clear insuranceCompanyName for non-insurers
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      if (values.role !== "insurer" && !values.tenantId) {
        toast({
          variant: "destructive",
          title: t('auth.select_insurance'),
          description: "Error: " + t('auth.select_insurance'),
        })
        return
      }
      await register({
        ...values,
        tenantId: values.role !== "insurer" ? values.tenantId : undefined,
        insuranceCompanyName: values.role === "insurer" ? values.insuranceCompanyName : undefined,
      })
      setAuthCodeDialogOpen(true)
      // toast({
      //   title: "Registration successful",
      //   description: "Your account has been created. You can now log in.",
      // })
      // if (values.role === "insurer") {
      // } else {
      //   router.push("/login")
      // }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: JSON.stringify(error) + " . Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  async function handleSubmitAuthCode(values: z.infer<typeof authCodeformSchema>) {
    setIsLoading(true)
    try {
      const response = await apiRequest(`${API_URL}users/check-auth-code`, "POST", { authCode: values.authCode, email: form.getValues().email.toString() })

      if (response.user.role.name === "Insurer") {
        toast({
          title: "Registration successful",
          description: "Now You have set Company Departments, Claim types & Partner garages before continueing",
        })
        //logout sesssion
        sessionStorage.removeItem("ottqen");
        sessionStorage.removeItem("sessuza");
        sessionStorage.removeItem("tenetIed");
        setUser(null);
        // await login({ ...response, redirect: false })
        const uzer = response.user
        sessionStorage.setItem("ottqen", response.token);
        setUser({
          ...uzer,
          avatar: "/placeholder.svg?height=40&width=40",
        });
        setToken(JSON.stringify(response.token))
        setTenantId(JSON.stringify(uzer.tenant_id))
        sessionStorage.setItem("sessuza", JSON.stringify(uzer));
        sessionStorage.setItem("tenetIed", JSON.stringify(uzer.tenant_id));
        window.location.assign("/dashboard/insurer/settings")
      } else {
        toast({
          title: "Registration successful",
          description: "Your account has been created. You can now log in.",
        })
        router.push("/login")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
      })
    } finally {
      setAuthCodeDialogOpen(false)
      setIsLoading(false)
    }
  }
  async function resendCode() {
    setIsLoading(true)
    try {
      const response = await apiRequest(`${API_URL}users/send-auth-code`, "POST", { email: form.getValues().email.toString() })

      if (response.role.name === "Insurer") {
        toast({
          title: "Registration successful",
          description: "Now You have set Company Departments, Claim types & Partner garages before continueing",
        })
        router.push("/settings")
      } else {
        toast({
          title: "Registration successful",
          description: "Your account has been created. You can now log in.",
        })
        router.push("/login")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
      })
    } finally {
      setAuthCodeDialogOpen(false)
      setIsLoading(false)
    }
  }

  return (<>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Enter your details to register with Kanda Claim</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mugisha" {...field} />
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
                        <Input placeholder="Nkusi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="mugisha.nkusi@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+250 788 123 456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
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
                    <FormLabel>Register as</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="garage">Garage</SelectItem>
                        <SelectItem value="assessor">Assessor</SelectItem>
                        <SelectItem value="insurer">Insurance Company</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isInsurer ? (
                <FormField
                  control={form.control}
                  name="insuranceCompanyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your insurance company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="tenantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Company</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an insurance company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.value} value={tenant.value}>
                              {tenant.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !form.formState.isValid}>
                {isLoading ? "Creating account..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
          <div className="text-sm text-center text-gray-500 mt-4">
            <Link href="/" className="text-primary hover:underline">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>

    </div>
    {/* AuthCode Dialog */}
    <Dialog open={authCodeDialogOpen} onOpenChange={setAuthCodeDialogOpen}>
      <DialogContent>
        <DialogHeader>
          {/* <DialogTitle>AuthCode</DialogTitle> */}
          <DialogDescription>{t('auth.congrats')}</DialogDescription>
        </DialogHeader>
        <Form {...authCodeForm}>
          <form onSubmit={authCodeForm.handleSubmit(handleSubmitAuthCode)} className="space-y-4">
            <FormField
              control={authCodeForm.control}
              name="authCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input type="text" min="6" max="6" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter ><div className="flex flex-col">
              <div className="flex space-x-5">
                <Button variant="outline" onClick={() => setAuthCodeDialogOpen(false)}>
                  {t('action.cancel')}
                </Button>
                <Button type="submit" disabled={authCodeForm.getValues().authCode.length < 6}>{t('auth.activate_my_account')}</Button>
              </div>
              <small className="mt-4">{t('auth.didntreceive')} <a href="#" onClick={() => resendCode()} className="underline">{t('auth.resend')}</a></small>
            </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  </>
  )
}