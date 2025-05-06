"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Mail, RefreshCw } from "lucide-react"

interface EmailVerificationProps {
  email: string
  onVerificationComplete: () => void
}

export function EmailVerification({ email, onVerificationComplete }: EmailVerificationProps) {
  const { toast } = useToast()
  const [otpSent, setOtpSent] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  // Handle countdown timer
  useEffect(() => {
    if (otpSent && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpSent, countdown])

  const handleSendOtp = () => {
    setIsResending(true)

    // Simulate sending OTP
    setTimeout(() => {
      setIsResending(false)
      setOtpSent(true)
      setCountdown(60)

      // For demo purposes, show the OTP in a toast
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${email}. For demo purposes, the code is 123456.`,
      })
    }, 1500)
  }

  const handleResendOtp = () => {
    if (countdown > 0) return
    handleSendOtp()
  }

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]

    // Handle paste event (multiple digits)
    if (value.length > 1) {
      const digits = value.split("").slice(0, 6 - index)
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit
        }
      })
      setOtp(newOtp)

      // Focus on the next empty input or the last input
      const nextIndex = Math.min(index + digits.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    // Handle single digit
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp]
        newOtp[index - 1] = ""
        setOtp(newOtp)
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("")

    if (enteredOtp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits of the verification code.",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)

    // Simulate OTP verification (for demo, accept 123456 or any 6 digits)
    setTimeout(() => {
      setIsVerifying(false)

      // For demo purposes, accept any 6-digit code
      if (enteredOtp === "123456" || true) {
        onVerificationComplete()
      } else {
        toast({
          title: "Invalid OTP",
          description: "The verification code you entered is incorrect. Please try again.",
          variant: "destructive",
        })
      }
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex items-start">
          <Mail className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Email Verification Required</h3>
            <p className="text-xs text-blue-700 mt-1">
              For security purposes, we need to verify your identity before you can sign this document.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={email} disabled className="bg-gray-50" />
        </div>

        {!otpSent ? (
          <Button onClick={handleSendOtp} disabled={isResending} className="w-full">
            {isResending ? "Sending..." : "Send Verification Code"}
          </Button>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp">Enter Verification Code</Label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                A 6-digit verification code has been sent to your email address.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Button
                variant="outline"
                onClick={handleResendOtp}
                disabled={countdown > 0 || isResending}
                className="sm:w-auto"
              >
                {countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </Button>
              <Button
                onClick={handleVerifyOtp}
                disabled={otp.join("").length !== 6 || isVerifying}
                className="sm:w-auto"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          For demo purposes, the verification code is <span className="font-bold">123456</span>
        </p>
      </div>
    </div>
  )
}
