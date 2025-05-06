"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SignaturePad } from "@/components/e-signature/signature-pad"
import { useToast } from "@/components/ui/use-toast"
import { EmailVerification } from "@/components/e-signature/email-verification"
import { CheckCircle2, FileText, Lock } from "lucide-react"

// Mock data for the signature request
const mockSignatureRequest = {
  id: "sig-123456",
  claimId: "CL-2023-042",
  claimTitle: "High-Value Vehicle Damage Claim",
  customerName: "Mugisha Jean",
  amount: 2500000,
  description: "Luxury vehicle damage requiring multiple approvals due to high claim amount",
  signerName: "Nkusi Emmanuel",
  signerEmail: "emmanuel@example.com",
  signerRole: "Finance Director",
  status: "pending",
}

export default function SignatureVerificationPage() {
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [signatureRequest, setSignatureRequest] = useState<typeof mockSignatureRequest | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Simulate API call to fetch signature request
    const timer = setTimeout(() => {
      setSignatureRequest(mockSignatureRequest)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.id])

  const handleSignatureChange = (newSignature: string | null) => {
    setSignature(newSignature)
  }

  const handleVerificationComplete = () => {
    setIsVerified(true)
    toast({
      title: "Email verified",
      description: "Your identity has been verified. You can now sign the document.",
    })
  }

  const handleSubmitSignature = () => {
    if (!signature) {
      toast({
        title: "Signature required",
        description: "Please draw your signature before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call to submit signature
    setTimeout(() => {
      setIsSubmitting(false)
      setIsComplete(true)
      toast({
        title: "Signature submitted",
        description: "Your signature has been successfully recorded.",
      })
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Loading Signature Request</CardTitle>
            <CardDescription>Please wait while we load your signature request...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-10">
            <div className="animate-pulse space-y-4 w-full max-w-md">
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-32 bg-gray-200 rounded w-full mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="container max-w-4xl py-10">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Signature Complete!</CardTitle>
            <CardDescription>Your signature has been successfully recorded.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <p className="mb-4">Thank you for signing the document. All parties will be notified of your approval.</p>
            <div className="border rounded-md p-4 bg-gray-50 max-w-md mx-auto">
              <p className="text-sm font-medium">Document Details:</p>
              <p className="text-sm">
                Claim: {signatureRequest?.claimTitle} ({signatureRequest?.claimId})
              </p>
              <p className="text-sm">Signed as: {signatureRequest?.signerName}</p>
              <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.close()}>Close Window</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sign Document: {signatureRequest?.claimTitle}</CardTitle>
          <CardDescription>
            You ({signatureRequest?.signerName}) have been requested to sign this document as{" "}
            {signatureRequest?.signerRole}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isVerified ? (
            <EmailVerification
              email={signatureRequest?.signerEmail || ""}
              onVerificationComplete={handleVerificationComplete}
            />
          ) : (
            <>
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="text-lg font-medium mb-2">Document Information</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Claim ID</p>
                    <p className="text-sm">{signatureRequest?.claimId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                    <p className="text-sm">{signatureRequest?.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                    <p className="text-sm">{signatureRequest?.amount.toLocaleString()} RWF</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Signing as</p>
                    <p className="text-sm">{signatureRequest?.signerRole}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{signatureRequest?.description}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="signature">Your Signature</Label>
                  <div className="flex items-center text-sm text-green-600">
                    <Lock className="h-3 w-3 mr-1" />
                    Secure
                  </div>
                </div>
                <SignaturePad onChange={handleSignatureChange} width={400} height={200} />
              </div>

              <div className="border rounded-md p-4 bg-yellow-50">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Legal Notice</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      By signing this document, you acknowledge that your electronic signature is legally binding,
                      equivalent to a handwritten signature, and you consent to conducting business electronically.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          {isVerified && (
            <Button onClick={handleSubmitSignature} disabled={!signature || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Signature"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
