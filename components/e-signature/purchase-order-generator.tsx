"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SignatureInfo } from "./signature-display"
import { FileText, Download, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface PurchaseOrderGeneratorProps {
  claimId: string
  claimTitle: string
  claimAmount: number
  claimDate: Date
  approvers: SignatureInfo[]
  customerName: string
  customerAddress: string
  garageId: string
  garageName: string
}

export function PurchaseOrderGenerator({
  claimId,
  claimTitle,
  claimAmount,
  claimDate,
  approvers,
  customerName,
  customerAddress,
  garageId,
  garageName,
}: PurchaseOrderGeneratorProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  const handleGeneratePO = useCallback(() => {
    setIsGenerating(true)

    // Simulate PO generation
    setTimeout(() => {
      setIsGenerating(false)
      setIsGenerated(true)

      toast({
        title: "Purchase Order Generated",
        description: `Purchase Order PO-${claimId} has been generated successfully`,
      })
    }, 1500)
  }, [claimId, toast])

  const handleDownloadPO = useCallback(() => {
    toast({
      title: "Purchase Order Downloaded",
      description: "The purchase order has been downloaded successfully",
    })
  }, [toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Order</CardTitle>
        <CardDescription>Generate a purchase order for the approved claim</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isGenerated ? (
            <div className="p-4 border border-green-200 rounded-md bg-green-50">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-sm font-medium text-green-800">Purchase Order Generated</h3>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Purchase Order PO-{claimId} has been generated successfully.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Purchase Order Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">PO Number:</div>
                <div>PO-{claimId}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Date:</div>
                <div>{format(new Date(), "MMM d, yyyy")}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Vendor:</div>
                <div>
                  {garageName} ({garageId})
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Customer:</div>
                <div>{customerName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Claim:</div>
                <div>{claimTitle}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Amount:</div>
                <div>{claimAmount.toLocaleString()} RWF</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Approvals:</div>
                <div>{approvers.filter((a) => a.status === "approved").length} signatures</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isGenerated ? (
          <Button className="w-full" onClick={handleDownloadPO} type="button">
            <Download className="h-4 w-4 mr-2" />
            Download Purchase Order
          </Button>
        ) : (
          <Button className="w-full" onClick={handleGeneratePO} disabled={isGenerating} type="button">
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Purchase Order"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
