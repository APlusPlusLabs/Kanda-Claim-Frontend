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
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"
import { useLanguage } from "@/lib/language-context"
import { User } from "@/lib/types/users"
import { Loader2, Mail } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";

const authCodeformSchema = z.object({
  authCode: z.string().length(6, "Activation code must be exactly 6 characters"),
  email: z.string().email("Please enter a valid email address"),
})

export default function ActivationCodePage() {
  const router = useRouter()
  const { t } = useLanguage();
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { apiRequest } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const emailFromUrl = searchParams.get("email") || ""

  const authCodeForm = useForm<z.infer<typeof authCodeformSchema>>({
    resolver: zodResolver(authCodeformSchema),
    defaultValues: {
      authCode: "",
      email: emailFromUrl,
    },
  })

  // Handle activation code submission
  async function handleSubmitAuthCode(values: z.infer<typeof authCodeformSchema>) {
    setIsLoading(true)
    try {
      const response = await apiRequest(`${API_URL}users/check-auth-code`, "POST", {
        authCode: values.authCode,
        email: values.email
      })

      // Store user session after successful activation
      sessionStorage.setItem("ottqen", response.token);
      const uzer = response.user
      sessionStorage.setItem("sessuza", JSON.stringify(uzer));
      sessionStorage.setItem("tenetIed", JSON.stringify(uzer.tenant_id));

      // Handle different user roles
      if (uzer.role.name === "Insurer") {
        toast({
          title: "Account Activated Successfully!",
          description: "Now, you need to set up Company Departments, Claim types & Partner garages",
        })
        window.location.assign("/dashboard/insurer/settings")
      } else {
        toast({
          title: "Account Activated Successfully!",
          description: "Your account has been activated. Redirecting to dashboard...",
        })
        // Redirect based on role
        const rolename = uzer.role.name.toLowerCase()
        const roleurl = rolename === 'admin' ? 'insurer' : rolename
        window.location.assign(`/dashboard/${roleurl}`)
      }
    } catch (error: any) {
      console.error("Activation error:", error)
      toast({
        variant: "destructive",
        title: "Activation Failed",
        description: error?.message || "Invalid activation code. Please check your code and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Resend activation code
  async function resendCode() {
    const email = authCodeForm.getValues().email
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address to resend the code.",
      })
      return
    }

    setIsResending(true)
    try {
      await apiRequest(`${API_URL}users/send-auth-code`, "POST", { email })

      toast({
        title: "Code Sent",
        description: "A new activation code has been sent to your email address.",
      })
    } catch (error: any) {
      console.error("Resend error:", error)
      toast({
        variant: "destructive",
        title: "Failed to Resend Code",
        description: error?.message || "There was an error resending the activation code. Please try again.",
      })
    } finally {
      setIsResending(false)
    }
  }

  // Auto-uppercase the activation code as user types
  const handleAuthCodeChange = (value: string) => {
    return value.toUpperCase()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Activate Your Account</CardTitle>
          <CardDescription>
            Enter the 6-character activation code we sent to your email inbox
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...authCodeForm}>
            <form onSubmit={authCodeForm.handleSubmit(handleSubmitAuthCode)} className="space-y-4">
              <FormField
                control={authCodeForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        readOnly={!!emailFromUrl}
                        className={emailFromUrl ? "bg-gray-50" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={authCodeForm.control}
                name="authCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activation Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter 6-character code"
                        maxLength={6}
                        className="text-center text-lg tracking-widest font-mono uppercase"
                        {...field}
                        onChange={(e) => field.onChange(handleAuthCodeChange(e.target.value))}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !authCodeForm.formState.isValid}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Activating..." : "Activate Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <Button
              variant="outline"
              onClick={resendCode}
              disabled={isResending || !authCodeForm.getValues().email}
              className="w-full"
            >
              {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isResending ? "Sending..." : "Resend Code"}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </div>
          <div className="text-sm text-center text-gray-500">
            <Link href="/" className="text-primary hover:underline">
              Back to Home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}