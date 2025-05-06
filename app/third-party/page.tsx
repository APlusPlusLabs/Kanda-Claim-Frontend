"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Search, Shield } from "lucide-react"

export default function ThirdPartyLandingPage() {
  const router = useRouter()
  const [trackingId, setTrackingId] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [trackingError, setTrackingError] = useState(false)
  const [referenceError, setReferenceError] = useState(false)

  const handleTrackClaim = (e: React.FormEvent) => {
    e.preventDefault()
    let hasError = false

    if (!trackingId.trim()) {
      setTrackingError(true)
      hasError = true
    }

    if (!referenceNumber.trim()) {
      setReferenceError(true)
      hasError = true
    }

    if (hasError) return

    // In a real app, we would validate both the tracking ID and reference number
    // For now, just redirect to the tracking page
    router.push(`/third-party/track/${trackingId}?ref=${referenceNumber}`)
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-10">
        <Shield className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Kanda Claim Third-Party Portal</h1>
        <p className="text-muted-foreground max-w-2xl">
          Welcome to the Kanda Claim third-party portal. If you've been involved in an incident with one of our
          policyholders, you can submit or track your claim here.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Track Your Claim</CardTitle>
            <CardDescription>
              Enter your claim tracking ID and reference number to check the status of your claim.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackClaim}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tracking-id">Claim Tracking ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tracking-id"
                      placeholder="e.g., TP-2025-12345"
                      value={trackingId}
                      onChange={(e) => {
                        setTrackingId(e.target.value)
                        setTrackingError(false)
                      }}
                      className={trackingError ? "border-red-500" : ""}
                    />
                  </div>
                  {trackingError && <p className="text-sm text-red-500">Please enter a valid tracking ID</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reference-number">Reference Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="reference-number"
                      placeholder="e.g., REF-12345"
                      value={referenceNumber}
                      onChange={(e) => {
                        setReferenceNumber(e.target.value)
                        setReferenceError(false)
                      }}
                      className={referenceError ? "border-red-500" : ""}
                    />
                  </div>
                  {referenceError && <p className="text-sm text-red-500">Please enter a valid reference number</p>}
                </div>

                <Button type="submit" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Track Claim
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p>
                    Your tracking ID and reference number were provided to you when your claim was linked or via
                    email/SMS.
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="text-sm text-muted-foreground">
              Need help? Contact our support at <span className="font-medium">support@kandaclaim.rw</span>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Link to Existing Claim</CardTitle>
            <CardDescription>
              If you've been involved in an incident with one of our policyholders, you can link to their existing
              claim.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button size="lg" onClick={() => router.push("/third-party/link-claim")}>
                Link to Existing Claim
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Link to an Existing Claim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Link your information to an existing claim using the claim ID and reference number provided by the
                policyholder.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Track Your Claim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use your tracking ID and reference number to monitor the status of your claim at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          For assistance, please contact our support team at <span className="font-medium">+250 788 123 456</span> or{" "}
          <span className="font-medium">support@kandaclaim.rw</span>
        </p>
      </div>
    </div>
  )
}
