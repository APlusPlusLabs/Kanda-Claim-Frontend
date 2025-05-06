"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Copy, Download, ArrowLeft, QrCode } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ThirdPartySuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get("trackingId")
    if (id) {
      setTrackingId(id)
      // In a real app, we would generate a QR code for the tracking URL
      // For now, we'll use a placeholder
      setQrCodeUrl(`/placeholder.svg?height=200&width=200&text=${encodeURIComponent(`Tracking ID: ${id}`)}`)
    } else {
      router.push("/third-party")
    }
  }, [searchParams, router])

  const copyToClipboard = () => {
    if (trackingId) {
      navigator.clipboard.writeText(trackingId)
      toast({
        title: "Copied to clipboard",
        description: "Tracking ID has been copied to your clipboard.",
      })
    }
  }

  const downloadQrCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = `tracking-qr-${trackingId}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Button variant="ghost" onClick={() => router.push("/third-party")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Third-Party Portal
      </Button>

      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Claim Submitted Successfully!</CardTitle>
          <CardDescription className="text-center">
            Your third-party claim has been received and is being processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="bg-muted p-4 rounded-md">
            <div className="text-center mb-2">
              <p className="text-sm text-muted-foreground">Your Tracking ID</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-xl font-bold">{trackingId}</p>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} title="Copy to clipboard">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Please save this tracking ID. You'll need it to check the status of your claim.
            </p>
          </div>

          {qrCodeUrl && (
            <div className="flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-2">Scan this QR code to track your claim</p>
              <div className="border p-2 rounded-md bg-white">
                <img src={qrCodeUrl || "/placeholder.svg"} alt="Tracking QR Code" className="w-40 h-40" />
              </div>
              <Button variant="outline" size="sm" className="mt-2" onClick={downloadQrCode}>
                <Download className="h-4 w-4 mr-2" /> Download QR Code
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-medium">What happens next?</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Our team will review your claim within 2 business days.</li>
              <li>You may be contacted for additional information or documentation.</li>
              <li>An assessor may be assigned to evaluate the damages.</li>
              <li>You'll receive updates on your claim status via your preferred contact method.</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center border-t pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            To check the status of your claim at any time, visit the Third-Party Portal and enter your tracking ID.
          </p>
          <Button onClick={() => router.push(`/third-party/track/${trackingId}`)}>
            <QrCode className="mr-2 h-4 w-4" /> Track Your Claim
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
