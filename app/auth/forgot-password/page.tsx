"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Loader2, KeyRound, CheckCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  resetCode: z.string().min(6, "Reset code must be 6 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { t } = useLanguage();
  const { toast } = useToast()
  const { apiRequest } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"email" | "reset">("email")
  const [emailSent, setEmailSent] = useState(false)

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      resetCode: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function handleSendResetCode(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true)
    try {
      // You'll need to create this endpoint in your backend
      await apiRequest(`${API_URL}users/send-reset-code`, "POST", {
        email: values.email
      })
      
      setEmailSent(true)
      resetPasswordForm.setValue("email", values.email)
      
      toast({
        title: "Reset Code Sent",
        description: "We've sent a password reset code to your email address.",
      })
      
      setStep("reset")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Send Reset Code",
        description: error?.message || "There was an error sending the reset code. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResetPassword(values: z.infer<typeof resetPasswordSchema>) {
    setIsLoading(true)
    try {
      // You'll need to create this endpoint in your backend
      await apiRequest(`${API_URL}users/reset-password`, "POST", {
        email: values.email,
        resetCode: values.resetCode,
        password: values.password
      })
      
      toast({
        title: "Password Reset Successfully",
        description: "Your password has been reset. You can now log in with your new password.",
      })
      
      router.push("/login")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Reset Password",
        description: error?.message || "Invalid reset code or there was an error resetting your password.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function resendResetCode() {
    const email = resetPasswordForm.getValues().email
    if (!email) return

    setIsLoading(true)
    try {
      await apiRequest(`${API_URL}users/send-reset-code`, "POST", {
        email: email
      })
      
      toast({
        title: "Code Resent",
        description: "A new reset code has been sent to your email address.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Resend Code",
        description: error?.message || "There was an error resending the reset code.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            {step === "email" ? (
              <KeyRound className="w-6 h-6 text-orange-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "email" ? "Forgot Password?" : "Reset Your Password"}
          </CardTitle>
          <CardDescription>
            {step === "email" 
              ? "Enter your email address and we'll send you a reset code"
              : "Enter the reset code and your new password"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === "email" ? (
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(handleSendResetCode)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter your email address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !forgotPasswordForm.formState.isValid}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Your email address"
                          disabled
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetPasswordForm.control}
                  name="resetCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reset Code</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="Enter 6-digit reset code"
                          maxLength={6}
                          className="text-center text-lg tracking-widest font-mono"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetPasswordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter new password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetPasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm new password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !resetPasswordForm.formState.isValid}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resendResetCode}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Resend Code
                  </Button>
                </div>
              </form>
            </Form>
          )}
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