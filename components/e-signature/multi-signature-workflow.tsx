"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SignaturePad } from "./signature-pad"
import { SignatureDisplay, type SignatureInfo } from "./signature-display"
import { CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MultiSignatureWorkflowProps {
  claimId: string
  claimTitle: string
  approvers?: SignatureInfo[]
  onComplete: (approvers: SignatureInfo[]) => void
  sequential: boolean
}

export function MultiSignatureWorkflow({
  claimId,
  claimTitle,
  approvers = [],
  onComplete,
  sequential,
}: MultiSignatureWorkflowProps) {
  const { toast } = useToast()
  const [workflowApprovers, setWorkflowApprovers] = useState<SignatureInfo[]>([])
  const [currentApproverIndex, setCurrentApproverIndex] = useState(0)
  const [signature, setSignature] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  const [workflowComplete, setWorkflowComplete] = useState(false)
  const [userCanAct, setUserCanAct] = useState(false)

  // Initialize approvers safely
  useEffect(() => {
    if (approvers && approvers.length > 0) {
      setWorkflowApprovers(approvers)
    }
  }, [approvers])

  // Determine if current user can act - do this in an effect, not during render
  useEffect(() => {
    let canAct = false

    if (!workflowComplete && workflowApprovers.length > 0 && currentApproverIndex < workflowApprovers.length) {
      if (sequential) {
        // In sequential, only the current approver can act
        canAct = workflowApprovers[currentApproverIndex].status === "pending"
      } else {
        // In parallel, any pending approver can act
        canAct = workflowApprovers[currentApproverIndex].status === "pending"
      }
    }

    setUserCanAct(canAct)
  }, [workflowComplete, sequential, workflowApprovers, currentApproverIndex])

  const handleSignatureChange = useCallback((newSignature: string | null) => {
    setSignature(newSignature)
  }, [])

  const handleApprove = useCallback(() => {
    if (!signature) {
      toast({
        title: "Signature Required",
        description: "Please draw your signature to approve this claim",
        variant: "destructive",
      })
      return
    }

    if (workflowApprovers.length === 0 || currentApproverIndex >= workflowApprovers.length) {
      toast({
        title: "No Approvers",
        description: "There are no approvers configured for this workflow",
        variant: "destructive",
      })
      return
    }

    setWorkflowApprovers((prevApprovers) => {
      const updatedApprovers = [...prevApprovers]
      updatedApprovers[currentApproverIndex] = {
        ...updatedApprovers[currentApproverIndex],
        status: "approved",
        signature: signature,
        timestamp: new Date(),
      }

      // Check if this was the last approver
      if (currentApproverIndex === prevApprovers.length - 1) {
        setWorkflowComplete(true)
        setTimeout(() => onComplete(updatedApprovers), 0)
      } else if (sequential) {
        // Move to next approver in sequential workflow
        setCurrentApproverIndex((prev) => prev + 1)
        setSignature(null)
      }

      // Check if all approvers have signed in parallel workflow
      if (!sequential) {
        const allSigned = updatedApprovers.every((a) => a.status !== "pending")
        if (allSigned) {
          setWorkflowComplete(true)
          setTimeout(() => onComplete(updatedApprovers), 0)
        }
      }

      // Show toast after state update
      setTimeout(() => {
        toast({
          title: "Signature Recorded",
          description: `${updatedApprovers[currentApproverIndex].name} has approved the claim`,
        })
      }, 0)

      return updatedApprovers
    })
  }, [currentApproverIndex, onComplete, sequential, signature, toast, workflowApprovers])

  const handleReject = useCallback(() => {
    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejecting this claim",
        variant: "destructive",
      })
      return
    }

    if (workflowApprovers.length === 0 || currentApproverIndex >= workflowApprovers.length) {
      toast({
        title: "No Approvers",
        description: "There are no approvers configured for this workflow",
        variant: "destructive",
      })
      return
    }

    setWorkflowApprovers((prevApprovers) => {
      const updatedApprovers = [...prevApprovers]
      updatedApprovers[currentApproverIndex] = {
        ...updatedApprovers[currentApproverIndex],
        status: "rejected",
        rejectReason: rejectReason,
        timestamp: new Date(),
      }

      setWorkflowComplete(true)

      // Use setTimeout to ensure state updates complete before callback
      setTimeout(() => {
        onComplete(updatedApprovers)

        toast({
          title: "Claim Rejected",
          description: `The claim has been rejected by ${updatedApprovers[currentApproverIndex].name}`,
          variant: "destructive",
        })
      }, 0)

      return updatedApprovers
    })
  }, [currentApproverIndex, onComplete, rejectReason, toast, workflowApprovers])

  const handleSelectApprover = useCallback(
    (index: number) => {
      if (
        !sequential &&
        !workflowComplete &&
        workflowApprovers[index] &&
        workflowApprovers[index].status === "pending"
      ) {
        setCurrentApproverIndex(index)
        setSignature(null)
        setRejectReason("")
        setIsRejecting(false)
      }
    },
    [sequential, workflowComplete, workflowApprovers],
  )

  // If there are no approvers, show a message
  if (workflowApprovers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval Process</CardTitle>
          <CardDescription>No approvers have been configured for this claim.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Please configure approvers to start the workflow.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Ensure currentApproverIndex is valid
  const safeCurrentApproverIndex = currentApproverIndex < workflowApprovers.length ? currentApproverIndex : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sequential ? "Sequential" : "Parallel"} Approval Process</CardTitle>
        <CardDescription>
          {sequential ? "Approvers must sign in order. Current approver: " : "Select an approver to act as: "}
          {workflowApprovers[safeCurrentApproverIndex]?.name} ({workflowApprovers[safeCurrentApproverIndex]?.role})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <SignatureDisplay
            signatures={workflowApprovers}
            className="mb-6"
            onSelectSignature={!sequential ? handleSelectApprover : undefined}
          />

          {userCanAct && !isRejecting && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Your Signature</h3>
                <SignaturePad onChange={handleSignatureChange} width={400} height={200} />
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1" onClick={handleApprove} disabled={!signature} type="button">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Claim
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsRejecting(true)} type="button">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Claim
                </Button>
              </div>
            </div>
          )}

          {userCanAct && isRejecting && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reject-reason">Reason for Rejection</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Please provide a detailed reason for rejecting this claim..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  type="button"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsRejecting(false)} type="button">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
