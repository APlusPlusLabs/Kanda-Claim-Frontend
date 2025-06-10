"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, FileText, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
export default function LinkClaimPage() {
  const router = useRouter()
  const { apiRequest } = useAuth()
  const { toast } = useToast()
  const [claimId, setClaimId] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!claimId.trim() || !referenceNumber.trim()) {
      setError("Please provide both the claim ID and reference number.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const reposnse = await apiRequest(`${API_URL}third-party-claims/link-claim`, "PUT", {claimId, referenceNumber})
      const trackingId = reposnse.tracking_id

      toast({
        title: "Claim Linked Successfully",
        description: "Your third-party claim has been linked to the existing claim.",
      })

      // Redirect to the tracking page
      router.push(`/third-party/track/${trackingId}`)
    } catch (error) {
      setError("Failed to link claim. Please check the information and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Button variant="ghost" onClick={() => router.push("/third-party")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Third-Party Portal
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Link to Existing Claim</CardTitle>
          <CardDescription>
            If you have a claim reference from the policyholder or insurance company, you can link it to your
            third-party account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                You'll need the claim ID and reference number provided by the policyholder or insurance company.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="claim-id">Claim ID</Label>
              <Input
                id="claim-id"
                placeholder="e.g., KcKLM-2025-001"
                value={claimId}
                onChange={(e) => setClaimId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference-number">Reference Number</Label>
              <Input
                id="reference-number"
                placeholder="e.g., Kc3PT-12345"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This is the reference number provided to you by the policyholder or insurance company.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Linking..." : "Link Claim"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have a reference number?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/third-party/submit")}>
              Submit a new claim
            </Button>{" "}
            instead.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
