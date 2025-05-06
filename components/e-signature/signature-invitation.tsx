"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Mail } from "lucide-react"

interface SignatureInvitationProps {
  claimId: string
  claimTitle: string
  customerName: string
  signerName: string
  signerEmail: string
  signerRole: string
}

export function SignatureInvitation({
  claimId,
  claimTitle,
  customerName,
  signerName,
  signerEmail,
  signerRole,
}: SignatureInvitationProps) {
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)

  const handleSendInvitation = () => {
    setIsSending(true)

    // Simulate sending invitation
    setTimeout(() => {
      setIsSending(false)
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${signerName} (${signerEmail})`,
      })
    }, 1500)
  }

  const handleCopyLink = () => {
    // In a real app, this would be a unique link
    navigator.clipboard.writeText(
      `https://kanda-insurance.com/sign/${claimId}?signer=${encodeURIComponent(signerEmail)}`,
    )

    toast({
      title: "Link Copied",
      description: "The signature link has been copied to your clipboard",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signature Invitation</CardTitle>
        <CardDescription>Preview and send the invitation to {signerName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList>
            <TabsTrigger value="email">Email Preview</TabsTrigger>
            <TabsTrigger value="link">Signature Link</TabsTrigger>
          </TabsList>
          <TabsContent value="email" className="border rounded-md p-4 mt-2">
            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="text-sm">
                  <span className="font-medium">To:</span> {signerEmail}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Subject:</span> Action Required: Sign Claim Document - {claimId}
                </p>
              </div>
              <div>
                <p className="text-sm">Dear {signerName},</p>
                <p className="text-sm mt-2">You have been invited to sign a claim document for {customerName}.</p>
                <p className="text-sm mt-2">
                  <strong>Claim Details:</strong>
                  <br />
                  Title: {claimTitle}
                  <br />
                  ID: {claimId}
                  <br />
                  Your Role: {signerRole}
                </p>
                <div className="mt-4 bg-blue-50 p-3 rounded-md text-center">
                  <p className="text-sm font-medium text-blue-800">Click the button below to review and sign:</p>
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
          <TabsContent value="link" className="border rounded-md p-4 mt-2">
            <div className="space-y-4">
              <p className="text-sm">Share this secure link with {signerName} to allow them to sign the document:</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  https://kanda-insurance.com/sign/{claimId}?signer={encodeURIComponent(signerEmail)}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link will expire in 7 days and can only be used once.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSendInvitation} disabled={isSending} className="w-full">
          <Mail className="mr-2 h-4 w-4" />
          {isSending ? "Sending..." : "Send Invitation"}
        </Button>
      </CardFooter>
    </Card>
  )
}
