export interface Bid {
  id: string
  claimId: string
  vehicleInfo: {
    make: string
    model: string
    year: string
    licensePlate: string
    vin: string
  }
  damageDescription: string
  scopeOfWork: string[]
  estimatedCost: number
  photos: string[]
  documents: string[]
  status: "open" | "in-progress" | "awarded" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
  createdBy: string
  interestedGarages: string[]
  submissions: BidSubmission[]
  awardedTo?: string
  completedAt?: string
  activities: BidActivity[]
}

export interface BidSubmission {
  id: string
  bidId: string
  garageId: string
  garageName: string
  costBreakdown: {
    item: string
    cost: number
    description: string
  }[]
  totalCost: number
  estimatedCompletionTime: {
    value: number
    unit: "days" | "weeks"
  }
  notes: string
  submittedAt: string
  status: "pending" | "accepted" | "rejected"
}

export interface BidActivity {
  id: string
  bidId: string
  activityType:
    | "bid_created"
    | "bid_updated"
    | "garage_interested"
    | "inspection_scheduled"
    | "bid_submitted"
    | "bid_awarded"
    | "bid_completed"
    | "bid_cancelled"
  description: string
  performedBy: {
    id: string
    name: string
    role: string
  }
  timestamp: string
  metadata?: Record<string, any>
}

export interface InspectionSchedule {
  id: string
  bidId: string
  garageId: string
  scheduledDate: string
  scheduledTime: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  createdAt: string
}
