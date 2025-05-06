"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SignatureInfo {
  id: string
  name: string
  role: string
  avatar?: string
  status: "pending" | "approved" | "rejected"
  signature?: string | null
  timestamp?: Date | null
  rejectReason?: string
}

interface SignatureDisplayProps {
  signatures: SignatureInfo[]
  className?: string
  onSelectSignature?: (index: number) => void
}

export function SignatureDisplay({ signatures, className, onSelectSignature }: SignatureDisplayProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-medium">Approval Status</h3>
      <div className="space-y-3">
        {signatures.map((signature, index) => (
          <div
            key={signature.id}
            className={cn(
              "flex items-center justify-between p-3 border rounded-md",
              signature.status === "approved" && "bg-green-50 border-green-200",
              signature.status === "rejected" && "bg-red-50 border-red-200",
              onSelectSignature && signature.status === "pending" && "cursor-pointer hover:bg-muted",
            )}
            onClick={() => onSelectSignature && onSelectSignature(index)}
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={signature.avatar} alt={signature.name} />
                <AvatarFallback>{signature.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{signature.name}</p>
                <p className="text-xs text-muted-foreground">{signature.role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {signature.status === "pending" ? (
                <div className="flex items-center text-yellow-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-xs">Pending</span>
                </div>
              ) : signature.status === "approved" ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">
                    Approved {signature.timestamp && new Date(signature.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs">
                    Rejected {signature.timestamp && new Date(signature.timestamp).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
